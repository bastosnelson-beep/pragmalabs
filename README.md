# PragmaLabs

Site multilingue (FR / EN / PT) inspiré de l'architecture de augustalabs.ai, reconstruit à l'identique fonctionnellement mais avec une rédaction originale adaptée à PragmaLabs (pas de copie de leur code ni de leurs textes, qui sont leur propriété).

## Structure

```
pragmalabs/
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
