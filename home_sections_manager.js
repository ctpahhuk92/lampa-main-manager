export default {
    id: 'mainPageEditor',
    name: 'Main Page Editor',
    description: 'Управление разделами главной страницы Lampa',
    version: '1.0',
    icon: 'fas fa-th-large',

    async ready() {
        // Проверяем, что объект Lampa доступен
        if (!window.Lampa) return;

        // Получаем текущие разделы через API Lampa
        const sections = window.Lampa?.main?.sections || [];

        // Хранилище настроек
        const storage = window.Lampa?.storage || {};
        let savedOrder = storage.get('mainSectionsOrder') || sections.map(s => s.id);
        let savedHidden = storage.get('mainSectionsHidden') || {};

        // Создаем UI в настройках
        const container = document.createElement('div');
        container.style.padding = '10px';

        container.innerHTML = '<h3>Main Page Editor</h3><div id="mpe_controls"></div>';
        document.body.appendChild(container);

        const controls = container.querySelector('#mpe_controls');

        // Создаем элемент управления для каждого раздела
        savedOrder.forEach(id => {
            const section = sections.find(s => s.id === id);
            if (!section) return;

            const div = document.createElement('div');
            div.style.marginBottom = '8px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = !savedHidden[id];
            checkbox.addEventListener('change', () => {
                savedHidden[id] = !checkbox.checked;
                storage.set('mainSectionsHidden', savedHidden);
                this.applySettings(sections, savedOrder, savedHidden);
            });

            const up = document.createElement('button');
            up.textContent = '↑';
            up.onclick = () => {
                const index = savedOrder.indexOf(id);
                if (index > 0) {
                    [savedOrder[index], savedOrder[index - 1]] = [savedOrder[index - 1], savedOrder[index]];
                    storage.set('mainSectionsOrder', savedOrder);
                    this.applySettings(sections, savedOrder, savedHidden);
                }
            };

            const down = document.createElement('button');
            down.textContent = '↓';
            down.onclick = () => {
                const index = savedOrder.indexOf(id);
                if (index < savedOrder.length - 1) {
                    [savedOrder[index], savedOrder[index + 1]] = [savedOrder[index + 1], savedOrder[index]];
                    storage.set('mainSectionsOrder', savedOrder);
                    this.applySettings(sections, savedOrder, savedHidden);
                }
            };

            div.appendChild(checkbox);
            div.appendChild(document.createTextNode(' ' + section.name));
            div.appendChild(up);
            div.appendChild(down);

            controls.appendChild(div);
        });

        // Применяем настройки
        this.applySettings(sections, savedOrder, savedHidden);
    },

    // Функция применения настроек через Lampa API
    applySettings(sections, order, hidden) {
        sections.forEach((sect) => {
            try {
                // Скрыть или показать раздел
                window.Lampa.main.setSectionHidden(sect.id, Boolean(hidden[sect.id]));

                // Поменять порядок (если Lampa API позволяет)
                window.Lampa.main.setSectionOrder(sect.id, order.indexOf(sect.id));
            } catch (e) {
                console.warn('MainPageEditor: невозможно применить для', sect.id);
            }
        });
    }
};
