// PRAGMA4 - interactions de base
document.addEventListener('DOMContentLoaded', () => {
  // Choix manuel de langue (FR / EN / PT) mémorisé : il prime sur la langue du navigateur
  document.querySelectorAll('.lang-switch a').forEach((a) => {
    a.addEventListener('click', () => {
      try { localStorage.setItem('pl-lang', a.textContent.trim().toLowerCase()); } catch (e) {}
    });
  });

  // Suggestion de langue (remplace l'ancienne redirection automatique, déconseillée pour le SEO) :
  // si la langue du navigateur (ou le choix mémorisé) diffère de celle de la page et qu'une version
  // traduite existe (balises hreflang), on propose un lien discret, sans jamais rediriger.
  (function () {
    try {
      var pageLang = (document.documentElement.lang || 'fr').slice(0, 2);
      var saved = null, dismissed = null;
      try { saved = localStorage.getItem('pl-lang'); dismissed = sessionStorage.getItem('pl-lang-banner'); } catch (e) {}
      if (saved === pageLang || dismissed) return;
      var want = saved;
      if (!want) {
        var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
        var first = String(langs[0] || '').toLowerCase();
        want = first.indexOf('fr') === 0 ? 'fr' : (first.indexOf('pt') === 0 ? 'pt' : 'en');
      }
      if (want === pageLang) return;
      var alt = document.querySelector('link[rel="alternate"][hreflang^="' + want + '"]');
      if (!alt) return;
      var txt = {
        fr: ['Cette page existe en français.', 'Voir en français', 'Fermer'],
        en: ['This page is available in English.', 'View in English', 'Close'],
        pt: ['Esta página está disponível em português.', 'Ver em português', 'Fechar']
      }[want];
      var bar = document.createElement('div');
      bar.className = 'lang-banner';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', txt[1]);
      bar.lang = want;
      var span = document.createElement('span');
      span.textContent = txt[0];
      var go = document.createElement('a');
      go.className = 'lang-banner-go';
      go.href = new URL(alt.getAttribute('href')).pathname + location.search + location.hash;
      go.hreflang = want;
      go.textContent = txt[1];
      go.addEventListener('click', function () { try { localStorage.setItem('pl-lang', want); } catch (e) {} });
      var close = document.createElement('button');
      close.type = 'button';
      close.setAttribute('aria-label', txt[2]);
      close.textContent = '×';
      close.addEventListener('click', function () {
        bar.remove();
        try { sessionStorage.setItem('pl-lang-banner', '1'); } catch (e) {}
      });
      bar.appendChild(span); bar.appendChild(go); bar.appendChild(close);
      document.body.appendChild(bar);
    } catch (e) {}
  })();

  // Page Services ouverte depuis un lien de l'accueil (?from=accueil) :
  // bouton flottant pour revenir exactement là où le visiteur lisait.
  (function () {
    var params = new URLSearchParams(location.search);
    if (params.get('from') !== 'accueil' || !document.querySelector('.svc-hero')) return;
    var lang = (document.documentElement.lang || 'fr').slice(0, 2);
    var label = { fr: "Retour à l'accueil, reprendre la lecture", en: 'Back to the homepage, continue reading', pt: 'Voltar à página inicial e continuar a leitura' }[lang] || 'Retour';
    var a = document.createElement('a');
    a.className = 'back-to-home';
    a.href = './#capabilities';
    a.innerHTML = '<span aria-hidden="true">←</span> ' + label;
    a.addEventListener('click', function (e) {
      // Si le visiteur vient bien de l'accueil, on revient dans l'historique : position de lecture conservée.
      try {
        var ref = document.referrer ? new URL(document.referrer) : null;
        if (ref && ref.origin === location.origin && /(^|\/)(index\.html)?$/.test(ref.pathname) && history.length > 1) {
          e.preventDefault();
          history.back();
        }
      } catch (err) {}
    });
    document.body.appendChild(a);
    requestAnimationFrame(function () { a.classList.add('is-visible'); });
  })();

  // Newsletter (pied de page) -> workflow n8n « Pragma4 - Newsletter » -> Supabase (table newsletter_subscribers)
  document.querySelectorAll('.newsletter-form').forEach(function (nf) {
    var input = nf.querySelector('input[name="email"]');
    var status = nf.querySelector('.newsletter-status');
    var btn = nf.querySelector('button[type="submit"]');
    var RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
    var say = function (msg, kind) {
      status.textContent = msg || '';
      status.classList.toggle('is-success', kind === 'ok');
      status.classList.toggle('is-error', kind === 'err');
    };
    input.addEventListener('input', function () { input.classList.remove('is-invalid'); });
    nf.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var email = input.value.trim().toLowerCase();
      if (!RE.test(email) || email.indexOf('..') !== -1 || email.length > 254) {
        input.classList.add('is-invalid'); say(nf.dataset.bad, 'err'); input.focus(); return;
      }
      if (nf.querySelector('input[name="company_site"]').value) { say(nf.dataset.ok, 'ok'); nf.reset(); return; } // robot
      if (!nf.dataset.endpoint) { say(nf.dataset.err, 'err'); return; }
      btn.disabled = true; say(nf.dataset.sending, '');
      try {
        // Envoi en text/plain (requête « simple », sans pré-vérification CORS) vers le workflow n8n
        var res = await fetch(nf.dataset.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify({ email: email, lang: (document.documentElement.lang || 'fr').slice(0, 2), source_page: location.pathname, consent_text: nf.querySelector('.newsletter-note').textContent.trim() })
        });
        var data = {};
        try { data = await res.json(); } catch (e) {}
        if (data.status === 'ok') { say(nf.dataset.ok, 'ok'); nf.reset(); }
        else if (data.status === 'duplicate') { say(nf.dataset.dup, 'ok'); nf.reset(); }
        else if (data.status === 'invalid') { input.classList.add('is-invalid'); say(nf.dataset.bad, 'err'); }
        else throw new Error('HTTP ' + res.status);
      } catch (err) { say(nf.dataset.err, 'err'); }
      btn.disabled = false;
    });
  });

  // Statistiques de visite anonymes : vues par page et clics sur les CTA.
  // Aucun cookie, aucun identifiant de visiteur ; la localisation (pays, ville) est déduite côté serveur
  // puis l'adresse IP est jetée. Inactif tant que TRACK_URL est vide.
  (function () {
    var TRACK_URL = '';
    if (!TRACK_URL || /bot|crawl|spider|slurp|lighthouse|preview/i.test(navigator.userAgent)) return;
    if (/^(localhost|127\.|\[::1\])/.test(location.hostname)) return;
    var lang = (document.documentElement.lang || 'fr').slice(0, 2);
    var send = function (payload) {
      payload.page = location.pathname;
      payload.lang = lang;
      try {
        var body = JSON.stringify(payload);
        if (navigator.sendBeacon) navigator.sendBeacon(TRACK_URL, new Blob([body], { type: 'text/plain' }));
        else fetch(TRACK_URL, { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'text/plain' } });
      } catch (e) {}
    };
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
    send({ type: 'pageview', referrer: ref === location.hostname ? '' : ref, screen: window.innerWidth < 768 ? 'mobile' : (window.innerWidth < 1200 ? 'tablet' : 'desktop') });
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest('a.btn, button.btn, .pillar-link, .svc-jump-card, .nav-faq, .back-to-home, .li-link, .nav-links a');
      if (!el) return;
      var label = (el.getAttribute('data-cta') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      send({ type: 'cta', cta: label, target: (el.getAttribute('href') || (el.form ? 'form:' + (el.form.className || '') : '')).slice(0, 200) });
    }, true);
  })();

  // Cal.com : prise de rendez-vous en fenêtre sur le site.
  // Le script Cal.com n'est chargé qu'au premier clic (aucun appel tiers avant).
  // Sans JavaScript ou en cas d'échec, le lien ouvre la page Cal.com dans un nouvel onglet.
  (function () {
    var links = document.querySelectorAll('[data-cal-link]');
    if (!links.length) return;
    var state = 'idle';
    var pending = null;
    var lang = (document.documentElement.lang || 'fr').slice(0, 2);
    var open = function (link) {
      try {
        window.Cal('modal', { calLink: link, config: { layout: 'month_view', theme: 'light' } });
      } catch (e) { window.open('https://cal.com/' + link, '_blank', 'noopener'); }
    };
    var load = function (cb) {
      if (state === 'ready') return cb(true);
      pending = cb;
      if (state === 'loading') return;
      state = 'loading';
      (function (C, A, L) {
        var p = function (a, ar) { a.q.push(ar); };
        var d = C.document;
        C.Cal = C.Cal || function () {
          var cal = C.Cal; var ar = arguments;
          if (!cal.loaded) {
            cal.ns = {}; cal.q = cal.q || [];
            var s = d.createElement('script'); s.src = A; s.async = true;
            s.onload = function () { state = 'ready'; if (pending) { pending(true); pending = null; } };
            s.onerror = function () { state = 'error'; if (pending) { pending(false); pending = null; } };
            d.head.appendChild(s); cal.loaded = true;
          }
          if (ar[0] === L) {
            var api = function () { p(api, arguments); };
            var namespace = ar[1]; api.q = api.q || [];
            if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); }
            else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
      })(window, 'https://app.cal.com/embed/embed.js', 'init');
      window.Cal('init', { origin: 'https://cal.com' });
      window.Cal('ui', { theme: 'light', cssVarsPerTheme: { light: { 'cal-brand': '#14161C' } }, hideEventTypeDetails: false, layout: 'month_view' });
      setTimeout(function () { if (state === 'loading') { state = 'error'; if (pending) { pending(false); pending = null; } } }, 8000);
    };
    links.forEach(function (a) {
      a.addEventListener('click', function (ev) {
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return; // ouverture volontaire dans un nouvel onglet
        ev.preventDefault();
        var link = a.getAttribute('data-cal-link');
        load(function (ok) { ok ? open(link) : window.open(a.href, '_blank', 'noopener'); });
      });
    });
  })();

  // Page de désinscription newsletter (lien reçu par email : ?t=<jeton>)
  (function () {
    var box = document.querySelector('.unsub-box');
    if (!box) return;
    var btn = box.querySelector('.unsub-btn');
    var status = box.querySelector('.unsub-status');
    var token = new URLSearchParams(location.search).get('t') || '';
    var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    var say = function (msg, kind) { status.textContent = msg; status.className = 'unsub-status' + (kind ? ' is-' + kind : ''); };
    if (!UUID.test(token)) { btn.hidden = true; say(box.dataset.bad, 'error'); return; }
    // Désinscription uniquement au clic : les antivirus de messagerie qui « visitent » les liens ne désinscrivent personne.
    btn.addEventListener('click', async function () {
      btn.disabled = true; say(box.dataset.sending, '');
      try {
        var res = await fetch(box.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ token: token }) });
        var data = {}; try { data = await res.json(); } catch (e) {}
        if (data.status === 'ok') { btn.hidden = true; say(box.dataset.ok, 'success'); }
        else if (data.status === 'invalid') { btn.hidden = true; say(box.dataset.bad, 'error'); }
        else throw new Error('HTTP ' + res.status);
      } catch (e) { btn.disabled = false; say(box.dataset.err, 'error'); }
    });
  })();

  // Menu mobile
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Reveal au scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Formulaire contact -> webhook n8n
  const form = document.querySelector('.contact-form');
  if (form) {
    const lang = (document.documentElement.lang || 'fr').slice(0, 2);
    const MSG = {
      fr: {
        check: 'Merci de vérifier les champs suivants :',
        type: "Choisissez l'objet de votre demande.",
        name: 'Indiquez votre nom.',
        emailReq: 'Indiquez votre adresse email.',
        emailBad: "L'adresse email n'est pas valide (ex. prenom@entreprise.com).",
        ccReq: "Choisissez l'indicatif pays de votre téléphone.",
        phoneReq: 'Indiquez votre numéro de téléphone.',
        phoneBad: "Le numéro ne correspond pas à un numéro valide pour l'indicatif {cc} ({country}).",
        webBad: "L'adresse du site web n'est pas valide (ex. www.entreprise.com).",
        allCountries: 'Tous les pays'
      },
      en: {
        check: 'Please check the following fields:',
        type: 'Choose the subject of your request.',
        name: 'Enter your name.',
        emailReq: 'Enter your email address.',
        emailBad: 'The email address is not valid (e.g. name@company.com).',
        ccReq: 'Choose the country code of your phone number.',
        phoneReq: 'Enter your phone number.',
        phoneBad: 'This is not a valid phone number for country code {cc} ({country}).',
        webBad: 'The website address is not valid (e.g. www.company.com).',
        allCountries: 'All countries'
      },
      pt: {
        check: 'Verifique os seguintes campos:',
        type: 'Escolha o assunto do seu pedido.',
        name: 'Indique o seu nome.',
        emailReq: 'Indique o seu endereço de email.',
        emailBad: 'O endereço de email não é válido (ex. nome@empresa.pt).',
        ccReq: 'Escolha o indicativo do país do seu telefone.',
        phoneReq: 'Indique o seu número de telefone.',
        phoneBad: 'O número não corresponde a um número válido para o indicativo {cc} ({country}).',
        webBad: 'O endereço do website não é válido (ex. www.empresa.pt).',
        allCountries: 'Todos os países'
      }
    }[lang] || null;
    const T = MSG || {};

    const status = document.createElement('p');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.appendChild(status);
    const setStatus = (text, kind) => {
      status.textContent = text || '';
      status.classList.toggle('is-success', kind === 'success');
      status.classList.toggle('is-error', kind === 'error');
    };

    const $ = (sel) => form.querySelector(sel);
    const typeSel = $('select[name="request_type"]');
    const nameIn = $('input[name="name"]');
    const emailIn = $('input[name="email"]');
    const ccSel = $('select[name="phone_country"]');
    const phoneIn = $('input[name="phone_number"]');
    const webIn = $('input[name="site_url"]');
    const countryIn = $('input[name="country"]');
    const LPN = window.libphonenumber || null;

    // Objet pré-sélectionné depuis la page Services (contact.html?objet=audit)
    try {
      const preset = String(new URLSearchParams(location.search).get('objet') || '').replace(/[^a-z0-9-]/gi, '');
      if (preset && typeSel && typeSel.querySelector('option[value="' + preset + '"]')) typeSel.value = preset;
    } catch (e) {}

    // Noms de pays dans la langue de la page
    let regionNames = null;
    try { regionNames = new Intl.DisplayNames([lang], { type: 'region' }); } catch (e) {}
    const countryName = (code) => { try { return (regionNames && regionNames.of(code)) || code; } catch (e) { return code; } };

    // Liste des indicatifs : pays fréquents en tête, puis tous les pays par ordre alphabétique
    if (ccSel && LPN) {
      const FAV = ['FR', 'PT', 'CH', 'BE', 'LU', 'ES', 'IT', 'DE', 'GB', 'US'];
      const mk = (code) => {
        const o = document.createElement('option');
        o.value = code;
        o.textContent = countryName(code) + ' (+' + LPN.getCountryCallingCode(code) + ')';
        return o;
      };
      FAV.forEach((c) => ccSel.appendChild(mk(c)));
      const all = document.createElement('optgroup');
      all.label = T.allCountries || 'All';
      LPN.getCountries()
        .filter((c) => FAV.indexOf(c) === -1)
        .map((c) => [c, countryName(c)])
        .sort((a, b) => a[1].localeCompare(b[1], lang))
        .forEach(([c]) => all.appendChild(mk(c)));
      ccSel.appendChild(all);
    }

    // Numéro : chiffres uniquement. Un numéro saisi au format international (+33…, 0033…) règle l'indicatif tout seul.
    const applyInternational = (raw) => {
      const digits = String(raw).replace(/\D/g, '').replace(/^00/, '');
      try {
        const p = LPN.parsePhoneNumber('+' + digits);
        if (p && p.country && p.isValid() && ccSel.querySelector('option[value="' + p.country + '"]')) {
          ccSel.value = p.country;
          phoneIn.value = p.nationalNumber;
          mark(ccSel, false);
          return true;
        }
      } catch (e) {}
      return false;
    };
    if (phoneIn) {
      phoneIn.addEventListener('input', () => {
        const raw = phoneIn.value;
        if (LPN && ccSel && /^\s*(\+|00)/.test(raw)) {
          if (!applyInternational(raw)) phoneIn.value = '+' + raw.replace(/\D/g, '').replace(/^00/, '');
          return;
        }
        const clean = raw.replace(/\D/g, '');
        if (clean !== raw) phoneIn.value = clean;
      });
    }

    // Contrôles de format
    const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
    const emailOk = (v) => EMAIL_RE.test(v) && v.indexOf('..') === -1 && !/^\.|\.@/.test(v) && v.length <= 254;
    const normalizeUrl = (v) => {
      let s = v.trim();
      if (!s) return '';
      if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
      try {
        const u = new URL(s);
        const host = u.hostname.toLowerCase();
        if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,}|xn--[a-z0-9-]{2,})$/.test(host)) return null;
        if (/\s/.test(v.trim())) return null;
        return u.href.replace(/\/$/, '');
      } catch (e) { return null; }
    };

    const mark = (el, bad) => { if (el) { el.classList.toggle('is-invalid', bad); el.setAttribute('aria-invalid', bad ? 'true' : 'false'); } };
    [typeSel, nameIn, emailIn, ccSel, phoneIn, webIn].forEach((el) => {
      if (el) el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => mark(el, false));
    });

    const validate = () => {
      const errors = [];
      const add = (el, msg) => { errors.push([el, msg]); mark(el, true); };
      [typeSel, nameIn, emailIn, ccSel, phoneIn, webIn].forEach((el) => mark(el, false));

      if (typeSel && !typeSel.value) add(typeSel, T.type);
      if (nameIn && nameIn.value.trim().length < 2) add(nameIn, T.name);

      const email = emailIn ? emailIn.value.trim() : '';
      if (emailIn) {
        if (!email) add(emailIn, T.emailReq);
        else if (!emailOk(email)) add(emailIn, T.emailBad);
      }

      let e164 = '';
      if (LPN && ccSel && phoneIn && /^\+/.test(phoneIn.value)) applyInternational(phoneIn.value);
      const cc = ccSel ? ccSel.value : '';
      const num = phoneIn ? phoneIn.value.replace(/\D/g, '') : '';
      if (ccSel && !cc) add(ccSel, T.ccReq);
      if (phoneIn && !num) add(phoneIn, T.phoneReq);
      if (cc && num) {
        let ok = false;
        if (LPN) {
          try {
            ok = LPN.isValidPhoneNumber(num, cc);
            if (ok) e164 = LPN.parsePhoneNumber(num, cc).number;
          } catch (e) { ok = false; }
        } else {
          ok = num.length >= 6 && num.length <= 15;
          e164 = '+' + num;
        }
        if (!ok) {
          const code = LPN ? '+' + LPN.getCountryCallingCode(cc) : '';
          add(phoneIn, (T.phoneBad || '').replace('{cc}', code).replace('{country}', countryName(cc)));
        }
      }

      let site = '';
      if (webIn && webIn.value.trim()) {
        site = normalizeUrl(webIn.value);
        if (!site) add(webIn, T.webBad);
      }

      return { errors, email, e164, cc, site };
    };

    // Pièces jointes : 2 fichiers max, 5 Mo chacun, PDF / Word / JPG / PNG
    const MAX_FILES = 2, MAX_SIZE = 5 * 1024 * 1024;
    const OK_EXT = /\.(pdf|docx?|jpe?g|png)$/i;
    const fileInput = form.querySelector('input[type="file"][name="attachments"]');
    const checkFiles = () => {
      if (!fileInput) return '';
      const files = [...fileInput.files];
      if (files.length > MAX_FILES) return fileInput.dataset.tooMany;
      const bad = files.find(f => !OK_EXT.test(f.name));
      if (bad) return fileInput.dataset.badType + bad.name;
      const big = files.find(f => f.size >= MAX_SIZE);
      if (big) return fileInput.dataset.tooBig + big.name;
      return '';
    };
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const err = checkFiles();
        fileInput.setCustomValidity(err);
        setStatus(err, err ? 'error' : '');
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = validate();
      const fileErr = checkFiles();
      if (v.errors.length || fileErr) {
        const lines = v.errors.map(([, m]) => '• ' + m);
        if (fileErr) lines.push('• ' + fileErr);
        setStatus((T.check ? T.check + '\n' : '') + lines.join('\n'), 'error');
        const first = v.errors.length ? v.errors[0][0] : fileInput;
        if (first) first.focus();
        return;
      }
      setStatus(form.dataset.sending || 'Envoi en cours...', '');
      const data = new FormData(form);
      // Fichiers envoyés sous des noms distincts (attachment_1, attachment_2) pour n8n
      data.delete('attachments');
      if (fileInput) [...fileInput.files].forEach((f, i) => data.append('attachment_' + (i + 1), f, f.name));
      data.set('lang', lang);
      // Téléphone au format international (+33612345678), site web normalisé
      data.delete('phone_country');
      data.delete('phone_number');
      data.set('phone', v.e164);
      data.set('email', v.email);
      data.set('site_url', v.site);
      // Pays déduit de l'indicatif si le champ Pays est vide
      if (countryIn && !countryIn.value.trim() && v.cc) data.set('country', countryName(v.cc));
      // Libellé lisible de l'objet (ex. « Postuler ») pour les emails, en plus du code
      if (typeSel && typeSel.selectedIndex > 0) data.set('request_type_label', typeSel.options[typeSel.selectedIndex].text);
      try {
        const res = await fetch('https://adamlippes.app.n8n.cloud/webhook/pragmalabs-contact', {
          method: 'POST',
          body: data
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setStatus(form.dataset.success || 'Message envoyé.', 'success');
        form.reset();
        if (fileInput) fileInput.setCustomValidity('');
      } catch (err) {
        setStatus(form.dataset.error || 'Erreur d envoi.', 'error');
      }
    });
  }
});
