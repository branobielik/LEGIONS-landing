// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // Here you would typically send the form data to a server
        console.log('Form submitted:', formObject);
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// Add scroll animation for sections
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.5s ease-out';
    observer.observe(section);
});

// Auto-scroll to about section after a delay
window.addEventListener('load', function() {
    setTimeout(function() {
        const aboutSection = document.querySelector('#about');
        if (aboutSection) {
            aboutSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, 6500); // 6.5 seconds delay
});

// Handle audio playback: Play/Stop toggle + 1s pause between loops
const audio = document.getElementById('background-audio');

function createMusicToggleButton() {
    if (!audio) {
        return;
    }

    let isPlaying = false;
    let loopTimeout = null;

    const button = document.createElement('button');
    button.innerHTML = '▶ Play Music';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '1000';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#3498db';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '1rem';
    button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    const updateButton = () => {
        button.innerHTML = isPlaying ? '⏸ Stop Music' : '▶ Play Music';
    };

    const clearLoopTimeout = () => {
        if (loopTimeout) {
            clearTimeout(loopTimeout);
            loopTimeout = null;
        }
    };

    audio.loop = false;
    audio.volume = 0.5;

    audio.addEventListener('ended', () => {
        if (!isPlaying) {
            return;
        }
        clearLoopTimeout();
        loopTimeout = setTimeout(() => {
            if (!isPlaying) {
                return;
            }
            audio.play().catch((error) => {
                console.log('Audio replay failed:', error);
                isPlaying = false;
                updateButton();
            });
        }, 1000);
    });

    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#2980b9';
    });

    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#3498db';
    });

    button.addEventListener('click', () => {
        if (!isPlaying) {
            audio.play().then(() => {
                isPlaying = true;
                updateButton();
            }).catch((error) => {
                console.log('Audio playback failed:', error);
                alert('Music file is missing or blocked by browser autoplay policy.');
            });
            return;
        }

        isPlaying = false;
        clearLoopTimeout();
        audio.pause();
        audio.currentTime = 0;
        updateButton();
    });

    document.body.appendChild(button);
}

// Create music button when page loads
window.addEventListener('load', createMusicToggleButton);
