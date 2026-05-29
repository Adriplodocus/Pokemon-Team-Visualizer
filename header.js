(function () {
    const pages = [
        { id: 'pokemon',  href: 'index.html',    i18n: 'pokemonMode',  label: 'Pokémon' },
        { id: 'cemetery', href: 'cemetery.html', i18n: 'cemeteryMode', label: 'Cementerio' },
        { id: 'badges',   href: 'badges.html',   i18n: 'badgeMode',    label: 'Medallas' },
        { id: 'types',    href: 'types.html',    i18n: 'typesMode',    label: 'Tabla de tipos' },
    ];

    const tabs = pages.map(p =>
        `<a href="${p.href}" id="mode-btn-${p.id}" class="mode-btn${ACTIVE_PAGE === p.id ? ' active' : ''}" data-i18n-badge="${p.i18n}">${p.label}</a>`
    ).join('\n            ');

    const extId    = sessionStorage.getItem('ptv_external_id');
    const extBadge = sessionStorage.getItem('ptv_external_badge_id');
    const shortId  = extId ? extId.slice(0, 8) : extBadge ? extBadge.slice(0, 8) : null;
    const extBar   = shortId
        ? `<div id="external-mode-bar" class="external-mode-bar">
        <span>Controlando canal externo &middot; <code>${shortId}</code></span>
        <button onclick="exitExternalMode()">&#x2715; Salir</button>
    </div>`
        : '';

    document.body.insertAdjacentHTML('afterbegin', `
<header>
    <h1>Pokémon Stream Visualizer by <a href="https://mrklypp.com/" target="_blank" rel="noopener" class="header-brand">MrKlypp</a></h1>
    <p class="subtitle">La herramienta definitiva para gestionar tu overlay de pokémon</p>
    <p class="header-error">Si encuentras algún error, <a href="mailto:MrKlypp@gmail.com">escríbeme</a>.</p>
    ${extBar}
    <div class="header-controls-row">
        <div class="mode-toggle">
            ${tabs}
        </div>
        <div class="lang-toggle">
            <button id="lang-es" onclick="setLang('es')">ES</button>
            <button id="lang-en" onclick="setLang('en')">EN</button>
        </div>
    </div>
</header>`);
})();

function exitExternalMode() {
    sessionStorage.removeItem('ptv_external_id');
    sessionStorage.removeItem('ptv_external_badge_id');
    window.location.href = 'index.html';
}
