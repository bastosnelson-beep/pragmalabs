/* Formation Snowball — accès par mot de passe, progression, déroulé de page */
(function () {
  'use strict';
  var CLE = 'snowball-formation-cle';
  var PROG = 'snowball-formation-progression';
  var cfg = window.SNOWBALL_ACCES || {};
  var corps = document.body;
  var page = corps.getAttribute('data-page');
  var LANGUE = 'snowball-formation-langue';
  var en = (document.documentElement.lang || 'fr').slice(0, 2) === 'en';
  var TXT = en ? {
    navigateur: 'This browser cannot open the course. Please use a recent version of Chrome, Edge, Firefox or Safari.',
    verification: 'Checking…', incorrect: 'Incorrect password.', acceder: 'Open the course',
    terminees: function (f, t) { return f + ' of ' + t + ' lesson' + (t > 1 ? 's' : '') + ' completed'; },
    lecons: function (n, t) { return n + ' / ' + t + ' lessons'; },
    fait: '✓ Lesson completed', marquer: 'Mark as complete', reprendre: 'Pick up where I left off'
  } : {
    navigateur: 'Ce navigateur ne permet pas d’ouvrir la formation. Utilisez une version récente de Chrome, Edge, Firefox ou Safari.',
    verification: 'Vérification…', incorrect: 'Mot de passe incorrect.', acceder: 'Accéder à la formation',
    terminees: function (f, t) { return f + ' leçon' + (f > 1 ? 's' : '') + ' terminée' + (f > 1 ? 's' : '') + ' sur ' + t; },
    lecons: function (n, t) { return n + ' / ' + t + ' leçons'; },
    fait: '✓ Leçon terminée', marquer: 'Marquer comme terminée', reprendre: 'Reprendre là où j’en suis'
  };

  function lire(store, k) { try { return window[store].getItem(k); } catch (e) { return null; } }
  function ecrire(store, k, v) { try { window[store].setItem(k, v); } catch (e) {} }
  function effacer(store, k) { try { window[store].removeItem(k); } catch (e) {} }

  function b64(s) { var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function versB64(buf) { var u = new Uint8Array(buf), s = ''; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }

  function deriver(motDePasse) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(motDePasse), 'PBKDF2', false, ['deriveBits']).then(function (base) {
      return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: b64(cfg.sel), iterations: cfg.iterations, hash: 'SHA-256' }, base, 256);
    });
  }
  function dechiffrer(brute) {
    var donnees = JSON.parse(document.getElementById('f-donnees').textContent);
    return crypto.subtle.importKey('raw', brute, 'AES-GCM', false, ['decrypt']).then(function (cle) {
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(donnees.iv) }, cle, b64(donnees.ct));
    }).then(function (clair) { return new TextDecoder().decode(clair); });
  }

  function afficher(html) {
    document.getElementById('f-acces').classList.add('f-cache');
    var app = document.getElementById('f-app');
    app.innerHTML = html;
    app.classList.remove('f-cache');
    document.querySelectorAll('.f-connecte').forEach(function (el) { el.classList.remove('f-cache'); });
    initialiser();
    if (window.noyauConstruire) window.noyauConstruire(app);
    if (location.hash) { var cible = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (cible) cible.scrollIntoView(); }
  }

  // ---------- Accès ----------
  function demarrer() {
    if (!window.crypto || !crypto.subtle) {
      document.querySelector('#f-acces .erreur').textContent = TXT.navigateur;
      return;
    }
    var memo = lire('sessionStorage', CLE) || lire('localStorage', CLE);
    if (memo) {
      dechiffrer(b64(memo)).then(afficher).catch(function () { effacer('sessionStorage', CLE); effacer('localStorage', CLE); montrerAcces(); });
    } else montrerAcces();
  }
  function montrerAcces() {
    var bloc = document.getElementById('f-acces');
    bloc.classList.remove('f-cache');
    var form = bloc.querySelector('form'), champ = bloc.querySelector('input[type=password]'), err = bloc.querySelector('.erreur'), bouton = bloc.querySelector('button');
    champ.focus();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = ''; bouton.disabled = true; bouton.textContent = TXT.verification;
      deriver(champ.value).then(function (brute) {
        return dechiffrer(brute).then(function (html) {
          var k = versB64(brute);
          ecrire('sessionStorage', CLE, k);
          if (bloc.querySelector('input[type=checkbox]').checked) ecrire('localStorage', CLE, k);
          afficher(html);
        });
      }).catch(function () {
        err.textContent = TXT.incorrect;
        bouton.disabled = false; bouton.textContent = TXT.acceder;
        champ.select();
      });
    });
  }
  window.snowballDeconnexion = function () { effacer('sessionStorage', CLE); effacer('localStorage', CLE); location.reload(); };

  // ---------- Progression ----------
  function progression() { try { return JSON.parse(lire('localStorage', PROG) || '[]'); } catch (e) { return []; } }
  function majProgression() {
    var faits = progression();
    document.querySelectorAll('.f-lecon[data-slug]').forEach(function (li) { li.classList.toggle('fait', faits.indexOf(li.getAttribute('data-slug')) > -1); });
    var total = 0, fait = 0;
    document.querySelectorAll('[data-bloc-lecons]').forEach(function (bloc) {
      var slugs = bloc.getAttribute('data-bloc-lecons').split(' ').filter(Boolean);
      var n = slugs.filter(function (s) { return faits.indexOf(s) > -1; }).length;
      var compte = bloc.querySelector('.f-bloc-compte'); if (compte) compte.textContent = n + '/' + slugs.length;
      var barre = bloc.querySelector('.f-barre > span'); if (barre) barre.style.width = (slugs.length ? Math.round(100 * n / slugs.length) : 0) + '%';
      var txt = bloc.querySelector('.f-compte-txt'); if (txt) txt.textContent = TXT.lecons(n, slugs.length);
      bloc.classList.toggle('fait', slugs.length > 0 && n === slugs.length);
      if (bloc.hasAttribute('data-compte-global')) { total += slugs.length; fait += n; }
    });
    var g = document.querySelector('.f-progression-globale');
    if (g) { g.querySelector('.f-barre > span').style.width = (total ? Math.round(100 * fait / total) : 0) + '%'; g.querySelector('p').textContent = TXT.terminees(fait, total); }
    var bt = document.querySelector('.f-terminer');
    if (bt) { var ok = faits.indexOf(page) > -1; bt.setAttribute('aria-pressed', ok ? 'true' : 'false'); bt.textContent = ok ? TXT.fait : TXT.marquer; }
    var reprendre = document.querySelector('[data-reprendre]');
    if (reprendre) {
      var ordre = (reprendre.getAttribute('data-reprendre') || '').split(' ');
      var prochaine = ordre.filter(function (s) { return faits.indexOf(s) < 0; })[0];
      if (prochaine && fait > 0) { reprendre.setAttribute('href', 'lecons/' + prochaine + '.html'); reprendre.textContent = TXT.reprendre; }
    }
  }

  // ---------- Déroulé de la page (colonne droite) ----------
  function suiviTitres() {
    var liens = Array.prototype.slice.call(document.querySelectorAll('.f-deroule a[href^="#"]'));
    if (!liens.length || !('IntersectionObserver' in window)) return;
    var titres = liens.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
    function activer() {
      var seuil = 120, actif = 0;
      titres.forEach(function (t, i) { if (t && t.getBoundingClientRect().top - seuil <= 0) actif = i; });
      liens.forEach(function (a, i) { a.classList.toggle('actif', i === actif); });
      var a = liens[actif], col = document.querySelector('.f-deroule');
      if (a && col) { var r = a.getBoundingClientRect(), c = col.getBoundingClientRect(); if (r.top < c.top + 40 || r.bottom > c.bottom - 40) col.scrollTop += r.top - c.top - c.height / 3; }
    }
    var attente = false;
    window.addEventListener('scroll', function () { if (!attente) { attente = true; requestAnimationFrame(function () { activer(); attente = false; }); } }, { passive: true });
    activer();
  }

  // ---------- Bascule FR / EN ----------
  // Même page dans l'autre langue, au même endroit (les ancres de titres sont identiques en FR et en EN).
  function langues() {
    ecrire('localStorage', LANGUE, en ? 'en' : 'fr');
    document.querySelectorAll('.f-langue a[data-langue]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (a.getAttribute('aria-current') === 'true') { e.preventDefault(); return; }
        ecrire('localStorage', LANGUE, a.getAttribute('data-langue'));
        var titres = Array.prototype.slice.call(document.querySelectorAll('.f-contenu h2[id], .f-contenu h3[id]'));
        var courant = null;
        titres.forEach(function (t) { if (t.getBoundingClientRect().top - 140 <= 0) courant = t.id; });
        if (courant) { e.preventDefault(); location.href = a.getAttribute('href') + '#' + encodeURIComponent(courant); }
      });
    });
  }

  function initialiser() {
    langues();
    majProgression();
    var bt = document.querySelector('.f-terminer');
    if (bt) bt.addEventListener('click', function () {
      var faits = progression(), i = faits.indexOf(page);
      if (i > -1) faits.splice(i, 1); else faits.push(page);
      ecrire('localStorage', PROG, JSON.stringify(faits)); majProgression();
    });
    suiviTitres();
    // fil rouge : faire défiler jusqu'à la leçon active
    var actif = document.querySelector('.f-fil a.actif');
    if (actif) { var fil = document.querySelector('.f-fil'); fil.scrollTop = actif.offsetTop - fil.clientHeight / 3; }
    // menu mobile
    var menu = document.querySelector('.f-menu');
    if (menu) menu.addEventListener('click', function () { corps.classList.toggle('fil-ouvert'); });
    document.querySelectorAll('.f-fil a').forEach(function (a) { a.addEventListener('click', function () { corps.classList.remove('fil-ouvert'); }); });
  }

  demarrer();
})();
