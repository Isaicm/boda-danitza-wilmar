/* ══════════════════════════════════════════════════════
   BODA DANITZA & WILMAR — main.js
   Envelope · Countdown · Lightbox · Particles · Sobres · RSVP
══════════════════════════════════════════════════════ */

'use strict';

// ── GOOGLE APPS SCRIPT URL ────────────────────────────────
// Reemplaza esta URL con la URL de tu Web App desplegada
// Instrucciones en apps-script/codigo.gs
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx10aFQtdUDrI9jSX0fB0Y123meBGDD6DTPSGduUNVECrH0ZdBpTozC57dAbn6YHo0t/exec';

// ── WEDDING DATE (Colombia UTC-5, sin DST) ────────────────
const WEDDING_DATE = new Date('2026-08-09T17:00:00-05:00');

// ── VIDEO INTRO ───────────────────────────────────────────
(function initVideoIntro() {
  var intro      = document.getElementById('videoIntro');
  var video      = document.getElementById('introVideo');
  var tapScreen  = document.getElementById('introTap');
  var tapBtn     = document.getElementById('introTapBtn');
  var skipBtn    = document.getElementById('introSkip');
  var petalsWrap = document.getElementById('introPetals');
  var sparksWrap = document.getElementById('introSparks');
  var envelope   = document.getElementById('envelopeOverlay');

  if (!intro || !video) return;

  function showEnvelope() {
    intro.classList.add('hidden');
    envelope.style.transition = 'opacity 1s ease';
    envelope.style.opacity    = '1';
    envelope.style.pointerEvents = '';
  }

  function spawnSparks() {
    if (!sparksWrap) return;
    var colors = ['#fff9e6','#ffe4b5','#ffd700','#ffffff','#ffe8ef','#ffc0cb'];
    var count  = 38;
    for (var i = 0; i < count; i++) {
      (function(idx) {
        var delay    = idx * 90 + Math.random() * 200;   // ms stagger
        var duration = 1400 + Math.random() * 1200;       // ms
        var size     = 2 + Math.random() * 4;             // px
        var top      = 5 + Math.random() * 90;            // %
        var color    = colors[Math.floor(Math.random() * colors.length)];
        var glow     = Math.random() > 0.5;

        var el = document.createElement('div');
        el.className = 'intro-spark';
        el.style.cssText = [
          'width:'  + size + 'px',
          'height:' + size + 'px',
          'top:'    + top  + '%',
          'left:-6vw',
          'background:' + color,
          'animation-duration:' + duration + 'ms',
          'animation-delay:'   + delay    + 'ms',
          glow ? 'box-shadow:0 0 ' + (size*2) + 'px ' + size + 'px ' + color : ''
        ].join(';');

        sparksWrap.appendChild(el);
        // Limpiar tras terminar para no acumular nodos
        setTimeout(function() { el.remove(); }, delay + duration + 100);
      })(i);
    }
  }

  function startIntro() {
    tapScreen.classList.add('hidden');
    video.play().catch(function () {});
    video.classList.add('playing');
    if (skipBtn) skipBtn.style.display = '';
    if (typeof window.startMusic === 'function') window.startMusic();
    spawnPetals(petalsWrap, 20, 'petalFall');
    // Brillitos con pequeño retraso para que se vean sobre el video
    setTimeout(spawnSparks, 300);
  }

  if (tapBtn) tapBtn.addEventListener('click', startIntro);
  if (skipBtn) skipBtn.addEventListener('click', showEnvelope);
  video.addEventListener('ended', showEnvelope);
  video.addEventListener('error', function () {
    tapScreen.classList.add('hidden');
    showEnvelope();
  });
})();

// ── NOMBRE DEL INVITADO (leído desde ?para=Nombre+Apellido) ──
const GUEST_NAME = (function () {
  var raw = new URLSearchParams(window.location.search).get('para') || '';
  return raw.trim().replace(/\+/g, ' ');
})();

// ── MÁXIMO DE ACOMPAÑANTES (leído desde ?max=N) ──
const MAX_GUESTS = (function () {
  var raw = new URLSearchParams(window.location.search).get('max');
  var n   = parseInt(raw, 10);
  return (!isNaN(n) && n >= 0) ? n : null;
})();

// Inyecta el nombre en: tarjeta del sobre, hero y campo RSVP
(function applyGuestName() {
  if (!GUEST_NAME) return;

  // Frente del sobre
  var envelopeTo = document.getElementById('envelopeTo');
  if (envelopeTo) {
    envelopeTo.textContent = 'Para: ' + GUEST_NAME;
    setTimeout(function () { envelopeTo.classList.add('visible'); }, 400);
  }

  // Tarjeta interior del sobre
  var cardPara = document.getElementById('cardPara');
  if (cardPara) cardPara.textContent = 'Para: ' + GUEST_NAME;

  // Hero — línea de bienvenida
  var heroGuest = document.getElementById('heroGuestName');
  if (heroGuest) {
    heroGuest.textContent = 'Hola, ' + GUEST_NAME + ' 🤍';
    heroGuest.style.display = '';
  }

  // RSVP — pre-llenar el campo nombre
  var campoNombre = document.getElementById('nombre');
  if (campoNombre) campoNombre.value = GUEST_NAME;
})();

const PETAL_SVGS = [
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'><ellipse cx='15' cy='15' rx='12' ry='6' fill='%23F1DED4' opacity='.82' transform='rotate(20 15 15)'/></svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'><ellipse cx='14' cy='14' rx='10' ry='5' fill='%23D8B9AD' opacity='.72' transform='rotate(-15 14 14)'/></svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><ellipse cx='12' cy='12' rx='9' ry='4' fill='%23A98078' opacity='.58' transform='rotate(40 12 12)'/></svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><ellipse cx='10' cy='10' rx='7' ry='3' fill='%23EAD5A1' opacity='.56' transform='rotate(-30 10 10)'/></svg>"
];

function spawnPetals(container, count, animName) {
  if (!container || container.dataset.petalsReady === 'true') return;
  container.dataset.petalsReady = 'true';

  for (var i = 0; i < count; i++) {
    var el = document.createElement('div');
    el.className = 'petal-item';
    var svgRaw = PETAL_SVGS[i % PETAL_SVGS.length];
    el.innerHTML = '<img src="data:image/svg+xml,' + svgRaw + '" width="28" height="28" aria-hidden="true" alt="" />';

    var left     = Math.random() * 100;
    var duration = 7 + Math.random() * 9;
    var delay    = Math.random() * 12;
    var size     = 0.7 + Math.random() * 0.9;
    var drift    = -18 + Math.random() * 36;

    el.style.cssText = [
      'left:' + left + '%;',
      'animation-name:' + (animName || 'petalFall') + ';',
      'animation-duration:' + duration + 's;',
      'animation-delay:' + delay + 's;',
      'transform:scale(' + size + ');',
      '--petal-drift:' + drift + 'px;'
    ].join('');

    container.appendChild(el);
  }
}

function bindEnvelopeTilt(envelope) {
  if (!envelope || !window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

  envelope.addEventListener('pointermove', function (e) {
    if (envelope.classList.contains('open')) return;
    var rect = envelope.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;

    envelope.style.setProperty('--tilt-x', (-y * 10 + 5).toFixed(2) + 'deg');
    envelope.style.setProperty('--tilt-y', (x * 14).toFixed(2) + 'deg');
    envelope.style.setProperty('--lift', '-10px');
  });

  envelope.addEventListener('pointerleave', function () {
    if (envelope.classList.contains('open')) return;
    envelope.style.removeProperty('--tilt-x');
    envelope.style.removeProperty('--tilt-y');
    envelope.style.removeProperty('--lift');
  });
}

// ═══════════════════════════════════════════════════════════
// 1. ENVELOPE
// ═══════════════════════════════════════════════════════════
(function initEnvelope() {
  const overlay = document.getElementById('envelopeOverlay');
  const envelope = document.getElementById('envelope');
  const btnEnter = document.getElementById('btnEnter');
  const hint = document.getElementById('envelopeHint');
  let opened = false;

  spawnPetals(document.getElementById('envPetals'), 26, 'petalFallEnv');
  bindEnvelopeTilt(envelope);

  function playSparkleSound() {
    try {
      var AudioCtx = window.AudioContext || (/** @type {any} */(window)).webkitAudioContext;
      var ctx = new AudioCtx();
      var notes = [1200, 1500, 1800, 2200, 1900, 2500, 1600, 2100, 2800, 1400];
      notes.forEach(function(freq, i) {
        var osc  = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.055);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.055 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.055 + 0.18);
        osc.start(ctx.currentTime + i * 0.055);
        osc.stop(ctx.currentTime + i * 0.055 + 0.2);
      });
      setTimeout(function(){ ctx.close(); }, 2000);
    } catch(e) {}
  }

  function openEnvelope() {
    if (opened) return;
    opened = true;
    overlay.classList.add('is-open');
    envelope.classList.add('open');
    envelope.setAttribute('aria-expanded', 'true');
    if (hint) {
      hint.style.opacity = '0';
      hint.style.pointerEvents = 'none';
    }

    // Sonido de brillitos al abrir
    playSparkleSound();

    // Música arranca desde el clic en el sobre (gesto del usuario)
    if (typeof window.startMusic === 'function') window.startMusic();

    // Destello (flash) al abrir — se dispara cuando la tarjeta emerge
    setTimeout(function () {
      var flash = document.getElementById('cardFlash');
      if (flash) {
        flash.classList.add('flashing');
        flash.addEventListener('animationend', function () {
          flash.classList.remove('flashing');
        }, { once: true });
      }
    }, 650);

    // Fix: después de que la solapa rota, quitar pointer-events para que el botón funcione
    setTimeout(function () {
      var flap  = document.getElementById('envelopeFlap');
      var front = envelope.querySelector('.envelope-front');
      if (flap)  flap.style.pointerEvents  = 'none';
      if (front) front.style.pointerEvents = 'none';
      var card = document.getElementById('envelopeCard');
      if (card) card.style.zIndex = '20';
    }, 400);
  }

  function enterSite() {
    if (document.activeElement && overlay.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    overlay.classList.add('closing');
    overlay.inert = true;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.add('site-entered');

    var main = document.getElementById('mainContent');
    main.classList.remove('hidden');

    // Hero entrance animation
    if (typeof gsap !== 'undefined') {
      gsap.from(['.hero-eyebrow', '.hero-names-block', '.hero-meta', '.btn-hero', '.scroll-hint'], {
        y: 50,
        opacity: 0,
        stagger: 0.18,
        duration: 1.1,
        ease: 'power3.out',
        delay: 0.25
      });
    }

    startCountdown();
    initScrollObservers();
    initHeroPetals();
    initParticles();
    initHeroParallax();
    spawnSobresRain();
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 950, once: true, offset: 70, easing: 'ease-out-cubic' });
    }

    // Remove overlay from DOM after transition
    var onEnd = function () { overlay.style.display = 'none'; };
    overlay.addEventListener('transitionend', onEnd, { once: true });
    // Fallback in case transitionend doesn't fire
    setTimeout(onEnd, 1200);
  }

  envelope.addEventListener('click', openEnvelope);

  btnEnter.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    enterSite();
  });

  // Allow keyboard activation
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === envelope && !opened) {
      e.preventDefault();
      openEnvelope();
    }
  });
})();

// ═══════════════════════════════════════════════════════════
// 2. COUNTDOWN
// ═══════════════════════════════════════════════════════════
function startCountdown() {
  const elDays = document.getElementById('cDays');
  const elHours = document.getElementById('cHours');
  const elMinutes = document.getElementById('cMinutes');
  const elSeconds = document.getElementById('cSeconds');

  if (!elDays) return;

  function pad(n, digits) {
    return String(n).padStart(digits || 2, '0');
  }

  function flipUpdate(el, newVal) {
    if (el.textContent === newVal) return;
    el.textContent = newVal;
    el.classList.remove('flip');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('flip');
  }

  function tick() {
    const diff = WEDDING_DATE.getTime() - Date.now();

    if (diff <= 0) {
      elDays.textContent = elHours.textContent = elMinutes.textContent = elSeconds.textContent = '00';
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    flipUpdate(elDays, pad(Math.floor(totalSecs / 86400), 3));
    flipUpdate(elHours, pad(Math.floor((totalSecs % 86400) / 3600)));
    flipUpdate(elMinutes, pad(Math.floor((totalSecs % 3600) / 60)));
    flipUpdate(elSeconds, pad(totalSecs % 60));
  }

  tick();
  setInterval(tick, 1000);
}

// ═══════════════════════════════════════════════════════════
// 3. SCROLL OBSERVERS (IntersectionObserver + GSAP ScrollTrigger)
// ═══════════════════════════════════════════════════════════
function initScrollObservers() {
  // --- IntersectionObserver for CSS-transition reveals ---
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -70px 0px',
    threshold: 0.1
  });

  document.querySelectorAll(
    '.reveal-item, .schedule-item, .sobre-card'
  ).forEach(function (el) { io.observe(el); });

  // Polaroids — entrada escalonada al hacer scroll
  var polaroids = Array.from(document.querySelectorAll('.polaroid'));
  var poIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var delay = polaroids.indexOf(el) * 80;
      setTimeout(function () { el.classList.add('visible'); }, delay);
      poIo.unobserve(el);
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
  polaroids.forEach(function (el) { poIo.observe(el); });

  // --- GSAP ScrollTrigger for section titles and countdown ---
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Section titles slide up
  document.querySelectorAll('.section-title').forEach(function (title) {
    gsap.from(title, {
      scrollTrigger: { trigger: title, start: 'top 88%', once: true },
      y: 28,
      opacity: 0,
      duration: 0.85,
      ease: 'power2.out'
    });
  });

  // Countdown units pop in
  ScrollTrigger.create({
    trigger: '#sectionCountdown',
    start: 'top 80%',
    once: true,
    onEnter: function () {
      gsap.from('.countdown-unit', {
        scale: 0.6,
        opacity: 0,
        stagger: 0.1,
        duration: 0.65,
        ease: 'back.out(2)'
      });
    }
  });

  // Dress code swatches pop in with stagger
  ScrollTrigger.create({
    trigger: '#sectionDresscode',
    start: 'top 80%',
    once: true,
    onEnter: function () {
      gsap.from('.swatch', {
        scale: 0,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: 'back.out(2)'
      });
    }
  });
}

// ═══════════════════════════════════════════════════════════
// 4. LIGHTBOX
// ═══════════════════════════════════════════════════════════
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const btnClose = document.getElementById('lightboxClose');
  const btnPrev = document.getElementById('lightboxPrev');
  const btnNext = document.getElementById('lightboxNext');
  const galleryItems = Array.from(document.querySelectorAll('.polaroid'));

  let currentIndex = 0;

  function open(index) {
    currentIndex = index;
    const img = galleryItems[index].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    const img = galleryItems[currentIndex].querySelector('img');
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.94)';
    setTimeout(function () {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 160);
  }

  lightboxImg.style.transition = 'opacity 0.16s ease, transform 0.16s ease';

  galleryItems.forEach(function (item, i) {
    item.addEventListener('click', function () { open(i); });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', function () { navigate(-1); });
  btnNext.addEventListener('click', function () { navigate(1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Touch/swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

// ═══════════════════════════════════════════════════════════
// 5. HERO PETALS — Falling rose petals in hero section
// ═══════════════════════════════════════════════════════════
function initHeroPetals() {
  var heroPetals = document.getElementById('heroPetals');

  spawnPetals(heroPetals, 24, 'petalFall');
}

function initHeroParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var heroPhoto = document.querySelector('.hero-photo-layer img');
  if (!heroPhoto) return;

  gsap.to(heroPhoto, {
    yPercent: 8,
    scale: 1.08,
    ease: 'none',
    scrollTrigger: {
      trigger: '#sectionHero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}

// ═══════════════════════════════════════════════════════════
// 5b. TSPARTICLES — Floating rose petals (sections)
// ═══════════════════════════════════════════════════════════
async function initParticles() {
  if (typeof tsParticles === 'undefined') return;

  try {
    await tsParticles.load('tsparticles', {
      background: { color: 'transparent' },
      fpsLimit: 45,
      particles: {
        number: { value: 22, density: { enable: true, area: 900 } },
        shape: {
          type: 'image',
          image: [
            {
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cellipse cx='15' cy='15' rx='12' ry='6' fill='%23E8A0AE' opacity='.75' transform='rotate(20 15 15)'/%3E%3C/svg%3E",
              width: 30, height: 30
            },
            {
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cellipse cx='15' cy='15' rx='10' ry='5' fill='%23F2D0D8' opacity='.65' transform='rotate(-15 15 15)'/%3E%3C/svg%3E",
              width: 30, height: 30
            },
            {
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='%23C9A96E' opacity='.4'/%3E%3C/svg%3E",
              width: 20, height: 20
            }
          ]
        },
        size: { value: { min: 8, max: 20 } },
        opacity: { value: { min: 0.3, max: 0.8 } },
        move: {
          enable: true,
          speed: 1.1,
          direction: 'bottom',
          random: true,
          straight: false,
          outModes: { default: 'out' },
          drift: 0.8
        },
        rotate: {
          value: { min: 0, max: 360 },
          direction: 'random',
          animation: { enable: true, speed: 4, sync: false }
        },
        wobble: { enable: true, distance: 12, speed: { min: -3, max: 3 } }
      },
      detectRetina: true
    });
  } catch (e) {
    // tsParticles unavailable — silent fail
  }
}

// ═══════════════════════════════════════════════════════════
// 6. LLUVIA DE SOBRES (falling envelope emojis)
// ═══════════════════════════════════════════════════════════
function spawnSobresRain() {
  const container = document.getElementById('sobresRain');
  if (!container) return;

  const items = [
    '<svg viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7C5 4.8 6.8 3 9 3H39C41.2 3 43 4.8 43 7V29C43 31.2 41.2 33 39 33H9C6.8 33 5 31.2 5 29V7Z"/><path d="M7 7L24 20L41 7"/><path d="M7 31L18.5 18.2"/><path d="M41 31L29.5 18.2"/></svg>',
    '<svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 35C15 29.8 10.7 25.8 8.2 22.8C5.7 19.8 4.5 17 4.5 14.4C4.5 9.9 7.7 7 11.7 7C14.1 7 17 8.3 21 12.1C25 8.3 27.9 7 30.3 7C34.3 7 37.5 9.9 37.5 14.4C37.5 17 36.3 19.8 33.8 22.8C31.3 25.8 27 29.8 21 35Z"/></svg>',
    '<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="14" width="28" height="22" rx="3"/><path d="M7 14H37"/><path d="M22 9V36"/><path d="M15 14C11 11 11.5 7 15 6C18.5 5 20.7 8.8 22 14"/><path d="M29 14C33 11 32.5 7 29 6C25.5 5 23.3 8.8 22 14"/></svg>'
  ];
  const count = 20;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'sobre-rain-item';
    el.innerHTML = items[i % items.length];
    el.setAttribute('aria-hidden', 'true');

    const left = Math.random() * 100;
    const duration = 5 + Math.random() * 7;
    const delay = Math.random() * 10;
    const size = 1.1 + Math.random() * 1.3;

    el.style.cssText = [
      'left: ' + left + '%;',
      'animation-duration: ' + duration + 's;',
      'animation-delay: ' + delay + 's;',
      'font-size: ' + size + 'rem;'
    ].join('');

    container.appendChild(el);
  }
}

// ═══════════════════════════════════════════════════════════
// 7b. MODAL ÉXITO RSVP
// ═══════════════════════════════════════════════════════════
function showRSVPModal() {
  var modal     = document.getElementById('rsvpModal');
  var sparksWrp = document.getElementById('rsvpModalSparks');
  var heartsWrp = document.getElementById('rsvpModalHearts');
  if (!modal) return;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Brillitos
  var sparkColors = ['#C9A96E','#ffd700','#fff','#F3B6B6','#E0A2A2'];
  for (var i = 0; i < 28; i++) {
    (function(idx) {
      var delay    = idx * 80 + Math.random() * 300;
      var dur      = 800 + Math.random() * 700;
      var size     = 2 + Math.random() * 4;
      var left     = 5 + Math.random() * 90;
      var top      = 30 + Math.random() * 60;
      var color    = sparkColors[Math.floor(Math.random() * sparkColors.length)];
      var el = document.createElement('div');
      el.className = 'modal-spark';
      el.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+left+'%;top:'+top+'%;background:'+color+';animation-duration:'+dur+'ms;animation-delay:'+delay+'ms;box-shadow:0 0 '+(size*2)+'px '+color;
      sparksWrp.appendChild(el);
      setTimeout(function(){ el.remove(); }, delay + dur + 50);
    })(i);
  }

  // Corazones flotantes
  var heartSymbols = ['♡','♥','❤','💕','🤍'];
  for (var j = 0; j < 12; j++) {
    (function(idx) {
      var delay = idx * 120 + Math.random() * 400;
      var dur   = 1000 + Math.random() * 800;
      var left  = 5 + Math.random() * 90;
      var top   = 40 + Math.random() * 50;
      var sym   = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
      var el = document.createElement('div');
      el.className = 'modal-heart';
      el.textContent = sym;
      el.style.cssText = 'left:'+left+'%;top:'+top+'%;animation-duration:'+dur+'ms;animation-delay:'+delay+'ms;opacity:0;font-size:'+(0.9+Math.random()*0.8)+'rem;color:rgba(195,136,136,0.85)';
      heartsWrp.appendChild(el);
      setTimeout(function(){ el.remove(); }, delay + dur + 50);
    })(j);
  }

  // Cerrar
  var closeBtn = document.getElementById('rsvpModalClose');
  var backdrop = modal.querySelector('.rsvp-modal-backdrop');
  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal, { once: true });
  if (backdrop) backdrop.addEventListener('click', closeModal, { once: true });
}

// ═══════════════════════════════════════════════════════════
// 7. RSVP → Google Sheets via Apps Script
// ═══════════════════════════════════════════════════════════
(function initRSVP() {
  const form = document.getElementById('rsvpForm');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnText = form ? form.querySelector('.btn-text') : null;
  const btnLoading = form ? form.querySelector('.btn-loading') : null;
  const msgSuccess = document.getElementById('formSuccess');
  const msgError = document.getElementById('formError');

  if (!form) return;

  // Mostrar/ocultar campo de nombres de acompañantes según el número
  const invField   = document.getElementById('invitados');
  const nombresGrp = document.getElementById('nombresAcompGroup');
  function toggleNombres() {
    var n = parseInt(invField ? invField.value : '0', 10) || 0;
    if (nombresGrp) nombresGrp.style.display = n > 0 ? '' : 'none';
  }
  if (invField) {
    invField.addEventListener('input',  toggleNombres);
    invField.addEventListener('change', toggleNombres);
    invField.addEventListener('keyup',  toggleNombres);
  }

  // Aplicar límite de acompañantes si viene en la URL
  if (MAX_GUESTS !== null) {
    const invHint = document.getElementById('invitadosHint');
    if (invField) {
      invField.max = MAX_GUESTS;
      if (MAX_GUESTS === 0) {
        invField.value = '0';
        invField.disabled = true;
        if (nombresGrp) nombresGrp.style.display = 'none';
      }
    }
    if (invHint) {
      invHint.textContent = MAX_GUESTS === 0
        ? 'Esta invitación es personal — sin acompañantes.'
        : 'Máximo ' + MAX_GUESTS + ' acompañante' + (MAX_GUESTS === 1 ? '' : 's') + ' permitido' + (MAX_GUESTS === 1 ? '' : 's') + '.';
      invHint.style.display = '';
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validar límite de acompañantes
    if (MAX_GUESTS !== null) {
      var numInv = parseInt(form.invitados.value, 10) || 0;
      if (numInv > MAX_GUESTS) {
        var invHint2 = document.getElementById('invitadosHint');
        if (invHint2) {
          invHint2.textContent = 'Máximo ' + MAX_GUESTS + ' acompañante' + (MAX_GUESTS === 1 ? '' : 's') + '. Corrige el número.';
          invHint2.style.color = '#c0392b';
          invHint2.style.display = '';
        }
        return;
      }
    }

    if (SHEETS_URL === 'YOUR_APPS_SCRIPT_URL') {
      alert(
        'Para activar el RSVP, sigue las instrucciones en apps-script/codigo.gs\n' +
        'y reemplaza YOUR_APPS_SCRIPT_URL en js/main.js con tu URL real.'
      );
      return;
    }

    // Show loading state
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    btnSubmit.disabled = true;
    msgSuccess.classList.add('hidden');
    msgError.classList.add('hidden');

    const data = {
      nombre:       form.nombre.value.trim(),
      asistencia:   form.asistencia.value,
      invitados:    form.invitados.value || '0',
      nombresAcomp: (form.nombresAcomp ? form.nombresAcomp.value.trim() : ''),
      mensaje:      form.mensaje.value.trim()
    };

    try {
      // POST + no-cors: evita preflight CORS. La respuesta es opaca (no legible),
      // pero el servidor la recibe y guarda. Si no hay error de red = éxito.
      const params = new URLSearchParams();
      Object.entries(data).forEach(function([k, v]) { params.append(k, v); });

      await fetch(SHEETS_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    params.toString()
      });

      form.reset();
      btnText.textContent = 'Enviado ✓';
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
      showRSVPModal();

    } catch (err) {
      msgError.classList.remove('hidden');
      msgError.textContent = 'Error de red. Por favor intenta de nuevo o escríbenos directamente.';
      console.error('RSVP error:', err);
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
      btnSubmit.disabled = false;
    }
  });
})();
