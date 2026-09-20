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

// Elementer som allerede er i viewport ved sidelast (sidehode, første rad)
// står ferdige fra første paint. Uten dette fader de inn ved hver refresh.
// Ved reload og tilbake/frem gjenoppretter Chrome scroll-posisjonen etter at
// dette har kjørt – da er ikke "i viewport nå" til å stole på, og innholdet er
// allerede sett. Alt vises derfor umiddelbart; reveal er kun for nye besøk.
const navType = (performance.getEntriesByType('navigation')[0] || {}).type;
const restoresScroll = navType === 'reload' || navType === 'back_forward';
let scrolledYet = false;
addEventListener('scroll', () => { scrolledYet = true; }, { once: true, passive: true });

function inViewport(el) {
  const r = el.getBoundingClientRect();
  return r.top < innerHeight && r.bottom > 0;
}

function showInstantly(el) {
  el.classList.add('reveal-instant', 'visible');
  void el.offsetWidth; // tving style-beregning mens transition er slått av
  el.classList.remove('reveal-instant');
}

function observeReveals(root) {
  const scope = root || document;
  const els = scope.querySelectorAll('.reveal');
  if (!revealObserver) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  els.forEach(el => {
    if (restoresScroll || (!scrolledYet && inViewport(el))) showInstantly(el);
    else revealObserver.observe(el);
  });
}

window.HUT = { observeReveals };
window.__revealReady = true;

// ---- Partial-laster ---------------------------------------------------
// NB: nøkkelen har versjon («hut-partial-v2:», også i inline-scriptet i hver side). Bump ved strukturendring i en
// partial, ellers viser åpne faner gammel cachet markup til fanen lukkes.
// Cacher nav/footer i sessionStorage. Første sidevisning i en økt henter og
// lagrer; alle senere navigasjoner injiserer synkront fra cache – da rekker
// ikke headeren å blinke tomt før den fylles. Cachen revalideres i bakgrunnen
// (ny versjon vises ved neste navigasjon).
// outerHTML (ikke innerHTML): placeholder-diven skal ikke bli en wrapper rundt
// <nav> – en wrapper med nøyaktig navens høyde gir position: sticky ingen plass.
function loadPartial(url, targetId) {
  const target = document.getElementById(targetId);
  const key = 'hut-partial-v2:' + url;

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

  // Nav injiseres allerede av et inline-script rett etter placeholderen (før
  // første paint, se hver sides <body>) – da er target borte, og vi revaliderer bare.
  if (!target) {
    if (cached) fetchAndStore().catch(() => {});
    return Promise.resolve();
  }

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

// Knappen (#webcam-fab) ligger i partials/nav.html; her bygges bare popupen.
// Returnerer openWebcam så initWebcamFab kan koble knappen når partialen er på plass.
function initWebcam() {
  document.body.insertAdjacentHTML('beforeend', `
  <div class="webcam-overlay" id="webcam-overlay" role="dialog" aria-modal="true" aria-label="Webkamera Holmestrand Havn">
    <div class="webcam-modal">
      <div class="webcam-header">
        <div>
          <div class="webcam-title">Holmestrand Småbåthavn</div>
          <div class="webcam-sub">Oppdateres hver time</div>
        </div>
        <div class="webcam-actions">
          <button class="webcam-zoom" id="webcam-zoom" aria-label="Zoom inn 2x" aria-pressed="false">2x</button>
          <button class="webcam-refresh" id="webcam-refresh" aria-label="Oppdater bilde">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
          <button class="webcam-close" id="webcam-close" aria-label="Lukk">&#10005;</button>
        </div>
      </div>
      <div class="webcam-img-wrap" id="webcam-img-wrap">
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
    resetZoom();
  }
  function resetZoom() {
    const wrap = document.getElementById('webcam-img-wrap');
    const btn = document.getElementById('webcam-zoom');
    wrap.classList.remove('zoomed');
    wrap.scrollLeft = 0; wrap.scrollTop = 0;
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = '2x';
  }
  function toggleZoom() {
    const wrap = document.getElementById('webcam-img-wrap');
    const btn = document.getElementById('webcam-zoom');
    const zoomed = wrap.classList.toggle('zoomed');
    wrap.scrollLeft = 0; wrap.scrollTop = 0;
    btn.setAttribute('aria-pressed', String(zoomed));
    btn.textContent = zoomed ? '1x' : '2x';
  }

  document.getElementById('webcam-close').addEventListener('click', closeWebcam);
  document.getElementById('webcam-refresh').addEventListener('click', loadWebcam);
  document.getElementById('webcam-zoom').addEventListener('click', toggleZoom);
  overlay.addEventListener('click', e => { if (e.target === e.currentTarget) closeWebcam(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWebcam(); });

  return openWebcam;
}

// Kobler den flytende knappen (fra nav-partialen) til popupen. Mobil (≤600px): knappen
// skjules ved scroll nedover og vises ved scroll oppover (CSS: .is-hidden). Scroll-lytteren
// festes først etter load + litt tid, så nettleserens scroll-gjenoppretting ved refresh
// ikke tolkes som at brukeren scroller ned (da ble knappen borte rett etter reload).
function initWebcamFab(openWebcam) {
  const fab = document.getElementById('webcam-fab');
  if (!fab) return;
  fab.addEventListener('click', openWebcam);
  fab.addEventListener('focus', () => fab.classList.remove('is-hidden'));

  const listen = () => {
    let lastY = window.scrollY, tick = false;
    window.addEventListener('scroll', () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        const y = window.scrollY, dy = y - lastY;
        if (y <= 120) { fab.classList.remove('is-hidden'); lastY = y; }
        else if (dy > 6) { fab.classList.add('is-hidden'); lastY = y; }
        else if (dy < -6) { fab.classList.remove('is-hidden'); lastY = y; }
        tick = false;
      });
    }, { passive: true });
  };
  if (document.readyState === 'complete') setTimeout(listen, 400);
  else window.addEventListener('load', () => setTimeout(listen, 400), { once: true });
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
    const target = (n + slides.length) % slides.length;
    if (target === current) return;
    // Utgående slide holdes ugjennomsiktig (.prev) under den innkommende.
    slides.forEach((s) => s.classList.remove('prev'));
    slides[current].classList.add('prev');
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    dotsContainer.children[current].removeAttribute('aria-current');
    current = target;
    slides[current].classList.remove('prev');
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

  // Sveip/dra – touch og penn (mus bruker piler/prikker). Crossfade-karusell,
  // så vi gir en liten elastisk forskyvning av bildene som tilbakemelding og
  // bytter slide når draget passerer terskelen. Lyttes på hele .hero fordi
  // .hero-inner (tekst/knapper) ligger oppå bildene.
  if (hero) {
    const SWIPE = 45;
    let dragging = false, startX = 0, startY = 0, dx = 0, decided = false, horizontal = false;

    hero.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      dragging = true; decided = false; horizontal = false;
      startX = e.clientX; startY = e.clientY; dx = 0;
      slidesWrap.style.transition = 'none';
    });

    hero.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!decided) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        decided = true;
        horizontal = Math.abs(dx) > Math.abs(dy);
        if (horizontal) { paused = true; schedule(); }
      }
      if (!horizontal) return;
      e.preventDefault();
      if (!reduced) slidesWrap.style.transform = 'translateX(' + (dx * 0.4) + 'px)';
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      slidesWrap.style.transition = reduced ? 'none' : 'transform .4s cubic-bezier(.22,1,.36,1)';
      slidesWrap.style.transform = 'translateX(0)';
      if (horizontal && Math.abs(dx) > SWIPE) goTo(current + (dx < 0 ? 1 : -1));
      if (horizontal) { paused = false; restart(); }
    };
    hero.addEventListener('pointerup', endDrag);
    hero.addEventListener('pointercancel', endDrag);
  }

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
  const openWebcam = initWebcam();
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
  initWebcamFab(openWebcam);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
