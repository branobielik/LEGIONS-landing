(() => {
    const tabs = Array.from(document.querySelectorAll("[role='tab']"));
    const panels = Array.from(document.querySelectorAll("[role='tabpanel']"));

    if (!tabs.length || !panels.length) {
        return;
    }

    const panelIds = new Set(panels.map((panel) => panel.id));

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
        activate(`panel-${location.hash.slice(1)}`, false);
    });

    const requestedPanel = `panel-${location.hash.slice(1)}`;
    activate(panelIds.has(requestedPanel) ? requestedPanel : "panel-profile");
})();
