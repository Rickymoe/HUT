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
// Cacher nav/footer i sessionStorage. Første sidevisning i en økt henter og
// lagrer; alle senere navigasjoner injiserer synkront fra cache – da rekker
// ikke headeren å blinke tomt før den fylles. Cachen revalideres i bakgrunnen
// (ny versjon vises ved neste navigasjon).
// outerHTML (ikke innerHTML): placeholder-diven skal ikke bli en wrapper rundt
// <nav> – en wrapper med nøyaktig navens høyde gir position: sticky ingen plass.
function loadPartial(url, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return Promise.resolve();
  const key = 'hut-partial:' + url;

  let cached = null;
  try { cached = sessionStorage.getItem(key); } catch (e) {}

  const fetchAndStore = () => fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(html => {
      try { sessionStorage.setItem(key, html); } catch (e) {}
      return html;
    });

  if (cached) {
    target.outerHTML = cached;
    fetchAndStore().catch(() => {});
    return Promise.resolve();
  }

  return fetchAndStore()
    .then(html => {
      const t = document.getElementById(targetId);
      if (t) t.outerHTML = html;
    })
    .catch(err => console.error('Kunne ikke laste ' + url, err));
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

// ---- Tellende statistikk-tall (forside) ----------------------------
// Teller opp fra 0 til data-to når stats-båndet scrolles inn. Uten JS,
// uten IntersectionObserver eller ved prefers-reduced-motion står de
// ferdige tallene allerede i markup – da gjør denne ingenting.
function initStatCounters() {
  const band = document.querySelector('.stats');
  if (!band || !band.querySelector('.count[data-to]')) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;

  const countUp = el => {
    const to = parseInt(el.dataset.to, 10);
    if (!Number.isFinite(to)) return;
    const dur = 1400;
    const t0 = performance.now();
    el.textContent = '0';
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(to);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.count[data-to]').forEach(countUp);
      io.disconnect();
    });
  }, { threshold: 0.3 });

  io.observe(band);
}

// ---- Hero-karusell (forside) --------------------------------------
// Crossfade mellom slides. Auto-advance pauses på hover og når fanen
// er skjult, og starter ikke i det hele tatt ved prefers-reduced-motion
// (piler/prikker fungerer fortsatt).
function initHeroCarousel() {
  const slidesWrap = document.querySelector('.hero-slides');
  if (!slidesWrap) return;
  const slides = [...slidesWrap.querySelectorAll('.hero-slide')];
  const dotsContainer = document.getElementById('hero-dots');
  const hero = document.querySelector('.hero');
  const prev = document.querySelector('.hero-arrow.prev');
  const next = document.querySelector('.hero-arrow.next');
  if (slides.length < 2 || !dotsContainer) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INTERVAL = 7000;
  let current = 0;
  let timer = null;
  let paused = false;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'hero-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Bilde ' + (i + 1));
    if (i === 0) d.setAttribute('aria-current', 'true');
    d.addEventListener('click', () => { goTo(i); restart(); });
    dotsContainer.appendChild(d);
  });

  function goTo(n) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    dotsContainer.children[current].removeAttribute('aria-current');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
    dotsContainer.children[current].setAttribute('aria-current', 'true');
  }

  function tick() {
    goTo(current + 1);
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (reduced || paused || document.hidden) return;
    timer = setTimeout(tick, INTERVAL);
  }
  function restart() { schedule(); }

  if (next) next.addEventListener('click', () => { goTo(current + 1); restart(); });
  if (prev) prev.addEventListener('click', () => { goTo(current - 1); restart(); });

  if (hero) {
    hero.addEventListener('mouseenter', () => { paused = true; schedule(); });
    hero.addEventListener('mouseleave', () => { paused = false; schedule(); });
    // Tastaturfokus i hero pauser auto-advance på samme måte som hover (WCAG 2.2.2).
    hero.addEventListener('focusin', () => { paused = true; schedule(); });
    hero.addEventListener('focusout', () => { paused = false; schedule(); });
  }
  document.addEventListener('visibilitychange', schedule);

  schedule();
}

// ---- Oppstart -------------------------------------------------------
async function boot() {
  // DOM-only inits først – disse rører ikke partial-innholdet og skal ikke
  // vente på de to fetch-ene (ellers er piler/prikker og reveals døde til da).
  initWebcam();
  observeReveals();
  initStatCounters();
  initHeroCarousel();
  await Promise.all([
    loadPartial('partials/nav.html', 'site-nav'),
    loadPartial('partials/footer.html', 'site-footer'),
  ]);
  // initNav og initFooterYear må stå etter await – de opererer på injisert markup.
  initNav();
  initFooterYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
