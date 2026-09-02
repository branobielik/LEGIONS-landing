const cards = [...document.querySelectorAll(".flip-card")];
const pairCount = 3;
let activePair = 0;
let pairTimer;

function spinPair(pairIndex) {
    const pairedCards = cards.filter((card) => Number(card.dataset.pair) === pairIndex);
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
            musicButton.setAttribute("aria-label", "Pozastaviť hudbu");
            musicIcon?.classList.replace("fa-volume-high", "fa-volume-xmark");
        } catch {
            musicButton.title = "Hudbu sa nepodarilo prehrať.";
        }
    } else {
        backgroundAudio.pause();
        musicButton.setAttribute("aria-pressed", "false");
        musicButton.setAttribute("aria-label", "Prehrať hudbu");
        musicIcon?.classList.replace("fa-volume-xmark", "fa-volume-high");
    }
});

backgroundAudio?.addEventListener("ended", () => {
    backgroundAudio.currentTime = 0;
    backgroundAudio.play().catch(() => {});
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

    button.textContent = "Ďakujeme";
    button.disabled = true;
});

window.addEventListener("beforeunload", () => {
    window.clearInterval(pairTimer);
});
