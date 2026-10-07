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
    const status = document.createElement('p');
    status.className = 'form-status';
    form.appendChild(status);
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
        status.textContent = err;
      });
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileErr = checkFiles();
      if (fileErr) { status.textContent = fileErr; return; }
      status.textContent = form.dataset.sending || 'Envoi en cours...';
      const data = new FormData(form);
      // Fichiers envoyés sous des noms distincts (attachment_1, attachment_2) pour n8n
      data.delete('attachments');
      if (fileInput) [...fileInput.files].forEach((f, i) => data.append('attachment_' + (i + 1), f, f.name));
      data.set('lang', document.documentElement.lang || 'fr');
      // Libellé lisible de l'objet (ex. « Postuler ») pour les emails, en plus du code
      const type = form.querySelector('select[name="request_type"]');
      if (type && type.selectedIndex > 0) data.set('request_type_label', type.options[type.selectedIndex].text);
      try {
        const res = await fetch('https://adamlippes.app.n8n.cloud/webhook/pragmalabs-contact', {
          method: 'POST',
          body: data
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        status.textContent = form.dataset.success || 'Message envoyé.';
        form.reset();
        if (fileInput) fileInput.setCustomValidity('');
      } catch (err) {
        status.textContent = form.dataset.error || 'Erreur d envoi.';
      }
    });
  }
});
