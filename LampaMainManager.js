{\rtf1\ansi\ansicpg1251\cocoartf2639
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 (function () \{\
    'use strict';\
\
    if (!window.Lampa) return;\
\
    const STORAGE_KEY = 'home_sections_manager';\
    const DEFAULTS = \{\
        sections: \{\},\
        order: [],\
        merge_enabled: false,\
        merge_title: '\uc0\u1052 \u1086 \u1081  \u1087 \u1088 \u1086 \u1089 \u1084 \u1086 \u1090 \u1088 '\
    \};\
\
    function getConfig() \{\
        return Object.assign(\{\}, DEFAULTS, Lampa.Storage.get(STORAGE_KEY, \{\}));\
    \}\
\
    function setConfig(cfg) \{\
        Lampa.Storage.set(STORAGE_KEY, cfg);\
    \}\
\
    function getHomeSections() \{\
        return Array.from(document.querySelectorAll('.items-line'))\
            .map((el, index) => \{\
                const titleEl = el.closest('.items')?.querySelector('.items__title');\
                const title = titleEl ? titleEl.textContent.trim() : `\uc0\u1056 \u1072 \u1079 \u1076 \u1077 \u1083  $\{index + 1\}`;\
                const id = 'section_' + index;\
\
                return \{ id, title, el \};\
            \});\
    \}\
\
    function applyVisibilityAndOrder() \{\
        const cfg = getConfig();\
        const sections = getHomeSections();\
\
        const container = sections[0]?.el?.parentElement;\
        if (!container) return;\
\
        sections.forEach(s => s.el.parentElement.style.display = 'none');\
\
        let ordered = cfg.order.length\
            ? cfg.order.map(id => sections.find(s => s.id === id)).filter(Boolean)\
            : sections;\
\
        ordered.forEach(s => \{\
            const visible = cfg.sections[s.id]?.visible !== false;\
            if (!visible) return;\
\
            s.el.parentElement.style.display = '';\
            container.appendChild(s.el.parentElement);\
        \});\
\
        if (cfg.merge_enabled) mergeSections(sections);\
    \}\
\
    function mergeSections(sections) \{\
        if (sections.length < 2) return;\
\
        const a = sections[0];\
        const b = sections[1];\
\
        const merged = document.createElement('div');\
        merged.className = 'items';\
\
        const title = document.createElement('div');\
        title.className = 'items__title';\
        title.textContent = getConfig().merge_title;\
\
        const line = document.createElement('div');\
        line.className = 'items-line';\
\
        [...a.el.children, ...b.el.children].forEach(card => \{\
            line.appendChild(card.cloneNode(true));\
        \});\
\
        merged.appendChild(title);\
        merged.appendChild(line);\
\
        a.el.parentElement.after(merged);\
        a.el.parentElement.style.display = 'none';\
        b.el.parentElement.style.display = 'none';\
    \}\
\
    function openSettings() \{\
        const cfg = getConfig();\
        const sections = getHomeSections();\
\
        Lampa.Modal.open(\{\
            title: '\uc0\u1043 \u1083 \u1072 \u1074 \u1085 \u1072 \u1103  \u1089 \u1090 \u1088 \u1072 \u1085 \u1080 \u1094 \u1072 ',\
            html: `\
                <div class="settings">\
                    <label>\
                        <input type="checkbox" id="merge_sections" $\{cfg.merge_enabled ? 'checked' : ''\}>\
                        \uc0\u1054 \u1073 \u1098 \u1077 \u1076 \u1080 \u1085 \u1103 \u1090 \u1100  \u1087 \u1077 \u1088 \u1074 \u1099 \u1077  \u1076 \u1074 \u1072  \u1088 \u1072 \u1079 \u1076 \u1077 \u1083 \u1072 \
                    </label>\
                    <br><br>\
                    $\{sections.map(s => `\
                        <label>\
                            <input type="checkbox" data-id="$\{s.id\}" $\{cfg.sections[s.id]?.visible !== false ? 'checked' : ''\}>\
                            $\{s.title\}\
                        </label>\
                    `).join('<br>')\}\
                </div>\
            `,\
            onClose: () => applyVisibilityAndOrder()\
        \});\
\
        setTimeout(() => \{\
            document.querySelectorAll('[data-id]').forEach(chk => \{\
                chk.onchange = () => \{\
                    cfg.sections[chk.dataset.id] = \{ visible: chk.checked \};\
                    setConfig(cfg);\
                \};\
            \});\
\
            const merge = document.getElementById('merge_sections');\
            if (merge) \{\
                merge.onchange = () => \{\
                    cfg.merge_enabled = merge.checked;\
                    setConfig(cfg);\
                \};\
            \}\
        \}, 100);\
    \}\
\
    Lampa.Listener.follow('app', (e) => \{\
        if (e.type === 'ready') \{\
            setTimeout(applyVisibilityAndOrder, 1500);\
        \}\
    \});\
\
    Lampa.Settings.add(\{\
        title: '\uc0\u1043 \u1083 \u1072 \u1074 \u1085 \u1072 \u1103  \u1089 \u1090 \u1088 \u1072 \u1085 \u1080 \u1094 \u1072 ',\
        onClick: openSettings\
    \});\
\
\})();}