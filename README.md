# Portfolio

Mon site vitrine : présentation, parcours, compétences et réalisations.

En ligne : **https://flaviencantinotti-ship-it.github.io/portfolio/**

## Le parti pris

Noir intégral, typographie blanche, et un halo lumineux sur chaque élément clair.
Les sections sont séparées par des traits blancs qui se dessinent au défilement.

Aucune dépendance, aucun outil de construction : trois fichiers, on ouvre
`index.html` et ça tourne.

## Ce qui est fait à la main

- Préchargeur avec compteur de progression
- Curseur personnalisé qui suit la souris avec du retard et réagit aux liens
- Révélations au défilement (`IntersectionObserver`), en cascade dans les listes
- Titre masqué qui remonte ligne par ligne
- Effet machine à écrire sur les intitulés de poste
- En-tête qui se masque à la descente et réapparaît à la remontée
- Lien de navigation actif selon la section visible
- Menu plein écran en mobile
- Horloge locale en pied de page

Tout se désactive proprement si le visiteur a demandé de réduire les animations
(`prefers-reduced-motion`).

## Stack

HTML, CSS, JavaScript. Polices Inter et JetBrains Mono via Google Fonts.

## Structure

```
Portfolio/
├── index.html
└── assets/
    ├── css/style.css
    └── js/main.js
```

## Personnalisation

L'intensité des halos se règle depuis les variables du bloc `:root`, en haut de
`style.css` : `--halo-s/m/l/xl` pour le texte, `--halo-trait` pour les traits.

## Auteur

**Flavien Cantinotti** — développeur web
[GitHub](https://github.com/flaviencantinotti-ship-it) ·
[LinkedIn](https://www.linkedin.com/in/flavien-cantinotti/)
