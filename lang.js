let currentLang = localStorage.getItem('ptv_lang') || 'es';

function setLangBase(lang) {
    currentLang = lang;
    localStorage.setItem('ptv_lang', lang);
}
