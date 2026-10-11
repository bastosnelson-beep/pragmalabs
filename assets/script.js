// PRAGMA4 - interactions de base
document.addEventListener('DOMContentLoaded', () => {
  // Choix manuel de langue (FR / EN / PT) mémorisé : il prime sur la langue du navigateur
  document.querySelectorAll('.lang-switch a').forEach((a) => {
    a.addEventListener('click', () => {
      try { localStorage.setItem('pl-lang', a.textContent.trim().toLowerCase()); } catch (e) {}
    });
  });

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
