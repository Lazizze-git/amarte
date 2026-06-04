gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   AMARTE — Animations
   Inspiré Core Atelier : reveals variés, parallaxe, counters
   ============================================================ */

// ── FOOTER YEAR ──────────────────────────────────────────────
document.querySelectorAll('.footer-year').forEach(el => el.textContent = new Date().getFullYear());

// ── NAV SCROLL ───────────────────────────────────────────────
const header = document.getElementById('nav-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── ACTIVE NAV ───────────────────────────────────────────────
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === path) link.setAttribute('aria-current', 'page');
  });
})();

// ── BURGER / MENU ────────────────────────────────────────────
const burger = document.getElementById('burger-btn');
const menu   = document.getElementById('nav-menu');
let menuOpen = false;

if (burger && menu) {
  function toggleMenu(open) {
    menuOpen = open;
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      gsap.fromTo(menu.querySelectorAll('.nav-menu-link'),
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.06, delay: 0.15 }
      );
    }
  }
  burger.addEventListener('click', () => toggleMenu(!menuOpen));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
}

// ── NAV ENTRANCE ─────────────────────────────────────────────
gsap.fromTo('.nav-logo',
  { opacity: 0, x: -20 },
  { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
);
gsap.fromTo('.nav-links a',
  { opacity: 0, y: -10 },
  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.07, delay: 0.25 }
);

// ── HOMEPAGE HERO ────────────────────────────────────────────
const heroLines = ['hl0','hl1','hl2'].map(id => document.getElementById(id)).filter(Boolean);
if (heroLines.length) {
  const heroImg = document.getElementById('hero-img');
  const heroSub = document.getElementById('hero-sub');
  const heroBtn = document.getElementById('hero-btn');

  if (heroImg) {
    gsap.fromTo(heroImg,
      { scale: 1.1, opacity: 0.6 },
      { scale: 1, opacity: 1, duration: 2.2, ease: 'power2.out' }
    );
    // subtle parallax on hero
    gsap.to(heroImg, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: heroImg.closest('section') || heroImg, start: 'top top', end: 'bottom top', scrub: 1 }
    });
  }

  // Ligne par ligne — clip-path wipe vers le haut
  heroLines.forEach((line, i) => {
    const wrap = line.closest('.hero-line-wrap') || line;
    gsap.fromTo(line,
      { y: '108%' },
      { y: '0%', duration: 1.1, ease: 'expo.out', delay: 0.15 + i * 0.12 }
    );
  });

  if (heroSub) gsap.fromTo(heroSub, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.7 });
  if (heroBtn) gsap.fromTo(heroBtn, { opacity: 0, y: 16, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.3)', delay: 0.9 });
}

// ── SCROLL REVEALS — VARIÉS ───────────────────────────────────

// 1. gs-reveal : fade + translateY léger (par défaut)
// Skip elements managed by dedicated container staggers defined below
const STAGGER_CONTAINERS = '.corpo-offers-grid';
document.querySelectorAll('.gs-reveal').forEach((el) => {
  if (el.closest(STAGGER_CONTAINERS)) return;
  if (el.closest('.gs-stagger')) return;   // parent stagger handles it
  gsap.fromTo(el,
    { y: 44, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 91%', once: true } }
  );
});

// 2. gs-stagger : enfants en cascade avec direction variable
document.querySelectorAll('.gs-stagger').forEach(el => {
  const children = Array.from(el.children).filter(c => c.tagName !== 'BR');
  gsap.fromTo(children,
    { y: 36, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.78, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
  );
});

// 3. Section labels — slide depuis la gauche
document.querySelectorAll('.section-label').forEach(el => {
  gsap.fromTo(el,
    { x: -20, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true } }
  );
});

// 4. Titres de section — clip-path wipe (Core Atelier style)
document.querySelectorAll('h1.page-hero-title, h2.pf-hero-title').forEach(el => {
  gsap.fromTo(el,
    { clipPath: 'inset(0 0 100% 0)', y: 18 },
    { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.05, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
  );
});

// h2 généraux — fade + légère montée
document.querySelectorAll('h2:not(.pf-hero-title):not(.booking-cta-title)').forEach(el => {
  if (el.closest('.gs-stagger')) return;   // parent stagger gère déjà cet élément
  gsap.fromTo(el,
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
  );
});

// booking-cta-title — scale-in depuis légèrement plus grand
document.querySelectorAll('.booking-cta-title, .pf-pack-title, .corpo-cta-title').forEach(el => {
  gsap.fromTo(el,
    { scale: 1.03, opacity: 0, y: 12 },
    { scale: 1, opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
  );
});

// 5. Images — clip-path reveal + scale intérieure (timeline synchronisée)
document.querySelectorAll('.gs-img-reveal').forEach(wrap => {
  const inner = wrap.querySelector('.gs-img-inner');
  const tl = gsap.timeline({
    scrollTrigger: { trigger: wrap, start: 'top 85%', once: true }
  });
  tl.fromTo(wrap,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut' }
  );
  if (inner) tl.fromTo(inner, { scale: 1.18 }, { scale: 1, duration: 1.3, ease: 'power4.inOut' }, 0);
});

// 6. Cours item cards — stagger par rangée (trigger sur la grille)
const coursGrid = document.querySelector('.cours-grid');
if (coursGrid) {
  const items = coursGrid.querySelectorAll('.cours-item');
  gsap.fromTo(items,
    { y: 36, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out',
      stagger: { amount: 0.45, from: 'start' },
      scrollTrigger: { trigger: coursGrid, start: 'top 88%', once: true }
    }
  );
}

// 7. Cards classes (homepage) — stagger sur le conteneur, fluide
const classSection = document.querySelector('.classes-grid');
if (classSection) {
  const cards = classSection.querySelectorAll('.class-card');
  gsap.fromTo(cards,
    { y: 32, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
      stagger: { amount: 0.35, from: 'start' },
      scrollTrigger: { trigger: classSection, start: 'top 86%', once: true }
    }
  );
} else {
  // Fallback si pas de conteneur commun
  document.querySelectorAll('.class-card').forEach((el, i) => {
    gsap.fromTo(el,
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 91%', once: true },
        delay: Math.min(i * 0.06, 0.3)
      }
    );
  });
}

// 8. Stats corpo — count-up + bounce
document.querySelectorAll('.corpo-stat-val').forEach(el => {
  gsap.fromTo(el,
    { y: 32, opacity: 0, scale: 0.9 },
    { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'back.out(1.2)',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
  );
});

// 9. Trust strip items — container stagger
const trustItems = document.querySelectorAll('.trust-item');
if (trustItems.length) {
  gsap.fromTo(Array.from(trustItems),
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
      stagger: { amount: 0.4, from: 'start' },
      scrollTrigger: { trigger: trustItems[0].parentElement, start: 'top 90%', once: true }
    }
  );
}

// 10. Tarifs illimité cards — container stagger
const tarifCards = document.querySelectorAll('.tarifs-illimite-card');
if (tarifCards.length) {
  gsap.fromTo(Array.from(tarifCards),
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out',
      stagger: { amount: 0.3, from: 'start' },
      scrollTrigger: { trigger: tarifCards[0].parentElement, start: 'top 88%', once: true }
    }
  );
}

// 11. Pack offre déco — scale depuis le centre
document.querySelectorAll('.pf-pack-price-block, .tarifs-decouverte-price-block').forEach(el => {
  gsap.fromTo(el,
    { scale: 0.92, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.85, ease: 'back.out(1.1)',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
  );
});

// 12. Image parallax — sur toutes les images hero
document.querySelectorAll('.pf-hero-img, .cours-hero-img-wrap img').forEach(img => {
  const section = img.closest('section') || img.parentElement;
  gsap.to(img, {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 }
  });
});

// 13. Corpo offer cards — container stagger
const corpoOfferCards = document.querySelectorAll('.corpo-offer-card');
if (corpoOfferCards.length) {
  gsap.fromTo(Array.from(corpoOfferCards),
    { y: 32, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
      stagger: { amount: 0.3, from: 'start' },
      scrollTrigger: { trigger: corpoOfferCards[0].parentElement, start: 'top 85%', once: true }
    }
  );
}

// 14. Process steps corpo — container stagger (skip if parent already .gs-stagger)
const corpoSteps = document.querySelectorAll('.corpo-step');
if (corpoSteps.length && !corpoSteps[0].parentElement.classList.contains('gs-stagger')) {
  gsap.fromTo(Array.from(corpoSteps),
    { y: 36, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out',
      stagger: { amount: 0.4, from: 'start' },
      scrollTrigger: { trigger: corpoSteps[0].parentElement, start: 'top 88%', once: true }
    }
  );
}


// 16. Hero de cours — scale-in avec parallaxe
const coursHero = document.querySelector('.cours-hero-img-wrap');
if (coursHero) {
  gsap.fromTo(coursHero,
    { scale: 1.08 },
    { scale: 1, duration: 2.0, ease: 'power2.out' }
  );
}

// ── HOVER MAGNÉTIQUE sur les CTAs principaux ─────────────────
document.querySelectorAll('.btn-pill, .btn-rect, .pf-pack-cta, .pf-hero-cta').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.18, y: y * 0.18, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
  });
});


// ── CONTACT FORMS ─────────────────────────────────────────────
document.querySelectorAll('.contact-form').forEach(form => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const wrap = this.closest('.form-wrap');
    if (wrap) {
      gsap.to(wrap, { opacity: 0, y: -16, duration: 0.3, ease: 'power2.in', onComplete: () => {
        wrap.innerHTML = '<div class="form-success"><p class="form-success-title">Merci.</p><p class="form-success-sub">Nous vous répondons dans les 24 heures.</p></div>';
        gsap.fromTo(wrap, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      }});
    }
  });
});

// ── FAQ ACCORDION ─────────────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) {
      item.classList.add('open');
      const answer = item.querySelector('.faq-answer');
      if (answer) gsap.fromTo(answer, { y: -8, opacity: 0.6 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    }
  });
});

// ── GLOFOX IFRAME ────────────────────────────────────────────
// L'iframe Glofox est auto-dimensionnée par iframe-resizer (init dans
// chaque page concernée). Rien à gérer ici : pas de hauteur figée,
// pas de scroll interne, l'embed grandit à la hauteur de son contenu.

// ── SCROLL PROGRESS BAR ───────────────────────────────────────
const progressBar = document.createElement('div');
progressBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:var(--accent);z-index:9999;width:0%;transition:none;pointer-events:none;';
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
  const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = Math.min(scrolled, 100) + '%';
}, { passive: true });


