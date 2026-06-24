/**
 * Aria & Julian Premium Digital Invitation Engine
 * Architecture: Vanilla ES6 Class-based Implementation
 * Features: YouTube IFrame Audio, Intersection Observer Animations, Local State RSVP
 */

// YouTube IFrame API global callback
let ytPlayer;
let appInstance;

function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('ytPlayer', {
        height: '1',
        width: '1',
        videoId: 'EngPsM8VnzM',
        playerVars: {
            autoplay: 0,
            loop: 1,
            playlist: 'EngPsM8VnzM',
            controls: 0,
            mute: 0,
            playsinline: 1,
        },
        events: {
            onReady: () => {
                if (appInstance) appInstance.ytReady = true;
            },
            onStateChange: (event) => {
                if (appInstance) appInstance.onYTStateChange(event);
            }
        }
    });
}

// Copy to clipboard utility (global)
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Tersalin!`;
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    });
}

class InvitationApp {
    constructor() {
        // State
        this.isPlaying = false;
        this.ytReady = false;

        this.wishesData = [
            { name: "Rian Kusuma", attendance: "hadir", wishes: "Selamat Aria & Julian! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Amin!" },
            { name: "Siti Amelia", attendance: "tidak-hadir", wishes: "Selamat menempuh hidup baru! Maaf belum bisa hadir karena sedang dinas luar kota, berkah selalu!" }
        ];

        // DOM Cache
        this.gateOverlay = document.getElementById('gateOverlay');
        this.openBtn = document.getElementById('openInvitationBtn');
        this.mainContent = document.getElementById('mainContent');
        this.audioToggle = document.getElementById('audioToggle');
        this.iconPlay = this.audioToggle.querySelector('.icon-play');
        this.iconPause = this.audioToggle.querySelector('.icon-pause');
        this.rsvpForm = document.getElementById('rsvpForm');
        this.wishesStream = document.getElementById('wishesStream');

        appInstance = this;
        this.init();
    }

    init() {
        this.openBtn.addEventListener('click', () => this.unlockInvitation());
        this.audioToggle.addEventListener('click', () => this.toggleAudio());
        this.rsvpForm.addEventListener('submit', (e) => this.handleRSVP(e));

        this.startCountdown();
        this.setupScrollAnimations();
        this.renderWishes();
    }

    unlockInvitation() {
        this.gateOverlay.style.transform = 'translateY(-100%)';
        this.mainContent.classList.remove('hidden-content');

        setTimeout(() => {
            this.gateOverlay.classList.add('hidden');
        }, 800);

        this.playAudio();
    }

    playAudio() {
        if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
            ytPlayer.playVideo();
            this.isPlaying = true;
            this.iconPlay.classList.add('hidden');
            this.iconPause.classList.remove('hidden');
        } else {
            // YT player not ready yet — retry after a short delay
            setTimeout(() => this.playAudio(), 800);
        }
    }

    onYTStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.iconPlay.classList.add('hidden');
            this.iconPause.classList.remove('hidden');
        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            this.isPlaying = false;
            this.iconPlay.classList.remove('hidden');
            this.iconPause.classList.add('hidden');
        }
    }

    toggleAudio() {
        if (!ytPlayer || typeof ytPlayer.playVideo !== 'function') return;

        if (this.isPlaying) {
            ytPlayer.pauseVideo();
        } else {
            ytPlayer.playVideo();
        }
    }

    startCountdown() {
        const countdownContainer = document.getElementById('countdown');
        const targetDate = new Date(countdownContainer.dataset.date).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(timerInterval);
                countdownContainer.innerHTML = "<p style='grid-column: 1/-1; letter-spacing: 2px;'>ACARA TELAH BERLANGSUNG</p>";
                return;
            }

            document.getElementById('days').textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            document.getElementById('hours').textContent = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            document.getElementById('minutes').textContent = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            document.getElementById('seconds').textContent = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }

    setupScrollAnimations() {
        const fadeSections = document.querySelectorAll('.section-fade');
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { root: null, threshold: 0.15 });

        fadeSections.forEach(section => observer.observe(section));
    }

    renderWishes() {
        this.wishesStream.innerHTML = '';
        [...this.wishesData].reverse().forEach(data => {
            const card = document.createElement('div');
            card.className = 'wish-card';
            const statusLabel = data.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir';
            const statusClass = data.attendance === 'hadir' ? 'status-hadir' : 'status-tidak-hadir';
            card.innerHTML = `
                <div class="wish-header">
                    <span class="wish-name">${this.escapeHTML(data.name)}</span>
                    <span class="wish-status ${statusClass}">${statusLabel}</span>
                </div>
                <p class="wish-text">${this.escapeHTML(data.wishes)}</p>
            `;
            this.wishesStream.appendChild(card);
        });
    }

    handleRSVP(e) {
        e.preventDefault();
        const formData = new FormData(this.rsvpForm);
        this.wishesData.push({
            name: formData.get('name'),
            attendance: formData.get('attendance'),
            wishes: formData.get('wishes')
        });
        this.renderWishes();
        this.rsvpForm.reset();
        this.wishesStream.scrollTop = 0;
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InvitationApp();
});
