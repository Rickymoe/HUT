// ===== HUT – felles klientlogikk =====
// Eneste JS-inngang for alle sider. Laster nav/footer-partials, kjører
// scroll-reveal, setter aktiv nav-lenke og webkamera-popup.

document.documentElement.classList.add('js');

// ---- Delt scroll-reveal -------------------------------------------------
// Én observer for hele siden. Stagger settes med transition-delay i markup,
// ikke via setTimeout (den gamle i*60-varianten staggeret aldri på mobil).
const revealObserver =
  ('IntersectionObserver' in window)
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 })
    : null;

function observeReveals(root) {
  const scope = root || document;
  const els = scope.querySelectorAll('.reveal');
  if (!revealObserver) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  els.forEach(el => revealObserver.observe(el));
}

window.HUT = { observeReveals };
window.__revealReady = true;

// ---- Partial-laster ---------------------------------------------------
async function loadPartial(url, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  try {
    const res = await fetch(url);
    if (!res.ok) { console.error('Kunne ikke laste ' + url + ' (HTTP ' + res.status + ')'); return; }
    // outerHTML (ikke innerHTML): placeholder-diven skal ikke bli en wrapper
    // rundt <nav> – en wrapper med nøyaktig navens høyde gir position: sticky
    // ingen plass å feste seg i.
    target.outerHTML = await res.text();
  } catch (err) {
    console.error('Kunne ikke laste ' + url, err);
  }
}

// ---- Nav: aktiv lenke + hamburger ------------------------------------
function initNav() {
  const page = document.body.dataset.page;
  if (page) {
    const link = document.querySelector('.nav a[data-page="' + page + '"]');
    if (link) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  }
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav-hamburger');
  if (!nav || !hamburger) return;

  const closeMenu = () => {
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) closeMenu();
  });
}

function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
}

// ---- Webkamera flytende knapp + popup -------------------------------
const WEBCAM_URL = 'http://holmestrand.azurewebsites.net/Webcam/havna.jpg';

function initWebcam() {
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

  const overlay = document.getElementById('webcam-overlay');

  function loadWebcam() {
    const img = document.getElementById('webcam-img');
    const loading = document.getElementById('webcam-loading');
    const ts = document.getElementById('webcam-ts');
    loading.style.display = 'flex';
    img.style.opacity = '0';
    img.onload = () => {
      loading.style.display = 'none';
      img.style.opacity = '1';
      ts.textContent = 'Hentet ' + new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    };
    img.onerror = () => { loading.textContent = 'Bildet er ikke tilgjengelig.'; };
    img.src = WEBCAM_URL + '?t=' + Date.now();
  }
  function openWebcam() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    loadWebcam();
  }
  function closeWebcam() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('webcam-fab').addEventListener('click', openWebcam);
  document.getElementById('webcam-close').addEventListener('click', closeWebcam);
  document.getElementById('webcam-refresh').addEventListener('click', loadWebcam);
  overlay.addEventListener('click', e => { if (e.target === e.currentTarget) closeWebcam(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWebcam(); });
}

// ---- Oppstart -------------------------------------------------------
async function boot() {
  await Promise.all([
    loadPartial('partials/nav.html', 'site-nav'),
    loadPartial('partials/footer.html', 'site-footer'),
  ]);
  initNav();
  initFooterYear();
  initWebcam();
  observeReveals();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
