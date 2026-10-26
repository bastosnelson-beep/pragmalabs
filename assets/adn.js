/* Bandeau ADN des secteurs (page d'accueil FR/EN/PT)
   Double hélice animée en CSS, secteurs qui apparaissent à tour de rôle.
   La largeur s'adapte au conteneur ; au moins 3 secteurs visibles à tout moment. */
(function () {
  var LABELS = {
    fr: ['Retail de luxe', 'Immobilier', 'Architecture', 'Conseil juridique', 'Industrie', 'Négoce & e-commerce'],
    en: ['Luxury retail', 'Real estate', 'Architecture', 'Legal advisory', 'Manufacturing', 'Wholesale & e-commerce'],
    pt: ['Retalho de luxo', 'Imobiliário', 'Arquitetura', 'Consultoria jurídica', 'Indústria', 'Distribuição & e-commerce']
  };
  // position relative sur l'hélice (0..1), en haut ou en bas, ordre d'apparition
  var SECTORS = [
    { at: 8 / 55, top: true, order: 0 },
    { at: 15 / 55, top: false, order: 3 },
    { at: 22 / 55, top: true, order: 1 },
    { at: 32 / 55, top: false, order: 4 },
    { at: 40 / 55, top: true, order: 2 },
    { at: 47 / 55, top: false, order: 5 }
  ];
  var TWIST = 16, CYCLE = 18, STEP = 24, START = 56, PER_TURN = 22, BOX = 240;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function molSvg(top) {
    return top
      ? '<svg width="34" height="22" viewBox="0 0 34 22" aria-hidden="true"><line x1="5" y1="16" x2="17" y2="5"/><line x1="17" y1="5" x2="29" y2="16"/><circle cx="5" cy="16" r="3" class="g"/><circle cx="17" cy="5" r="3.5"/><circle cx="29" cy="16" r="3" class="g"/></svg>'
      : '<svg width="34" height="22" viewBox="0 0 34 22" aria-hidden="true"><line x1="5" y1="6" x2="17" y2="17"/><line x1="17" y1="17" x2="29" y2="6"/><circle cx="5" cy="6" r="3" class="g"/><circle cx="17" cy="17" r="3.5"/><circle cx="29" cy="6" r="3" class="g"/></svg>';
  }

  function build(el) {
    var lang = el.getAttribute('data-lang') || 'fr';
    var labels = LABELS[lang] || LABELS.fr;
    var W = Math.min(el.clientWidth || 1440, 1440);
    var solo = W < 760;
    var count = Math.max(8, Math.floor((W - 2 * START) / STEP) + 1);
    var start = Math.round((W - (count - 1) * STEP - 8) / 2);
    var h = '<div class="adn-stage" style="width:' + W + 'px">';
    h += '<div class="adn-helix" aria-hidden="true">';
    for (var i = 0; i < count; i++) {
      var d = (-(i / PER_TURN) * TWIST).toFixed(2);
      var st = 'animation-duration:' + TWIST + 's;animation-delay:' + d + 's';
      h += '<div class="adn-rung" style="left:' + (start + i * STEP) + 'px">' +
        '<i class="adn-line" style="' + st + '"></i><i class="adn-a" style="' + st + '"></i><i class="adn-b" style="' + st + '"></i></div>';
    }
    h += '</div>';
    // Au moins 3 secteurs visibles en permanence : 6 secteurs décalés de cyc/6,
    // chacun visible ~la moitié du cycle (desktop : 6 emplacements ; mobile : 3 emplacements partagés).
    var n = SECTORS.length, cyc = CYCLE;
    var box = solo ? 150 : BOX;
    var slots = [{ f: 0.2, top: true }, { f: 0.5, top: false }, { f: 0.8, top: true }];
    SECTORS.forEach(function (s, k) {
      var x, top, order;
      if (solo) {
        var sl = slots[k % 3];
        x = Math.round(W * sl.f); top = sl.top; order = k;
      } else {
        x = start + Math.round(s.at * (count - 1)) * STEP + 4; top = s.top; order = s.order;
      }
      var d = (((order / n) + 0.05) * cyc - cyc).toFixed(2);
      var anim = 'animation-duration:' + cyc + 's;animation-delay:' + d + 's';
      var extra = (solo ? ' solo' : '') + (solo && k >= 3 ? ' rm-hide' : '');
      var boxX = Math.max(0, Math.min(W - box, x - box / 2));
      var num = '<span class="adn-num">' + (k < 9 ? '0' : '') + (k + 1) + '</span>';
      var lab = '<span class="adn-label">' + esc(labels[k]) + '</span>';
      var stem = '<i class="adn-stem"></i>';
      h += '<div class="adn-glow' + extra + '" style="left:' + (x - 30) + 'px;' + anim + '"></div>';
      h += '<div class="adn-mol ' + (top ? 'top' : 'bottom') + extra + '" style="left:' + boxX + 'px;width:' + box + 'px;' + anim + '">' +
        (top ? '<div class="adn-txt">' + num + lab + '</div>' + molSvg(true) + stem
             : stem + molSvg(false) + '<div class="adn-txt">' + lab + num + '</div>') + '</div>';
    });
    h += '</div>';
    el.innerHTML = h;
    el.setAttribute('data-w', W);
  }

  function init() {
    var els = document.querySelectorAll('.adn-band');
    Array.prototype.forEach.call(els, function (el) {
      build(el);
      var t;
      window.addEventListener('resize', function () {
        clearTimeout(t);
        t = setTimeout(function () {
          var W = Math.min(el.clientWidth, 1440);
          if (String(W) !== el.getAttribute('data-w')) build(el);
        }, 200);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
