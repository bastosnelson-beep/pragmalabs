# Pragma4

Site multilingue (FR / EN / PT) inspiré de l'architecture de augustalabs.ai, reconstruit à l'identique fonctionnellement mais avec une rédaction originale adaptée à Pragma4 (pas de copie de leur code ni de leurs textes, qui sont leur propriété).

## Structure

```
pragma4/
├── index.html          # Accueil FR (défaut)
├── contact.html        # Contact FR
├── en/index.html       # Accueil EN
├── en/contact.html     # Contact EN
├── pt/index.html       # Accueil PT
├── pt/contact.html     # Contact PT
└── assets/
    ├── styles.css      # Styles + tokens CSS
    └── script.js       # Menu mobile + reveal au scroll
```

## Personnaliser le style

Tous les codes visuels sont dans les tokens en haut de `assets/styles.css` :

```css
:root {
  --bg: #FAFAFA;        /* fond */
  --surface: #F5F5F7;   /* fond de cartes */
  --text: #0A0A0A;      /* texte principal */
  --muted: #6E6E73;     /* texte secondaire */
  --border: #E5E5EA;    /* bordures */
  --accent: #2060DF;    /* couleur d'accent */
  --font: "Inter", ...  /* police */
}
```

Change ces valeurs, tout le site suit. Les emplacements réservés aux visuels (diagramme du Noyau, miniatures news, cartes secteurs) sont des divs placeholders : remplace par tes `<img>`.

## À remplir

- Stats (année, nombre d'experts, actifs, taux d'expansion) : valeurs placeholder
- Logos clients du bandeau défilant (chips `CLIENT UN`, remplacer par des `<img>`)
- Cartes d'actualités : titres, dates et liens
- Liens sociaux X / LinkedIn du footer
- Pill d'annonce en haut du hero (lien du Prix Pragma)
- Action du formulaire contact : brancher Formspree, Netlify Forms ou un webhook n8n

## Traductions

Le sélecteur FR / EN / PT est dans la navbar de chaque page. Les liens entre langues sont en relatif, fonctionne en local comme en prod.

## Pour tester en local

Ouvrir `index.html` directement, ou :

```
python -m http.server 8000
```

puis http://localhost:8000

## Prochaines pages possibles (comme sur le site de référence)

- `/careers` : page recrutement avec sections par département
- Page du Prix (Arcus-like) : expérience dédiée

## SEO (oct. 2026)

- URL canoniques sans extension : `/`, `/services`, `/contact`, `/en/…`, `/pt/servicos`, `/pt/contacto` (GitHub Pages sert `x.html` pour `/x`). Les liens internes utilisent ces URL ; pour prévisualiser en local, utiliser un serveur qui résout `/x` vers `x.html`.
- `pt/contact.html` et `pt/services.html` sont des redirections vers les nouvelles adresses portugaises (à conserver pour les anciens liens).
- `robots.txt` et `sitemap.xml` (avec hreflang fr / en / pt-PT) à la racine : penser à mettre à jour `sitemap.xml` à chaque nouvelle page.
- Images de partage LinkedIn (Open Graph) : `assets/og/pragma4-og-{fr,en,pt}.jpg` (1200×630).
- Plus de redirection automatique de langue : un bandeau propose la version dans la langue du navigateur (`assets/script.js`).
- Toute modification doit être répercutée sur les versions FR, EN et PT (titres, canonical, hreflang, og:*).

## Newsletter : double opt-in (oct. 2026)

- Formulaire du pied de page → webhook n8n `pragma4-newsletter` (workflow « Pragma4 - Newsletter inscription (double opt-in) ») : filtre les robots, enregistre une inscription **non confirmée** dans Supabase (`newsletter_subscribers`) et envoie un email avec le lien de confirmation (au plus 1 par adresse et par 24h).
- Pages de confirmation : `/confirmation`, `/en/confirm`, `/pt/confirmacao` (lien `?t=<jeton>`). La confirmation se fait au clic sur le bouton, jamais à la simple ouverture du lien (les antivirus de messagerie qui visitent les liens ne confirment personne) → webhook `pragma4-newsletter-confirm` qui date `confirmed_at` et envoie l'email de bienvenue.
- Seules les adresses avec `confirmed_at` renseigné et `unsubscribed_at` vide reçoivent la newsletter. Les inscriptions non confirmées sont supprimées après 7 jours (workflow « Pragma4 - Newsletter nettoyage quotidien »).
