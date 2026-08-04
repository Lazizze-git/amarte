/* ============================================================
   Amarte Studio — Tracking GTM
   Implémente les événements définis dans le brief Conversion 2026
   ============================================================ */

(function () {
  'use strict';

  // Pousse un event dans le dataLayer (créé si absent)
  window.dataLayer = window.dataLayer || [];
  function push(event, data) {
    window.dataLayer.push(Object.assign({ event: event }, data || {}));
  }

  // ----------------------------------------------------------
  // 1. UTM TRACKING — capture les paramètres Ads et persiste
  // ----------------------------------------------------------
  (function captureUtm() {
    var params = new URLSearchParams(window.location.search);
    var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    var captured = {};
    utmKeys.forEach(function (key) {
      var v = params.get(key);
      if (v) captured[key] = v;
    });
    if (Object.keys(captured).length > 0) {
      try {
        sessionStorage.setItem('amarte_utm', JSON.stringify(captured));
      } catch (e) { /* private mode */ }
      push('utm_tracking', captured);
    }
  })();

  // Récupère les UTM stockés pour les attacher aux events
  function getUtm() {
    try {
      var raw = sessionStorage.getItem('amarte_utm');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  // ----------------------------------------------------------
  // 2. INITIATION_CHECKOUT — clic sur CTAs d'achat
  // ----------------------------------------------------------
  function trackCheckout(el) {
    push('initiation_checkout', Object.assign({
      cta_location: el.getAttribute('data-cta') || 'unknown',
      cta_label: el.textContent.trim().slice(0, 80),
      destination: el.href || '',
      page_path: window.location.pathname
    }, getUtm()));
  }

  // Un début d'achat = un clic vers une page de paiement.
  // On identifie ces liens par leur destination (les URLs d'achat Glofox se
  // terminent par /buy), et non par le nom du data-cta : un nom peut changer,
  // une destination de paiement non. Un clic ne déclenche qu'un seul event.
  //
  // Volontairement exclus, car ce ne sont PAS des achats :
  //   - le lien « Se connecter » (…/memberships?login)
  //   - le widget et les liens de réservation de cours
  // L'achat effectif reste détecté plus bas par conversion_achat.
  function isCheckoutLink(link) {
    var href = link.getAttribute('href') || '';
    if (link.hasAttribute('data-checkout')) return true;
    return /glofox\.com\/.*\/buy(\?|#|$)/i.test(href);
  }

  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    var link = target.closest('a[href]');
    if (link && isCheckoutLink(link)) {
      trackCheckout(link);
    }
  }, { capture: true });

  // ----------------------------------------------------------
  // 3. CONVERSION_ACHAT — "Vous avez acheté avec succès"
  // 4. CONVERSION_RESERVATION — "Merci"
  // Détection via MutationObserver pour les confirmations
  // ----------------------------------------------------------
  var conversionFired = { achat: false, reservation: false };

  function checkConversion(node) {
    if (!node) return;
    var text = (node.textContent || '').toLowerCase();
    if (!conversionFired.achat && /vous avez acheté avec succès/i.test(text)) {
      conversionFired.achat = true;
      push('conversion_achat', Object.assign({
        page_path: window.location.pathname,
        method: 'dom-detection'
      }, getUtm()));
    }
    // "Merci" seul est trop large, on cible le mot dans un contexte de confirmation
    if (!conversionFired.reservation && /\bmerci\b/i.test(text) && /(réservé|réservation|confirmé|confirmation)/i.test(text)) {
      conversionFired.reservation = true;
      push('conversion_reservation', Object.assign({
        page_path: window.location.pathname,
        method: 'dom-detection'
      }, getUtm()));
    }
  }

  // Scan initial
  checkConversion(document.body);

  // Scan continu (cas du chargement async / SPA)
  if ('MutationObserver' in window) {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType === 1) checkConversion(n);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ----------------------------------------------------------
  // 5. PAGE_VIEW enrichi (avec UTM si présents)
  // ----------------------------------------------------------
  push('page_view_enriched', Object.assign({
    page_path: window.location.pathname,
    page_title: document.title
  }, getUtm()));
})();
