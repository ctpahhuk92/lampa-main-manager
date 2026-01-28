(function () {
    'use strict';

    if (!window.Lampa) return;

    const STORAGE = 'home_sections_manager_cfg';

    function load() {
        return Lampa.Storage.get(STORAGE, {
            hidden: {},
            order: [],
            merge: true
        });
    }

    function save(cfg) {
        Lampa.Storage.set(STORAGE, cfg);
    }

    function sections() {
        return Array.from(document.querySelectorAll('.items')).map((el, i) => {
            const title = el.querySelector('.items__title');
            const line  = el.querySelector('.items-line');
            if (!line) return null;

            return {
                id: 'sec_' + i,
                title: title ? title.textContent.trim() : 'Раздел ' + (i + 1),
                el,
                line
            };
        }).filter(Boolean);
    }

    function apply() {
        const cfg = load();
        const list = sections();
        if (!list.length) return;

        list.forEach(s => {
            s.el.style.display = cfg.hidden[s.id] ? 'none' : '';
        });

        const parent = list[0].el.parentElement;
        if (!parent) return;

        const ordered = cfg.order.length
            ? cfg.order.map(id => list.find(s => s.id === id)).filter(Boolean)
            : list;

        ordered.forEach(s => parent.appendChild(s.el));

        if (cfg.merge && list.length >= 2) merge(list[0], list[1]);
    }

    function merge(a, b) {
        if (a.el.dataset.merged) return;

        const wrap = document.createElement('div');
        wrap.className = 'items';
        wrap.dataset.merged = '1';

        const title = document.createElement('div');
        title.className = 'items__title';
        title.textContent = a.title + ' + ' + b.title;

        const line = document.createElement('div');
        line.className = 'items-line';

        [...a.line.children, ...b.line.children].forEach(c => {
            line.appendChild(c.cloneNode(true));
        });

        wrap.appendChild(title);
        wrap.appendChild(line);

        b.el.after(wrap);
        a.el.style.display = 'none';
        b.el.style.display = 'none';
    }

    function settings() {
        const cfg = load();
        const list = sections();

        let html = `
            <label style="display:block;margin-bottom:10px">
                <input type="checkbox" id="merge" ${cfg.merge ? 'checked' : ''}>
                Объединять первые два раздела
            </label>
            <hr>
        `;

        list.forEach(s => {
            html += `
                <label style="display:block;margin:6px 0">
                    <input type="checkbox" data-id="${s.id}" ${!cfg.hidden[s.id] ? 'checked' : ''}>
                    ${s.title}
                </label>
            `;
        });

        Lampa.Modal.open({
            title: 'Главная страница',
            html
        });

        setTimeout(() => {
            document.getElementById('merge').onchange = e => {
                cfg.merge = e.target.checked;
                save(cfg);
                apply();
            };

            document.querySelectorAll('[data-id]').forEach(el => {
                el.onchange = () => {
                    cfg.hidden[el.dataset.id] = !el.checked;
                    save(cfg);
                    apply();
                };
            });
        }, 100);
    }

    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') {
            setTimeout(apply, 2000);

            Lampa.Settings.add({
                title: 'Главная страница',
                onClick: settings
            });
        }
    });
})();
