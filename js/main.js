gsap.registerPlugin(ScrollTrigger);

// === FOOTER YEAR ===
document.querySelectorAll('.footer-year').forEach(el => el.textContent = new Date().getFullYear());

// === NAV SCROLL ===
const header = document.getElementById('nav-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// === ACTIVE NAV ===
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === path) link.setAttribute('aria-current', 'page');
  });
})();

// === BURGER / MENU ===
const burger = document.getElementById('burger-btn');
const menu   = document.getElementById('nav-menu');
let menuOpen = false;

if (burger && menu) {
  function toggleMenu(open) {
    menuOpen = open;
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => toggleMenu(!menuOpen));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
}

// === HERO ANIMATIONS (homepage only) ===
const heroLines = ['hl0','hl1','hl2'].map(id => document.getElementById(id)).filter(Boolean);
if (heroLines.length) {
  const heroImg = document.getElementById('hero-img');
  const heroSub = document.getElementById('hero-sub');
  const heroBtn = document.getElementById('hero-btn');

  if (heroImg) gsap.fromTo(heroImg, { scale: 1.08 }, { scale: 1, duration: 1.8, ease: 'power2.out' });

  gsap.fromTo(heroLines,
    { y: '105%', opacity: 1 },
    { y: '0%', opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.2 }
  );

  if (heroSub && heroBtn) {
    gsap.fromTo([heroSub, heroBtn],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.12, delay: 0.75 }
    );
  }
}

// === SCROLL REVEALS ===
document.querySelectorAll('.gs-reveal').forEach(el => {
  gsap.fromTo(el,
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' } }
  );
});

document.querySelectorAll('.gs-stagger').forEach(el => {
  gsap.fromTo(Array.from(el.children),
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 90%' } }
  );
});

document.querySelectorAll('.gs-img-reveal').forEach(wrap => {
  const inner = wrap.querySelector('.gs-img-inner');
  gsap.fromTo(wrap,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut',
      scrollTrigger: { trigger: wrap, start: 'top 85%' } }
  );
  if (inner) {
    gsap.fromTo(inner,
      { scale: 1.15 },
      { scale: 1, duration: 1.2, ease: 'power3.inOut',
        scrollTrigger: { trigger: wrap, start: 'top 85%' } }
    );
  }
});

// === TESTIMONIALS (homepage only) ===
const testimonials = [
  { text: 'Une expérience fantastique. L\'accueil est chaleureux, l\'espace est spacieux et les installations sont entièrement neuves. Je me sens vraiment chez moi.', author: 'Sophie M.', detail: 'Membre depuis 6 mois · Yoga Flow' },
  { text: 'J\'avais peur de ne pas être au niveau. Mais les enseignants proposent toujours des adaptations. Pour la première fois, j\'ai trouvé un cours vraiment accessible.', author: 'Laurent D.', detail: 'Membre depuis 3 mois · Pilates' },
  { text: 'Ce que j\'apprécie chez Amarte, c\'est l\'absence de compétition. On vient pour soi, pas pour performer. Cette ambiance est rare.', author: 'Nathalie R.', detail: 'Membre depuis 1 an · Tous cours' },
  { text: 'J\'ai commencé avec le pack Découverte. Deux semaines plus tard, j\'ai pris l\'abonnement mensuel. Amarte m\'a redonné le goût du mouvement.', author: 'Isabelle C.', detail: 'Membre depuis 8 mois · Yoga &amp; Bien-être' }
];

const quoteEl = document.getElementById('testi-quote');
if (quoteEl) {
  let currentTesti = 0;
  const authorEl  = document.getElementById('testi-author');
  const detailEl  = document.getElementById('testi-detail');
  const counterEl = document.getElementById('testi-counter');
  const dotsEl    = document.getElementById('testi-dots');

  function renderTesti(index) {
    const t = testimonials[index];
    quoteEl.innerHTML = '“' + t.text + '”';
    if (authorEl)  authorEl.textContent = t.author;
    if (detailEl)  detailEl.innerHTML   = t.detail;
    if (counterEl) counterEl.textContent = (index + 1) + ' / ' + testimonials.length;
    quoteEl.classList.remove('fade-slide');
    void quoteEl.offsetWidth;
    quoteEl.classList.add('fade-slide');
    if (dotsEl) dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === index));
  }

  if (dotsEl) {
    testimonials.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'testi-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Témoignage ' + (i + 1));
      btn.addEventListener('click', () => { currentTesti = i; renderTesti(i); });
      dotsEl.appendChild(btn);
    });
  }

  renderTesti(0);
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { currentTesti = (currentTesti === 0 ? testimonials.length - 1 : currentTesti - 1); renderTesti(currentTesti); });
  if (nextBtn) nextBtn.addEventListener('click', () => { currentTesti = (currentTesti === testimonials.length - 1 ? 0 : currentTesti + 1); renderTesti(currentTesti); });
}

// === CONTACT FORMS (any page) ===
document.querySelectorAll('.contact-form').forEach(form => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const wrap = this.closest('.form-wrap');
    if (wrap) {
      wrap.innerHTML = '<div class="form-success"><p class="form-success-title">Merci.</p><p class="form-success-sub">Nous vous répondons dans les 24 heures.</p></div>';
    }
  });
});

// Legacy support for old form id
const legacyForm = document.getElementById('contact-form');
if (legacyForm && !legacyForm.classList.contains('contact-form')) {
  legacyForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const wrap = document.getElementById('form-wrap');
    if (wrap) {
      wrap.innerHTML = '<div class="form-success"><p class="form-success-title">Merci.</p><p class="form-success-sub">Nous vous répondons dans les 24 heures.</p></div>';
    }
  });
}

// === FAQ ACCORDION ===
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});
