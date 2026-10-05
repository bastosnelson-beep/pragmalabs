/* ============================================================
   PRAGMALABS - Diagramme animé « Le Noyau »
   Les entrées dispersées du quotidien convergent vers le Noyau
   (second cerveau), qui les transforme en travail exécuté.
   Scène fixe 1300 x 870, mise à l'échelle de son conteneur.
   Utilisation : <div class="noyau-diagram" data-lang="fr"></div>
   ============================================================ */
(function () {
  'use strict';

  var W = 1300, H = 870, CX = 643, CY = 433, R = 193;

  var I18N = {
    fr: {
      left: 'Le flux dispersé du travail quotidien',
      right: 'Une exécution systématique',
      core: 'Second cerveau', coreSub: 'IA',
      title: 'LE NOYAU', subtitle: "SYSTÈME D'EXPLOITATION IA",
      orbit: ['Modèle', 'Contexte', 'Agents', 'Process'],
      inputs: [
        ['Voix & messages', 'WhatsApp / Telegram'],
        ['Notes & brouillons', 'Google Docs / Apple Notes'],
        ['Réunions vidéo', 'Google Meet / Zoom'],
        ['Livres & surlignages', 'Kindle / Readwise'],
        ['Données & CRM', 'Notion / Obsidian / Asana'],
        ['Réseaux & veille', 'LinkedIn / Instagram / X'],
        ['Audio & inspiration', 'Podcasts / YouTube']
      ],
      outputs: ['Emails & messages', 'Planning & agenda', 'Création de contenu', 'Présentations & pitchs',
        'Prospection & ventes', 'Gestion de projet', 'Support client'],
      aria: "Diagramme du Noyau : les informations dispersées de l'entreprise convergent vers un second cerveau IA qui les transforme en travail exécuté."
    },
    en: {
      left: 'The scattered flow of everyday work',
      right: 'Systematic execution',
      core: 'Second brain', coreSub: 'AI',
      title: 'THE KERNEL', subtitle: 'AI OPERATING SYSTEM',
      orbit: ['Model', 'Context', 'Agents', 'Process'],
      inputs: [
        ['Voice & messages', 'WhatsApp / Telegram'],
        ['Notes & drafts', 'Google Docs / Apple Notes'],
        ['Video meetings', 'Google Meet / Zoom'],
        ['Books & highlights', 'Kindle / Readwise'],
        ['Databases & CRM', 'Notion / Obsidian / Asana'],
        ['Social & monitoring', 'LinkedIn / Instagram / X'],
        ['Audio & inspiration', 'Podcasts / YouTube']
      ],
      outputs: ['Emails & messages', 'Planning & calendar', 'Content creation', 'Presentations & pitch',
        'Prospecting & sales', 'Project management', 'Customer support'],
      aria: "Kernel diagram: the company's scattered inputs converge into an AI second brain that turns them into executed work."
    },
    pt: {
      left: 'O fluxo disperso do trabalho diário',
      right: 'Execução sistemática',
      core: 'Segundo cérebro', coreSub: 'IA',
      title: 'O NÚCLEO', subtitle: 'SISTEMA OPERATIVO DE IA',
      orbit: ['Modelo', 'Contexto', 'Agentes', 'Processo'],
      inputs: [
        ['Voz e mensagens', 'WhatsApp / Telegram'],
        ['Notas e rascunhos', 'Google Docs / Apple Notes'],
        ['Reuniões por vídeo', 'Google Meet / Zoom'],
        ['Livros e destaques', 'Kindle / Readwise'],
        ['Dados e CRM', 'Notion / Obsidian / Asana'],
        ['Redes e monitorização', 'LinkedIn / Instagram / X'],
        ['Áudio e inspiração', 'Podcasts / YouTube']
      ],
      outputs: ['E-mails e mensagens', 'Planeamento e agenda', 'Criação de conteúdos', 'Apresentações e pitch',
        'Prospeção e vendas', 'Gestão de projetos', 'Apoio ao cliente'],
      aria: 'Diagrama do Núcleo: a informação dispersa da empresa converge para um segundo cérebro de IA que a transforma em trabalho executado.'
    }
  };

  /* Icônes au trait (24 x 24), dessinées pour le site */
  var ICONS = {
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    book: '<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v14"/>',
    db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3 3 7 3s7-1.3 7-3"/>',
    social: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>',
    audio: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    screen: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    check: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>',
    support: '<path d="M4 6h12v8H9l-4 3v-3H4z"/><path d="M16 9h4v8h-1v3l-3-3h-4v-3"/>',
    model: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    context: '<path d="M3 6h7l2 2h9v11H3z"/>',
    agents: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    process: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3 3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3 3 3 0 0 1-3-3"/><path d="M9 9h1M14 9h1M9 14h1M14 14h1"/>'
  };
  function icon(name, size, stroke) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + stroke +
      '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* Positions issues du visuel d'origine */
  var IN_POS = [[45, 93], [173, 200], [23, 317], [152, 435], [45, 563], [195, 670], [77, 777]];
  var OUT_POS = [[942, 93], [1050, 200], [985, 307], [1050, 413], [963, 520], [1028, 627], [942, 734]];
  var IN_ICONS = ['chat', 'doc', 'video', 'book', 'db', 'social', 'audio'];
  var OUT_ICONS = ['mail', 'calendar', 'pen', 'screen', 'target', 'check', 'support'];
  var ORBIT_ICONS = ['model', 'context', 'agents', 'process'];
  var ORBIT_COLORS = ['#2060DF', '#5B6E99', '#0B1B3F', '#7887AB'];

  function build(root) {
    var lang = (root.dataset.lang || document.documentElement.lang || 'fr').slice(0, 2);
    var t = I18N[lang] || I18N.fr;
    root.setAttribute('role', 'img');
    root.setAttribute('aria-label', t.aria);

    var svg = '<svg class="nd-lines" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">';
    svg += '<circle class="nd-ring" cx="' + CX + '" cy="' + CY + '" r="' + R + '"/>';
    [[557, 133], [803, 156], [877, 241], [727, 217], [450, 300], [790, 590], [537, 776], [856, 595], [430, 198]].forEach(function (d, i) {
      svg += '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="' + (i % 3 === 0 ? 4 : 2.5) + '" fill="#D5DAE6"/>';
    });
    IN_POS.forEach(function (p) {
      var x = p[0] + 235, y = p[1] + 30;
      svg += '<path class="nd-flow nd-in" d="M' + x + ' ' + y + ' C' + (x + 170) + ' ' + y + ', ' + (CX - 120) + ' ' + CY + ', ' + (CX - 40) + ' ' + CY + '"/>';
    });
    OUT_POS.forEach(function (p) {
      var x = p[0], y = p[1] + 30;
      svg += '<path class="nd-flow nd-out" d="M' + (CX + 40) + ' ' + CY + ' C' + (CX + 120) + ' ' + CY + ', ' + (x - 170) + ' ' + y + ', ' + x + ' ' + y + '"/>';
    });
    svg += '</svg>';

    var html = '<div class="nd-sizer"></div><div class="nd-stage">';
    html += '<div class="nd-glow"></div>' + svg;
    html += '<div class="nd-caption" style="left:110px">' + esc(t.left) + '</div>';
    html += '<div class="nd-caption" style="right:160px">' + esc(t.right) + '</div>';
    html += '<div class="nd-beam"></div>';
    html += '<div class="nd-core">' + icon('brain', 50, '#2060DF') +
      '<div class="nd-core-name">' + esc(t.core) + '</div><div class="nd-core-sub">' + esc(t.coreSub) + '</div></div>';
    html += '<div class="nd-title"><div>' + esc(t.title) + '</div><div>' + esc(t.subtitle) + '</div></div>';
    IN_POS.forEach(function (p, i) {
      html += '<div class="nd-card nd-card-in" style="left:' + p[0] + 'px;top:' + p[1] + 'px">' +
        '<span class="nd-ico">' + icon(IN_ICONS[i], 19, '#0B1B3F') + '</span>' +
        '<span><b>' + esc(t.inputs[i][0]) + '</b><small>' + esc(t.inputs[i][1]) + '</small></span></div>';
    });
    OUT_POS.forEach(function (p, i) {
      html += '<div class="nd-card nd-card-out" style="left:' + p[0] + 'px;top:' + p[1] + 'px">' +
        '<span class="nd-ico">' + icon(OUT_ICONS[i], 19, '#2060DF') + '</span><b>' + esc(t.outputs[i]) + '</b></div>';
    });
    t.orbit.forEach(function (label, i) {
      html += '<div class="nd-orbit"><span class="nd-orbit-ico" style="color:' + ORBIT_COLORS[i] + '">' +
        icon(ORBIT_ICONS[i], 21, 'currentColor') + '</span><span class="nd-orbit-label">' + esc(label) + '</span></div>';
    });
    html += '</div>';
    root.innerHTML = html;

    var stage = root.querySelector('.nd-stage');
    var orbit = [].slice.call(root.querySelectorAll('.nd-orbit'));
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Mise à l'échelle de la scène dans son conteneur */
    var sizer = root.querySelector('.nd-sizer'), MIN_K = 0.62, centered = false;
    function fit() {
      var k = Math.min(1, root.clientWidth / W);
      var scroll = k < MIN_K;                 /* petits écrans : lisible + défilement horizontal */
      if (scroll) k = MIN_K;
      stage.style.transform = 'scale(' + k + ')';
      sizer.style.width = Math.round(W * k) + 'px';
      sizer.style.height = Math.round(H * k) + 'px';
      root.classList.toggle('nd-scroll', scroll);
      if (scroll && !centered) { root.scrollLeft = (W * k - root.clientWidth) / 2; centered = true; }
    }
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(root);
    else window.addEventListener('resize', fit);
    fit();

    /* Orbite des 4 briques (Modèle, Contexte, Agents, Process) */
    var a = -Math.PI / 2, last = performance.now(), paused = false, visible = true, SECONDS = 36;
    function place() {
      orbit.forEach(function (el, i) {
        var ai = a + i * Math.PI / 2;
        el.style.transform = 'translate(' + (CX + R * Math.cos(ai) - 60) + 'px,' + (CY + R * Math.sin(ai) - 22) + 'px)';
      });
    }
    place();
    if (reduce) { root.classList.add('nd-still'); return; }
    stage.addEventListener('mouseenter', function () { paused = true; });
    stage.addEventListener('mouseleave', function () { paused = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(root);
    }
    (function tick(now) {
      var dt = (now - last) / 1000; last = now;
      if (!paused && visible) { a += dt * 2 * Math.PI / SECONDS; place(); }
      requestAnimationFrame(tick);
    })(performance.now());
  }

  document.addEventListener('DOMContentLoaded', function () {
    [].forEach.call(document.querySelectorAll('.noyau-diagram'), build);
  });
})();
