(() => {
    const intelItems = Array.from(document.querySelectorAll("[data-intel]"));
    const scanButton = document.querySelector("[data-scan]");
    const unlockedCount = document.querySelector("[data-unlocked-count]");
    const confidence = document.querySelector("[data-confidence]");
    const meter = document.querySelector("[data-meter]");
    const resultDialog = document.querySelector("[data-result]");
    const saveDialog = document.querySelector("[data-save-dialog]");
    const storageKey = "legions-story-prototype";
    let unlocked = 0;

    const confidenceLabels = [
        "Unverified",
        "Partial pattern",
        "Strong hypothesis",
        "Pattern confirmed"
    ];

    function saveState() {
        try {
            localStorage.setItem(storageKey, JSON.stringify({ unlocked }));
        } catch {
            // The visual prototype remains usable when storage is unavailable.
        }
    }

    function renderIntel() {
        intelItems.forEach((item, index) => {
            item.classList.toggle("is-unlocked", index < unlocked);
        });
        unlockedCount.textContent = String(unlocked);
        confidence.textContent = confidenceLabels[unlocked];
        meter.style.width = `${(unlocked / intelItems.length) * 100}%`;

        if (unlocked >= intelItems.length) {
            scanButton.querySelector("strong").textContent = "All evidence recovered";
            scanButton.querySelector("small").textContent = "Intel Matrix is ready for analysis";
        } else {
            scanButton.querySelector("strong").textContent = "Simulate card scan";
            scanButton.querySelector("small").textContent = "Prototype: unlock the next visual clue";
        }
    }

    function unlockNext() {
        if (unlocked < intelItems.length) {
            unlocked += 1;
            renderIntel();
            saveState();
            intelItems[unlocked - 1].scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    }

    function showResult(path) {
        const isCorrect = path === "scientists";
        resultDialog.querySelector("[data-result-code]").textContent = isCorrect
            ? "OUTCOME // MISSION CONTINUES"
            : "OUTCOME // CRITICAL FAILURE";
        resultDialog.querySelector("[data-result-title]").textContent = isCorrect
            ? "Silence gets the team inside."
            : "The mountain heard them coming.";
        resultDialog.querySelector("[data-result-copy]").textContent = isCorrect
            ? "Aki replaces the soldiers with a small scientific team. Near the disturbance, their instruments detect an acoustic grid hidden beneath the rock—and a signal that should not exist on Earth."
            : "The security unit’s heavy equipment activates a concealed detection array. Unknown figures reach the expedition before Aki can collect a single reading.";
        resultDialog.querySelector("[data-result-path]").textContent = isCorrect
            ? "Investigation"
            : "Compromised";
        resultDialog.querySelector("[data-result-intel]").textContent =
            `${unlocked} / ${intelItems.length}`;
        resultDialog.showModal();
    }

    scanButton?.addEventListener("click", unlockNext);
    document.querySelector("[data-open-intel]")?.addEventListener("click", () => {
        document.querySelector(".intel-panel")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    document.querySelectorAll("[data-choice]").forEach((button) => {
        button.addEventListener("click", () => showResult(button.dataset.choice));
    });

    document.querySelector("[data-close-result]")?.addEventListener("click", () => {
        resultDialog.close();
    });

    document.querySelector("[data-open-save]")?.addEventListener("click", () => {
        saveDialog.showModal();
    });

    document.querySelector("[data-close-save]")?.addEventListener("click", () => {
        saveDialog.close();
    });

    document.querySelector("[data-reset]")?.addEventListener("click", () => {
        unlocked = 0;
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // Nothing else is required for reset.
        }
        renderIntel();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    [resultDialog, saveDialog].forEach((dialog) => {
        dialog?.addEventListener("click", (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });
    });

    try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
        unlocked = Math.max(0, Math.min(intelItems.length, Number(stored.unlocked) || 0));
    } catch {
        unlocked = 0;
    }

    renderIntel();
})();
