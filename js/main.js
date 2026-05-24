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
  gsap.fromTo(el,
    { y: 44, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 91%' } }
  );
});

// 2. gs-stagger : enfants en cascade avec direction variable
document.querySelectorAll('.gs-stagger').forEach(el => {
  const children = Array.from(el.children).filter(c => c.tagName !== 'BR');
  gsap.fromTo(children,
    { y: 36, opacity: 0, scale: 0.98 },
    { y: 0, opacity: 1, scale: 1, duration: 0.78, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%' } }
  );
});

// 3. Section labels — slide depuis la gauche
document.querySelectorAll('.section-label').forEach(el => {
  gsap.fromTo(el,
    { x: -20, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%' } }
  );
});

// 4. Titres de section — clip-path wipe (Core Atelier style)
document.querySelectorAll('h1.page-hero-title, h2.pf-hero-title').forEach(el => {
  gsap.fromTo(el,
    { clipPath: 'inset(0 0 100% 0)', y: 18 },
    { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.05, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } }
  );
});

// h2 généraux — fade + légère montée
document.querySelectorAll('h2:not(.pf-hero-title):not(.booking-cta-title)').forEach(el => {
  gsap.fromTo(el,
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' } }
  );
});

// booking-cta-title — scale-in depuis légèrement plus grand
document.querySelectorAll('.booking-cta-title, .pf-pack-title, .corps-why-title, .corpo-cta-title').forEach(el => {
  gsap.fromTo(el,
    { scale: 1.03, opacity: 0, y: 12 },
    { scale: 1, opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } }
  );
});

// 5. Images — clip-path reveal + scale intérieure
document.querySelectorAll('.gs-img-reveal').forEach(wrap => {
  const inner = wrap.querySelector('.gs-img-inner');
  gsap.fromTo(wrap,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut',
      scrollTrigger: { trigger: wrap, start: 'top 85%' } }
  );
  if (inner) gsap.fromTo(inner, { scale: 1.18 }, { scale: 1, duration: 1.3, ease: 'power4.inOut',
    scrollTrigger: { trigger: wrap, start: 'top 85%' } });
});

// 6. Cours item cards — stagger par rangée (trigger sur la grille)
const coursGrid = document.querySelector('.cours-grid');
if (coursGrid) {
  const items = coursGrid.querySelectorAll('.cours-item');
  gsap.fromTo(items,
    { y: 36, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out',
      stagger: { amount: 0.45, from: 'start' },
      scrollTrigger: { trigger: coursGrid, start: 'top 88%' }
    }
  );
}

// 7. Cards classes (homepage) — stagger sur le conteneur, fluide
const classSection = document.querySelector('.classes-grid, .classes-list, [class*="classes"]');
if (classSection) {
  const cards = classSection.querySelectorAll('.class-card');
  gsap.fromTo(cards,
    { y: 32, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
      stagger: { amount: 0.35, from: 'start' },
      scrollTrigger: { trigger: classSection, start: 'top 86%' }
    }
  );
} else {
  // Fallback si pas de conteneur commun
  document.querySelectorAll('.class-card').forEach((el, i) => {
    gsap.fromTo(el,
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 91%' },
        delay: Math.min(i * 0.06, 0.3)
      }
    );
  });
}

// 8. Stats corpo — count-up + bounce
document.querySelectorAll('.corpo-stat-val').forEach(el => {
  gsap.fromTo(el,
    { y: 40, opacity: 0, scale: 0.85 },
    { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.8)',
      scrollTrigger: { trigger: el, start: 'top 88%' } }
  );
});

// 9. Trust strip items — container stagger
const trustItems = document.querySelectorAll('.trust-item');
if (trustItems.length) {
  gsap.fromTo(Array.from(trustItems),
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
      stagger: { amount: 0.4, from: 'start' },
      scrollTrigger: { trigger: trustItems[0].parentElement, start: 'top 90%' }
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
      scrollTrigger: { trigger: tarifCards[0].parentElement, start: 'top 88%' }
    }
  );
}

// 11. Pack offre déco — scale depuis le centre
document.querySelectorAll('.pf-pack-price-block, .tarifs-decouverte-price-block').forEach(el => {
  gsap.fromTo(el,
    { scale: 0.88, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: el, start: 'top 88%' } }
  );
});

// 12. Image parallax — sur toutes les images hero
document.querySelectorAll('.pf-hero-img, .cours-hero-img-wrap img, .about-img').forEach(img => {
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
      scrollTrigger: { trigger: corpoOfferCards[0].parentElement, start: 'top 85%' }
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
      scrollTrigger: { trigger: corpoSteps[0].parentElement, start: 'top 88%' }
    }
  );
}

// 15. Testimonial quote — clip-path + fade
const quoteEl = document.getElementById('testi-quote');
if (quoteEl) {
  gsap.fromTo(quoteEl,
    { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: quoteEl, start: 'top 88%' } }
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
    gsap.to(btn, { x: x * 0.18, y: y * 0.18, duration: 0.3, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  });
});

// ── TESTIMONIALS (homepage only) ─────────────────────────────
const testimonials = [
  { text: 'Une expérience fantastique. L\'accueil est chaleureux, l\'espace est spacieux et les installations sont entièrement neuves. Je me sens vraiment chez moi.', author: 'Sophie M.', detail: 'Membre depuis 6 mois · Yoga Flow' },
  { text: 'J\'avais peur de ne pas être au niveau. Mais les enseignants proposent toujours des adaptations. Pour la première fois, j\'ai trouvé un cours vraiment accessible.', author: 'Laurent D.', detail: 'Membre depuis 3 mois · Pilates' },
  { text: 'Ce que j\'apprécie chez Amarte, c\'est l\'absence de compétition. On vient pour soi, pas pour performer. Cette ambiance est rare.', author: 'Nathalie R.', detail: 'Membre depuis 1 an · Tous cours' },
  { text: 'J\'ai commencé avec le pack Découverte. Deux semaines plus tard, j\'ai pris l\'abonnement mensuel. Amarte m\'a redonné le goût du mouvement.', author: 'Isabelle C.', detail: 'Membre depuis 8 mois · Yoga &amp; Bien-être' }
];

if (quoteEl) {
  let currentTesti = 0;
  const authorEl   = document.getElementById('testi-author');
  const detailEl   = document.getElementById('testi-detail');
  const counterEl  = document.getElementById('testi-counter');
  const dotsEl     = document.getElementById('testi-dots');
  const mobileTrack = document.getElementById('testi-mobile-track');
  const mobileMQ   = window.matchMedia('(max-width: 768px)');

  function renderTesti(index, dir = 1) {
    const t = testimonials[index];
    gsap.to(quoteEl, { opacity: 0, x: dir * -20, duration: 0.25, ease: 'power2.in', onComplete: () => {
      quoteEl.innerHTML = '“' + t.text + '”';
      if (authorEl)  authorEl.textContent = t.author;
      if (detailEl)  detailEl.innerHTML   = t.detail;
      if (counterEl) counterEl.textContent = (index + 1) + ' / ' + testimonials.length;
      gsap.fromTo(quoteEl, { opacity: 0, x: dir * 20 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' });
    }});
    syncDots(index);
  }

  function syncDots(index) {
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === index));
    if (counterEl) counterEl.textContent = (index + 1) + ' / ' + testimonials.length;
  }

  // ─── Rendu cartes mobiles (scroll horizontal natif) ───
  if (mobileTrack) {
    testimonials.forEach((t) => {
      const card = document.createElement('article');
      card.className = 'testi-mobile-card';
      card.innerHTML =
        '<blockquote class="testi-mobile-quote">“' + t.text + '”</blockquote>' +
        '<div class="testi-mobile-author">' +
          '<p class="testi-mobile-name"></p>' +
          '<p class="testi-mobile-detail"></p>' +
        '</div>';
      card.querySelector('.testi-mobile-name').textContent = t.author;
      card.querySelector('.testi-mobile-detail').innerHTML = t.detail;
      mobileTrack.appendChild(card);
    });
  }

  // ─── Points (dots) cliquables — pilote desktop ET mobile ───
  if (dotsEl) {
    testimonials.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'testi-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Témoignage ' + (i + 1));
      btn.addEventListener('click', () => {
        goTo(i, i > currentTesti ? 1 : -1);
        resetAutoRotate();
      });
      dotsEl.appendChild(btn);
    });
  }

  function goTo(index, dir = 1) {
    currentTesti = index;
    if (mobileMQ.matches && mobileTrack) {
      const cards = mobileTrack.querySelectorAll('.testi-mobile-card');
      if (cards[index]) mobileTrack.scrollTo({ left: cards[index].offsetLeft - mobileTrack.offsetLeft, behavior: 'smooth' });
      syncDots(index);
    } else {
      renderTesti(index, dir);
    }
  }

  renderTesti(0);
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    const prev = currentTesti === 0 ? testimonials.length - 1 : currentTesti - 1;
    goTo(prev, -1); resetAutoRotate();
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    const next = currentTesti === testimonials.length - 1 ? 0 : currentTesti + 1;
    goTo(next, 1); resetAutoRotate();
  });

  // ─── Sync points sur scroll mobile (utilisateur swipe) ───
  if (mobileTrack && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          const cards = Array.from(mobileTrack.querySelectorAll('.testi-mobile-card'));
          const idx = cards.indexOf(entry.target);
          if (idx !== -1 && idx !== currentTesti) {
            currentTesti = idx;
            syncDots(idx);
          }
        }
      });
    }, { root: mobileTrack, threshold: 0.6 });
    mobileTrack.querySelectorAll('.testi-mobile-card').forEach((c) => io.observe(c));

    // L'utilisateur a touché le carrousel : on rétablit le timer après son geste
    let touchTimer;
    ['touchstart', 'pointerdown'].forEach((ev) => {
      mobileTrack.addEventListener(ev, () => { pauseAutoRotate(); clearTimeout(touchTimer); }, { passive: true });
    });
    ['touchend', 'pointerup', 'pointercancel'].forEach((ev) => {
      mobileTrack.addEventListener(ev, () => { clearTimeout(touchTimer); touchTimer = setTimeout(resetAutoRotate, 1200); }, { passive: true });
    });
  }

  // ─── Auto-rotation toutes les 6 secondes (desktop + mobile) ───
  const AUTO_DELAY = 6000;
  let autoTimer = null;
  function startAutoRotate() {
    if (autoTimer) return;
    autoTimer = setInterval(() => {
      const next = (currentTesti + 1) % testimonials.length;
      goTo(next, 1);
    }, AUTO_DELAY);
  }
  function pauseAutoRotate() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }
  function resetAutoRotate() {
    pauseAutoRotate();
    startAutoRotate();
  }

  // Pause quand l'onglet est inactif, reprise au retour
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAutoRotate(); else startAutoRotate();
  });

  startAutoRotate();
}

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

// Legacy form
const legacyForm = document.getElementById('contact-form');
if (legacyForm && !legacyForm.classList.contains('contact-form')) {
  legacyForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const wrap = document.getElementById('form-wrap');
    if (wrap) wrap.innerHTML = '<div class="form-success"><p class="form-success-title">Merci.</p><p class="form-success-sub">Nous vous répondons dans les 24 heures.</p></div>';
  });
}

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

// ── SCROLL PROGRESS BAR ───────────────────────────────────────
const progressBar = document.createElement('div');
progressBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:var(--accent);z-index:9999;width:0%;transition:none;pointer-events:none;';
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
  const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = Math.min(scrolled, 100) + '%';
}, { passive: true });

