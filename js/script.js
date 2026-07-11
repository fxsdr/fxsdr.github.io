    // Hide broken-image icon if a photo asset hasn't been added yet,
// so the elegant placeholder (icon + label) shows instead
document.querySelectorAll('.couple-photo img, .photo img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.display = 'none';
  });
});

// Photo Wall Background — kolase foto kecil yang looping ke atas
// Foto diambil dari assets/images/gallery/gallery-1.jpg s/d gallery-10.jpg
(function initPhotoWall() {
  const wall = document.getElementById('photoWall');
  if (!wall) return;

  const TOTAL_PHOTOS = 10;   // jumlah nama file yang dicoba: gallery-1.jpg ... gallery-10.jpg
  const COLUMNS = 4;
  const PER_COLUMN = 5;      // foto unik per kolom sebelum diduplikasi untuk loop

  for (let c = 0; c < COLUMNS; c++) {
    const col = document.createElement('div');
    col.className = 'photo-wall-col' + (c % 2 === 1 ? ' reverse' : '');

    const uniqueIdx = [];
    for (let i = 0; i < PER_COLUMN; i++) {
      uniqueIdx.push(((c * PER_COLUMN + i) % TOTAL_PHOTOS) + 1);
    }
    // duplikasi urutan supaya animasi translateY(-50%) terlihat looping mulus
    const sequence = uniqueIdx.concat(uniqueIdx);

    sequence.forEach(idx => {
      const img = document.createElement('img');
      img.src = `assets/images/gallery/gallery-${idx}.jpg`;
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('error', () => { img.style.display = 'none'; });
      col.appendChild(img);
    });

    wall.appendChild(col);
  }
})();

// Generate petals
    const petalsContainer = document.getElementById('petals');
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      const size = 10 + (i * 5) % 14;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = ((i * 7.3) % 100) + '%';
      p.style.animationDuration = (10 + (i * 3) % 8) + 's';
      p.style.animationDelay = ((i * 1.1) % 12) + 's';
      petalsContainer.appendChild(p);
    }

    // Open cover
    const cover = document.getElementById('cover');
    const btnOpen = document.getElementById('btnOpen');
    btnOpen.addEventListener('click', () => {
      cover.classList.add('hidden');
      document.body.classList.remove('locked');
      playMusic();
    });

    // Scroll reveal for sections
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2, once: true });
    sections.forEach(s => observer.observe(s));

    // Timeline reveal
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.3, once: true });
    timelineItems.forEach((item, i) => {
      item.style.transitionDelay = (i * 0.15) + 's';
      timelineObserver.observe(item);
    });

    // Countdown
    const target = new Date('2026-07-18T08:00:00+07:00').getTime();
    const numEls = document.querySelectorAll('.count-item .num');
    function updateCountdown() {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      const values = [d, h, m, s];
      numEls.forEach((el, i) => {
        el.textContent = String(values[i]).padStart(2, '0');
      });
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Gift modal
    const btnGift = document.getElementById('btnGift');
    const giftModal = document.getElementById('giftModal');
    const modalClose = document.getElementById('modalClose');
    btnGift.addEventListener('click', () => giftModal.classList.add('active'));
    modalClose.addEventListener('click', () => giftModal.classList.remove('active'));
    giftModal.addEventListener('click', (e) => {
      if (e.target === giftModal) giftModal.classList.remove('active');
    });

    // Copy account number
    document.querySelectorAll('.bank-copy').forEach(btn => {
      btn.addEventListener('click', async () => {
        const no = btn.dataset.copy;
        try {
          await navigator.clipboard.writeText(no);
          btn.textContent = 'TERSALIN ✓';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'SALIN NOMOR';
            btn.classList.remove('copied');
          }, 1800);
        } catch (err) {
          // fallback
          const ta = document.createElement('textarea');
          ta.value = no;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.textContent = 'TERSALIN ✓';
          setTimeout(() => btn.textContent = 'SALIN NOMOR', 1800);
        }
      });
    });

// Wish form — renders submitted wishes as a comment list (name + message),
// persisted locally in the visitor's browser via localStorage.
(function initWishList() {
  const form = document.getElementById('wishForm');
  const listEl = document.getElementById('wishList');
  if (!form || !listEl) return;

  const STORAGE_KEY = 'wedding_wishes';

  function loadWishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function saveWishes(wishes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch (err) {
      // storage unavailable — ignore, list stays in-memory for this session
    }
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function renderWishes(wishes) {
    if (!wishes.length) {
      listEl.innerHTML = '<p class="wish-empty">Belum ada ucapan. Jadilah yang pertama mengirimkan doa ✦</p>';
      return;
    }
    listEl.innerHTML = wishes
      .slice()
      .reverse()
      .map(w => `
        <div class="wish-item">
          <div class="wish-item-head">
            <span class="wish-item-name">${escapeHTML(w.name)}</span>
            <span class="wish-item-badge${w.attendance === 'Tidak Hadir' ? ' absent' : ''}">${escapeHTML(w.attendance)}${w.attendance === 'Hadir' ? ' · ' + escapeHTML(String(w.guestCount)) + ' Orang' : ''}</span>
          </div>
          <p class="wish-item-msg">${escapeHTML(w.message)}</p>
          <span class="wish-item-time">${formatTime(w.time)}</span>
        </div>
      `)
      .join('');
  }

  let wishes = loadWishes();
  renderWishes(wishes);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;

    const name = form.querySelector('[name="name"]').value.trim();
    const attendance = form.querySelector('[name="attendance"]').value;
    const guestCount = form.querySelector('[name="guestCount"]').value;
    const message = form.querySelector('[name="message"]').value.trim();
    if (!name || !attendance || !message) return;

    wishes.push({ name, attendance, guestCount, message, time: new Date().toISOString() });
    saveWishes(wishes);
    renderWishes(wishes);

    btn.textContent = 'TERKIRIM ✓';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      form.reset();
    }, 1500);
  });
})();

// Background music (stored locally in assets/audio/)
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

function playMusic() {
  if (!bgMusic) return;
  bgMusic.play()
    .then(() => {
      musicToggle.classList.add('playing');
    })
    .catch(() => {
      // Autoplay blocked by browser — user can press the button manually
    });
}

if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      playMusic();
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
    }
  });
}
