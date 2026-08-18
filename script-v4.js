const cards = [...document.querySelectorAll(".flip-card")];
const pairCount = 3;
let activePair = 0;
let pairTimer;

function spinPair(pairIndex) {
    cards.forEach((card) => card.classList.remove("is-spinning"));
    const pairedCards = cards.filter((card) => Number(card.dataset.pair) === pairIndex);

    // One root-state change starts both sides in the same browser frame.
    document.documentElement.dataset.activePair = String(pairIndex);
    pairedCards.forEach((card) => card.classList.add("is-spinning"));
}

function startCardSequence() {
    spinPair(activePair);
    pairTimer = window.setInterval(() => {
        activePair = (activePair + 1) % pairCount;
        spinPair(activePair);
    }, 10000);
}

window.setTimeout(startCardSequence, 900);

const musicButton = document.querySelector("#music-toggle");
const backgroundAudio = document.querySelector("#background-audio");
const musicIcon = musicButton?.querySelector("i");

musicButton?.addEventListener("click", async () => {
    if (!backgroundAudio) return;

    if (backgroundAudio.paused) {
        try {
            await backgroundAudio.play();
            musicButton.setAttribute("aria-pressed", "true");
            musicButton.setAttribute("aria-label", "Pause music");
            musicIcon?.classList.replace("fa-volume-high", "fa-volume-xmark");
        } catch {
            musicButton.title = "Add or check the music file to enable playback.";
        }
    } else {
        backgroundAudio.pause();
        musicButton.setAttribute("aria-pressed", "false");
        musicButton.setAttribute("aria-label", "Play music");
        musicIcon?.classList.replace("fa-volume-xmark", "fa-volume-high");
    }
});

backgroundAudio?.addEventListener("ended", () => {
    backgroundAudio.currentTime = 0;
    backgroundAudio.play().catch(() => {});
});

document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
    });
});

document.querySelector("#join-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.querySelector("input");
    const button = form.querySelector("button");

    if (!email?.value.trim()) {
        email?.focus();
        return;
    }

    button.textContent = "Thank You";
    button.disabled = true;
});

const shell = document.querySelector(".landing-shell");
const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

if (shell && supportsFinePointer) {
    shell.addEventListener("pointermove", (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        shell.style.setProperty("--pointer-x", `${x * 8}px`);
        shell.style.setProperty("--pointer-y", `${y * 5}px`);
    });
}

window.addEventListener("beforeunload", () => {
    window.clearInterval(pairTimer);
});
