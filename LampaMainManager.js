(function () {
    'use strict';

    if (!window.Lampa) return;

    const STORAGE_KEY = 'home_sections_manager_v1';

    function safe(fn) {
        try { fn(); } catch (e) { console.log('[HSM]', e); }
    }

    function getConfig() {
        return Lampa.Storage.get(STORAGE_KEY, {
            sections: {},
            order: [],
            merge: false
        });
    }

    function setConfig(cfg) {
        Lampa.Storage.set(STORAGE_KEY, cfg);
    }

    function getSections() {
        return Array.from(document.querySelectorAll('.items'))
            .map((wrap, i) => {
                const line = wrap.querySelector('.items-line');
                if (!line) return null;

                const title = wrap.querySelector('.items__title')?.innerText || `Раздел ${i + 1}`;

                return {
                    id: 'sec_' + i,
                    title,
                    wrap,
                    line
                };
            })
            .filter(Boolean);
    }

    function apply() {
        safe(() => {
            const cfg = getConfig();
            const sections = getSections();
            if (!sections.length) return;

            sections.forEach(s => {
                const visible = cfg.sections[s.id] !== false;
                s.wrap.style.display = visible ? '' : 'none';
            });
        });
    }

    function openSettings() {
        safe(() => {
            const cfg = getConfig();
            const sections = getSections();

            let html = sections.map(s => `
                <label style="display:block;margin:8px 0">
                    <input type="checkbox" data-id="${s.id}" ${cfg.sections[s.id] !== false ? 'checked' : ''}>
                    ${s.title}
                </label>
            `).join('');

            Lampa.Modal.open({
                title: 'Главная страница',
                html
            });

            setTimeout(() => {
                document.querySelectorAll('[data-id]').forEach(el => {
                    el.onchange = () => {
                        cfg.sections[el.dataset.id] = el.checked;
                        setConfig(cfg);
                        apply();
                    };
                });
            }, 100);
        });
    }

    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') {
            setTimeout(apply, 2000);

            Lampa.Settings.add({
                title: 'Главная страница',
                onClick: openSettings
            });
        }
    });

})();
