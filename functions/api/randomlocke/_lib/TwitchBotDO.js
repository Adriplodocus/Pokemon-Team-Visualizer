import { neon } from '@neondatabase/serverless';

function getDB(env) {
    return neon(env.DATABASE_URL);
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export class TwitchBotDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.ws = null;
    }

    async fetch(request) {
        const url = new URL(request.url);

        if (url.pathname === '/connect') {
            const { channel, userId } = await request.json();
            await this.state.storage.put('connected', true);
            await this.state.storage.put('channel', channel);
            await this.state.storage.put('userId', userId);
            await this.connect(channel, userId);
            this.scheduleAlarm();
            return jsonResponse({ ok: true });
        }

        if (url.pathname === '/disconnect') {
            await this.state.storage.put('connected', false);
            await this.state.storage.deleteAlarm();
            this.disconnect();
            return jsonResponse({ ok: true });
        }

        if (url.pathname === '/status') {
            const connected = await this.state.storage.get('connected') || false;
            const channel = await this.state.storage.get('channel') || null;
            const wsOpen = this.ws !== null && this.ws.readyState === WebSocket.OPEN;
            return jsonResponse({ connected: connected && wsOpen, channel });
        }

        return new Response('Not found', { status: 404 });
    }

    async alarm() {
        const connected = await this.state.storage.get('connected');
        if (!connected) return;

        try {
            const channel = await this.state.storage.get('channel');
            const userId = await this.state.storage.get('userId');
            if (channel && userId) {
                const wsOpen = this.ws !== null && this.ws.readyState === WebSocket.OPEN;
                if (!wsOpen) {
                    await this.connect(channel, userId);
                } else {
                    this.ws.send('PING :tmi.twitch.tv');
                }
            }
        } catch (e) {
            console.error('Alarm reconnect error', e);
        } finally {
            this.scheduleAlarm();
        }
    }

    scheduleAlarm() {
        this.state.storage.setAlarm(Date.now() + 2 * 60 * 1000);
    }

    async getBotToken() {
        try {
            const sql = getDB(this.env);
            const rows = await sql`
                SELECT access_token, refresh_token
                FROM bot_global_token
                ORDER BY updated_at DESC
                LIMIT 1
            `;
            if (rows.length) return rows[0];
        } catch (e) {
            console.error('Failed to get bot token from DB', e);
        }
        // Fall back to env secrets (initial seed)
        return {
            access_token: this.env.BOT_ACCESS_TOKEN,
            refresh_token: this.env.BOT_REFRESH_TOKEN,
        };
    }

    async refreshToken(oldRefreshToken) {
        const res = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type:    'refresh_token',
                refresh_token: oldRefreshToken,
                client_id:     this.env.TWITCH_CLIENT_ID,
                client_secret: this.env.TWITCH_CLIENT_SECRET,
            }),
        });

        if (!res.ok) {
            console.error('Token refresh failed', res.status, await res.text());
            return null;
        }

        const { access_token, refresh_token } = await res.json();

        // Persist refreshed token to DB
        try {
            const sql = getDB(this.env);
            await sql`
                UPDATE bot_global_token
                SET access_token = ${access_token},
                    refresh_token = ${refresh_token},
                    updated_at = NOW()
                WHERE id = (SELECT id FROM bot_global_token ORDER BY updated_at DESC LIMIT 1)
            `;
        } catch (e) {
            console.error('Failed to persist refreshed token', e);
        }

        return { access_token, refresh_token };
    }

    async connect(channel, userId) {
        this.disconnect();

        const { access_token, refresh_token } = await this.getBotToken();
        const botUsername = this.env.BOT_USERNAME;

        const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
        this.ws = ws;

        ws.addEventListener('open', () => {
            ws.send(`PASS oauth:${access_token}`);
            ws.send(`NICK ${botUsername}`);
            ws.send(`JOIN #${channel}`);
        });

        ws.addEventListener('message', async (event) => {
            const lines = event.data.split('\r\n').filter(l => l.trim());
            for (const line of lines) {
                await this.handleMessage(line, channel, userId, refresh_token);
            }
        });

        ws.addEventListener('close', () => {
            if (this.ws === ws) this.ws = null;
        });

        ws.addEventListener('error', (e) => {
            console.error('IRC WebSocket error', e);
            if (this.ws === ws) this.ws = null;
        });
    }

    disconnect() {
        if (this.ws) {
            try { this.ws.close(); } catch {}
            this.ws = null;
        }
    }

    async handleMessage(raw, channel, userId, refreshToken) {
        if (raw.startsWith('PING')) {
            this.ws?.send('PONG :tmi.twitch.tv');
            return;
        }

        // Handle auth failure: reconnect with refreshed token
        if (raw.includes('NOTICE') && raw.includes('Login authentication failed')) {
            console.error('Bot auth failed — refreshing token');
            const newTokens = await this.refreshToken(refreshToken);
            if (newTokens) await this.connect(channel, userId);
            return;
        }

        // :username!username@username.tmi.twitch.tv PRIVMSG #channel :message
        const match = raw.match(/^:[\w-]+![\w-]+@[\w-]+\.tmi\.twitch\.tv PRIVMSG #[\w-]+ :(.+)$/);
        if (!match) return;

        const text = match[1].trim();
        const checkMatch = text.match(/^!check\s+(.+)$/i);
        if (!checkMatch) return;

        const zone = checkMatch[1].trim();
        await this.checkZone(zone, channel, userId);
    }

    async checkZone(zone, channel, userId) {
        const normalized = zone.toLowerCase().replace(/\s+/g, '');
        let found = false;
        try {
            const sql = getDB(this.env);
            const rows = await sql`
                SELECT id FROM randomlocke_routes
                WHERE user_id = ${userId}
                  AND lower(replace(zone_name, ' ', '')) = ${normalized}
            `;
            found = rows.length > 0;
        } catch (e) {
            console.error('DB error in checkZone', e);
            return;
        }

        const msg = found
            ? `❌ NO puedes capturar en ${zone}.`
            : `✅ SÍ puedes capturar en ${zone}.`;

        this.ws?.send(`PRIVMSG #${channel} :${msg}`);
    }
}
