// PRAGMALABS - interactions de base
document.addEventListener('DOMContentLoaded', () => {
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
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = form.dataset.sending || 'Envoi en cours...';
      const data = new FormData(form);
      data.set('lang', document.documentElement.lang || 'fr');
      try {
        await fetch('https://adamlippes.app.n8n.cloud/webhook/pragmalabs-contact', {
          method: 'POST',
          body: data
        });
        status.textContent = form.dataset.success || 'Message envoyé.';
        form.reset();
      } catch (err) {
        status.textContent = form.dataset.error || 'Erreur d envoi.';
      }
    });
  }
});
