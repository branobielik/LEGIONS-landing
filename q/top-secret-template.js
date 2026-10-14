(() => {
    const buttons = Array.from(document.querySelectorAll("[data-report-target]"));
    const pages = Array.from(document.querySelectorAll("[data-report-page]"));

    if (!buttons.length || !pages.length) {
        return;
    }

    function activateReportPage(name, focus = false) {
        buttons.forEach((button) => {
            const active = button.dataset.reportTarget === name;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
            if (active && focus) {
                button.focus();
            }
        });

        pages.forEach((page) => {
            page.classList.toggle("is-active", page.dataset.reportPage === name);
        });
    }

    buttons.forEach((button, index) => {
        button.setAttribute(
            "aria-pressed",
            String(button.classList.contains("is-active"))
        );

        button.addEventListener("click", () => {
            activateReportPage(button.dataset.reportTarget);
        });

        button.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                return;
            }

            event.preventDefault();
            const direction = event.key === "ArrowRight" ? 1 : -1;
            const target = (index + direction + buttons.length) % buttons.length;
            activateReportPage(buttons[target].dataset.reportTarget, true);
        });
    });

    document.querySelectorAll("[data-landscape-src]").forEach((button) => {
        button.addEventListener("click", async () => {
            const frame = button.closest(".capture-frame");
            const imageUrl = button.dataset.landscapeSrc;

            try {
                if (frame?.requestFullscreen) {
                    await frame.requestFullscreen();
                    if (screen.orientation?.lock) {
                        await screen.orientation.lock("landscape");
                    }
                    return;
                }
            } catch {
                // Orientation locking is not supported by every mobile browser.
            }

            if (imageUrl) {
                window.open(imageUrl, "_blank", "noopener");
            }
        });
    });
})();
