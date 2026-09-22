# Introduction à GraphQL avec Apollo Server

Support de TP : une petite API d'e-commerce, à interroger d'abord, à étendre
ensuite. L'API livrée expose trois entités, les articles, les clients et les
commandes. Les marques et les entrepôts existent dans les données mais ne sont
pas encore exposées : les rendre accessibles est l'objet des exercices.

## Installation

Node 20 ou plus récent est nécessaire.

```bash
npm install
npm start
```

Ouvrez ensuite `http://localhost:4000` dans un navigateur. Apollo Sandbox s'y
affiche : un éditeur de requêtes, la documentation du schéma, et le résultat des
appels. Aucun autre outil n'est à installer.

Pendant les exercices, préférez `npm run dev` : le serveur redémarre à chaque
sauvegarde.

Une première requête à copier dans Sandbox :

```graphql
query AllProducts {
  products {
    id
    name
    price
  }
}
```

## Déroulé du TP

Tout se trouve dans `EXERCICES.md`.

La partie 1 se fait uniquement dans Sandbox, sans toucher au code : queries,
arguments, variables, relations imbriquées, fragments, puis mutations et
lecture des erreurs.

La partie 2 consiste à étendre l'API. Chaque exercice demande deux ajouts, une
déclaration dans le schéma et une fonction dans les resolvers. Les emplacements
sont marqués `TODO Exercice n` dans les deux fichiers concernés.

Pour suivre votre progression :

```bash
npm run check
```

Le script rejoue les exercices de la partie 2 et affiche, pour chacun, `[ OK ]`,
`[ KO ]` avec l'écart constaté, ou `[ -- ]` s'il n'est pas commencé. Il
fonctionne sans serveur démarré.

## Organisation des fichiers

| Fichier | Rôle |
|---|---|
| `src/index.js` | démarrage du serveur Apollo |
| `src/typeDefs.js` | le schéma : types, champs, queries et mutations |
| `src/resolvers.js` | les fonctions qui remplissent chaque champ |
| `src/db.js` | le jeu de données en mémoire et deux fonctions utilitaires |
| `src/schemaErrors.js` | reformule les erreurs de construction du schéma |
| `scripts/check.mjs` | auto-évaluation de la partie 2 |
| `EXERCICES.md` | les énoncés |
| `SOLUTIONS.md` | le corrigé |

Les deux fichiers à modifier pendant le TP sont `src/typeDefs.js` et
`src/resolvers.js`. Un champ n'existe que s'il est présent dans les deux.

## Bon à savoir

Les données vivent en mémoire, dans `src/db.js`. Les mutations les modifient
réellement le temps de la session, et chaque redémarrage du serveur remet le jeu
de données dans son état initial. C'est pratique : en cas de doute sur l'état
des données, redémarrez.

## Commandes

| Commande | Effet |
|---|---|
| `npm start` | démarre le serveur sur le port 4000 |
| `npm run dev` | idem, avec redémarrage automatique |
| `npm run check` | vérifie les exercices de la partie 2 |

Le port se change avec la variable d'environnement `PORT`.
