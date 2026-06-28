// Scroll reveal
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px -80px 0px' });

function observeReveals(root) {
  (root || document).querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}
observeReveals();

// Hamburger menu
const nav = document.querySelector('.nav');
const hamburger = document.querySelector('.nav-hamburger');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close on nav link click
  nav.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

// ===== Webcam floating button + popup =====
const WEBCAM_URL = 'http://holmestrand.azurewebsites.net/Webcam/havna.jpg';

document.body.insertAdjacentHTML('beforeend', `
  <button class="webcam-fab" id="webcam-fab" aria-label="Webkamera – Holmestrand Havn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
    <span>Webkamera</span>
  </button>

  <div class="webcam-overlay" id="webcam-overlay" role="dialog" aria-modal="true" aria-label="Webkamera Holmestrand Havn">
    <div class="webcam-modal">
      <div class="webcam-header">
        <div>
          <div class="webcam-title">Holmestrand Småbåthavn</div>
          <div class="webcam-sub">Oppdateres hver time</div>
        </div>
        <div class="webcam-actions">
          <button class="webcam-refresh" id="webcam-refresh" aria-label="Oppdater bilde">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
          <button class="webcam-close" id="webcam-close" aria-label="Lukk">&#10005;</button>
        </div>
      </div>
      <div class="webcam-img-wrap">
        <img id="webcam-img" src="" alt="Webkamera Holmestrand Havn">
        <div class="webcam-loading" id="webcam-loading">Laster…</div>
      </div>
      <div class="webcam-footer" id="webcam-ts"></div>
    </div>
  </div>
`);

function loadWebcam() {
  const img = document.getElementById('webcam-img');
  const loading = document.getElementById('webcam-loading');
  const ts = document.getElementById('webcam-ts');
  loading.style.display = 'flex';
  img.style.opacity = '0';
  const src = WEBCAM_URL + '?t=' + Date.now();
  img.onload = () => {
    loading.style.display = 'none';
    img.style.opacity = '1';
    const now = new Date();
    ts.textContent = 'Hentet ' + now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  };
  img.onerror = () => {
    loading.textContent = 'Bildet er ikke tilgjengelig.';
  };
  img.src = src;
}

function openWebcam() {
  const overlay = document.getElementById('webcam-overlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  loadWebcam();
}

function closeWebcam() {
  document.getElementById('webcam-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('webcam-fab').addEventListener('click', openWebcam);
document.getElementById('webcam-close').addEventListener('click', closeWebcam);
document.getElementById('webcam-refresh').addEventListener('click', loadWebcam);
document.getElementById('webcam-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeWebcam();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeWebcam();
});
