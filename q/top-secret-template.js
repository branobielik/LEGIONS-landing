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
            const enabled = buttons.filter((item) => !item.disabled);
            const enabledIndex = enabled.indexOf(button);
            const target = (
                enabledIndex + direction + enabled.length
            ) % enabled.length;
            activateReportPage(enabled[target].dataset.reportTarget, true);
        });
    });

    document.querySelectorAll("[data-landscape-src]").forEach((button) => {
        const frame = button.closest(".capture-frame");
        const image = frame?.querySelector(":scope > img");
        const exitButton = frame?.querySelector(".capture-exit-fullscreen");
        let fallbackPlaceholder = null;

        button.addEventListener("click", async () => {
            let enteredFullscreen = false;

            try {
                if (frame?.requestFullscreen) {
                    await frame.requestFullscreen();
                    enteredFullscreen = document.fullscreenElement === frame;
                }
            } catch {
                enteredFullscreen = false;
            }

            if (enteredFullscreen) {
                try {
                    if (screen.orientation?.lock) {
                        await screen.orientation.lock("landscape");
                    }
                } catch {
                    // Fullscreen still works when orientation locking is unavailable.
                }
                return;
            }

            if (frame) {
                fallbackPlaceholder = document.createComment("capture-frame-placeholder");
                frame.parentNode?.insertBefore(fallbackPlaceholder, frame);
                document.body.appendChild(frame);
                frame.classList.add("is-expanded-fallback");
                document.body.classList.add("capture-fallback-open");
            }
        });

        async function exitCaptureFullscreen() {
            try {
                frame?.classList.remove("is-expanded-fallback");
                document.body.classList.remove("capture-fallback-open");
                if (fallbackPlaceholder?.parentNode && frame) {
                    fallbackPlaceholder.parentNode.insertBefore(frame, fallbackPlaceholder);
                    fallbackPlaceholder.remove();
                    fallbackPlaceholder = null;
                }
                if (document.fullscreenElement === frame && document.exitFullscreen) {
                    await document.exitFullscreen();
                }
            } catch {
                // Some embedded browsers handle fullscreen exit themselves.
            }
        }

        image?.addEventListener("click", () => {
            exitCaptureFullscreen();
        });

        image?.addEventListener("dblclick", (event) => {
            event.preventDefault();
            exitCaptureFullscreen();
        });

        exitButton?.addEventListener("click", (event) => {
            event.stopPropagation();
            exitCaptureFullscreen();
        });
    });

    document.addEventListener("fullscreenchange", () => {
        try {
            if (!document.fullscreenElement && screen.orientation?.unlock) {
                screen.orientation.unlock();
            }
        } catch {
            // Orientation APIs are optional.
        }
    });

    const scanScale = 2.15;
    const scanStates = [];

    document.querySelectorAll(".report-scan[data-scan-hitboxes]").forEach((figure) => {
        const image = figure.querySelector("img");
        const instruction = figure.querySelector(".scan-instruction");
        const feedback = figure.querySelector(".scan-feedback");
        const reset = figure.querySelector(".scan-reset");
        const fullscreen = figure.querySelector(".scan-fullscreen");
        let hitboxes;

        try {
            hitboxes = JSON.parse(figure.dataset.scanHitboxes);
        } catch {
            return;
        }
        if (!image || !feedback || !reset || !Array.isArray(hitboxes)) {
            return;
        }

        const state = {
            figure,
            image,
            feedback,
            instruction,
            reset,
            hitboxes,
            originX: 50,
            originY: 50,
            target: null,
            targetElement: null,
            lastTap: null,
            token: 0,
            zoomed: false
        };
        scanStates.push(state);

        function originalPoint(clientX, clientY) {
            const bounds = figure.getBoundingClientRect();
            let x = clientX - bounds.left;
            let y = clientY - bounds.top;
            if (state.zoomed) {
                const originX = (state.originX / 100) * bounds.width;
                const originY = (state.originY / 100) * bounds.height;
                x = originX + (x - originX) / scanScale;
                y = originY + (y - originY) / scanScale;
            }
            return {
                x: Math.max(0, Math.min(100, (x / bounds.width) * 100)),
                y: Math.max(0, Math.min(100, (y / bounds.height) * 100))
            };
        }

        function matchingTarget(point) {
            return hitboxes.find((box) =>
                point.x >= box.x
                && point.x <= box.x + box.width
                && point.y >= box.y
                && point.y <= box.y + box.height
            ) || null;
        }

        function removeTarget() {
            state.targetElement?.remove();
            state.targetElement = null;
            state.target = null;
        }

        function positionTarget() {
            if (!state.target || !state.targetElement) return;
            const width = figure.clientWidth;
            const height = figure.clientHeight;
            const originX = (state.originX / 100) * width;
            const originY = (state.originY / 100) * height;
            const box = state.target;
            const centerX = ((box.x + box.width / 2) / 100) * width;
            const centerY = ((box.y + box.height / 2) / 100) * height;
            const transformedX = originX + scanScale * (centerX - originX);
            const transformedY = originY + scanScale * (centerY - originY);
            const measuredSize = Math.max(
                (box.width / 100) * width,
                (box.height / 100) * height
            ) * scanScale;
            const size = Math.max(
                44,
                Math.min(measuredSize, Math.min(width, height) * 0.38)
            );
            const left = transformedX - size / 2;
            const top = transformedY - size / 2;

            state.targetElement.style.left = `${left}px`;
            state.targetElement.style.top = `${top}px`;
            state.targetElement.style.width = `${size}px`;
            state.targetElement.style.height = `${size}px`;
            state.targetElement.classList.toggle(
                "annotation-right",
                transformedX < width / 2
            );
        }

        function revealTarget(box) {
            const marker = document.createElement("span");
            marker.className = "scan-target-box";
            marker.setAttribute("aria-hidden", "true");
            marker.innerHTML = `
                <span class="scan-leader"></span>
                <b><span>${figure.dataset.scanId}</span><small>${figure.dataset.scanLabel}</small></b>
            `;
            state.target = box;
            state.targetElement = marker;
            figure.appendChild(marker);
            positionTarget();
            requestAnimationFrame(() => marker.classList.add("is-visible"));
        }
        state.positionTarget = positionTarget;

        function inspect(clientX, clientY) {
            const point = originalPoint(clientX, clientY);
            const target = matchingTarget(point);
            state.token += 1;
            const token = state.token;
            removeTarget();

            state.originX = point.x;
            state.originY = point.y;
            state.zoomed = true;
            figure.style.setProperty("--scan-origin-x", `${point.x}%`);
            figure.style.setProperty("--scan-origin-y", `${point.y}%`);
            figure.classList.add("is-scan-zoomed", "is-scanning");
            figure.classList.remove("scan-hit", "scan-miss");
            feedback.innerHTML = "<span>Analyzing sector</span>Signature scan in progress";
            reset.hidden = false;

            window.setTimeout(() => {
                if (token !== state.token) return;
                figure.classList.remove("is-scanning");
                if (target) {
                    figure.classList.add("scan-hit");
                    feedback.innerHTML =
                        `<span>Classified signature detected</span>${figure.dataset.scanLabel}`;
                    revealTarget(target);
                    const dossier = figure.closest(".secret-dossier");
                    dossier?.classList.add("is-intel-unlocked");
                    dossier?.querySelectorAll(".report-page-button[disabled]").forEach((button) => {
                        button.disabled = false;
                        button.classList.remove("is-locked");
                        button.textContent = button.dataset.unlockedLabel;
                    });
                } else {
                    figure.classList.add("scan-miss");
                    feedback.innerHTML =
                        "<span>Scan inconclusive</span>No classified signature at this location";
                }
            }, 480);
        }

        function resetScan() {
            state.token += 1;
            state.zoomed = false;
            state.originX = 50;
            state.originY = 50;
            removeTarget();
            figure.classList.remove(
                "is-scan-zoomed",
                "is-scanning",
                "scan-hit",
                "scan-miss"
            );
            feedback.textContent = "";
            reset.hidden = true;
        }

        figure.addEventListener("dblclick", (event) => {
            if (event.target.closest("button")) return;
            event.preventDefault();
            if (state.zoomed) {
                resetScan();
                return;
            }
            inspect(event.clientX, event.clientY);
        });

        figure.addEventListener("pointerup", (event) => {
            if (event.pointerType !== "touch" || event.target.closest("button")) return;
            const now = Date.now();
            const tap = { time: now, x: event.clientX, y: event.clientY };
            if (
                state.lastTap
                && now - state.lastTap.time < 380
                && Math.hypot(
                    event.clientX - state.lastTap.x,
                    event.clientY - state.lastTap.y
                ) < 34
            ) {
                event.preventDefault();
                state.lastTap = null;
                if (state.zoomed) {
                    resetScan();
                } else {
                    inspect(event.clientX, event.clientY);
                }
            } else {
                state.lastTap = tap;
            }
        });

        figure.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                resetScan();
            } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                const bounds = figure.getBoundingClientRect();
                inspect(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
            }
        });

        reset.addEventListener("click", (event) => {
            event.stopPropagation();
            resetScan();
        });

        fullscreen?.addEventListener("click", async (event) => {
            event.stopPropagation();
            try {
                if (figure.requestFullscreen) {
                    await figure.requestFullscreen();
                    if (screen.orientation?.lock) {
                        await screen.orientation.lock("landscape");
                    }
                }
            } catch {
                feedback.innerHTML =
                    "<span>Rotate device</span>Landscape mode provides the clearest scan";
                figure.classList.add("is-scan-zoomed", "scan-miss");
                reset.hidden = false;
            }
        });
    });

    window.addEventListener("resize", () => {
        scanStates.forEach((state) => {
            state.positionTarget?.();
        });
    });
})();
