(() => {
    const tabs = Array.from(document.querySelectorAll("[role='tab']"));
    const panels = Array.from(document.querySelectorAll("[role='tabpanel']"));

    if (!tabs.length || !panels.length) {
        return;
    }

    const panelIds = new Set(panels.map((panel) => panel.id));
    const legacyPanels = {
        "panel-field-capture": "panel-top-secret",
        "panel-blueprint": "panel-classified"
    };

    function activate(panelId, updateHash = true) {
        if (!panelIds.has(panelId)) {
            panelId = tabs[0].getAttribute("aria-controls");
        }

        tabs.forEach((tab) => {
            const selected = tab.getAttribute("aria-controls") === panelId;
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });

        panels.forEach((panel) => {
            const active = panel.id === panelId;
            panel.hidden = !active;
            panel.classList.toggle("is-active", active);
        });

        if (updateHash) {
            history.replaceState(null, "", `#${panelId.replace("panel-", "")}`);
        }
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            activate(tab.getAttribute("aria-controls"));
        });

        tab.addEventListener("keydown", (event) => {
            let targetIndex = index;

            if (event.key === "ArrowRight") {
                targetIndex = (index + 1) % tabs.length;
            } else if (event.key === "ArrowLeft") {
                targetIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (event.key === "Home") {
                targetIndex = 0;
            } else if (event.key === "End") {
                targetIndex = tabs.length - 1;
            } else {
                return;
            }

            event.preventDefault();
            tabs[targetIndex].focus();
            activate(tabs[targetIndex].getAttribute("aria-controls"));
        });
    });

    window.addEventListener("hashchange", () => {
        const requested = `panel-${location.hash.slice(1)}`;
        activate(legacyPanels[requested] || requested, false);
    });

    const requestedPanel = `panel-${location.hash.slice(1)}`;
    const initialPanel = legacyPanels[requestedPanel] || requestedPanel;
    activate(panelIds.has(initialPanel) ? initialPanel : "panel-profile");

    document.querySelectorAll("[data-classified-gallery]").forEach((gallery) => {
        const buttons = Array.from(gallery.querySelectorAll("[data-classified-target]"));
        const records = Array.from(gallery.querySelectorAll("[data-classified-record]"));

        function showRecord(recordId) {
            buttons.forEach((button) => {
                const active = button.dataset.classifiedTarget === recordId;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            records.forEach((record) => {
                const active = record.dataset.classifiedRecord === recordId;
                record.hidden = !active;
                record.classList.toggle("is-active", active);
                if (active) {
                    const image = record.querySelector("img");
                    if (image) {
                        const source = image.dataset.classifiedSrc || image.getAttribute("src");
                        image.dataset.classifiedSrc = source;
                        requestAnimationFrame(() => {
                            const separator = source.includes("?") ? "&" : "?";
                            image.src = `${source}${separator}view=${Date.now()}`;
                        });
                    }
                }
            });
        }

        function showNextRecord() {
            const activeIndex = records.findIndex((record) => record.classList.contains("is-active"));
            const next = records[(activeIndex + 1) % records.length];
            if (next) showRecord(next.dataset.classifiedRecord);
        }

        buttons.forEach((button) => {
            button.addEventListener("click", () => showRecord(button.dataset.classifiedTarget));
        });
        records.forEach((record) => {
            record.querySelector("img")?.addEventListener("dblclick", showNextRecord);
        });
    });
})();
