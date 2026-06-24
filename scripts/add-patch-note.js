#!/usr/bin/env node
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '..', 'patch-notes.js');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

function todayDDMMYYYY() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
}

function formatEntry(entry) {
    return `    {\n        id: '${entry.id}',\n        date: '${entry.date}',\n        title: { es: '${entry.title.es}', en: '${entry.title.en}' },\n        body:  { es: '${entry.body.es}', en: '${entry.body.en}' },\n    }`;
}

async function main() {
    console.log('\n=== Añadir Patch Note ===\n');

    const today = todayDDMMYYYY();

    const id    = await ask('ID (slug sin espacios):  ');
    const date  = await ask(`Fecha [${today}]:         `) || today;
    const titleEs = await ask('Título ES:              ');
    const bodyEs  = await ask('Cuerpo ES:              ');
    const titleEn = await ask('Título EN:              ');
    const bodyEn  = await ask('Cuerpo EN:              ');

    rl.close();

    const entry = {
        id: id.trim(),
        date: date.trim(),
        title: { es: titleEs.trim(), en: titleEn.trim() },
        body:  { es: bodyEs.trim(),  en: bodyEn.trim()  },
    };

    const raw = fs.readFileSync(FILE, 'utf8');

    // Insert before closing ];
    const insertAt = raw.lastIndexOf('];');
    if (insertAt === -1) {
        console.error('No se encontró ]; en patch-notes.js');
        process.exit(1);
    }

    const before = raw.slice(0, insertAt).trimEnd().replace(/,$/, '');
    const newRaw = `${before},\n${formatEntry(entry)},\n];\n`;

    fs.writeFileSync(FILE, newRaw, 'utf8');
    console.log(`\n✓ Patch note '${entry.id}' añadida (${entry.date})\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
