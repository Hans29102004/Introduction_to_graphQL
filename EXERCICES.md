# Exercices

Ce TP se fait en deux temps.

La **partie 1** ne demande aucune modification du code : vous interrogez et vous
créez des données avec l'API déjà en place, depuis Apollo Sandbox, pour vous
familiariser avec le langage de requête.

La **partie 2** vous fait étendre l'API : chaque exercice demande d'ajouter des
types et des champs dans `src/typeDefs.js`, puis les fonctions correspondantes
dans `src/resolvers.js`.

Avant de commencer :

```bash
npm install
npm start
```

puis ouvrez `http://localhost:4000` dans un navigateur. Apollo Sandbox s'y
affiche : le panneau de gauche liste les opérations disponibles, celui du
milieu sert à écrire les requêtes, celui de droite montre les réponses.

## Partie 1 : prendre en main Apollo Sandbox

### 1.1 Explorer le schéma

Ouvrez l'onglet de documentation de Sandbox et parcourez les types.

Questions :

- combien de points d'entrée le type `Query` propose-t-il, et lesquels ?
- quels champs possède un `Product` ?
- quelles valeurs peut prendre `OrderStatus` ?

Le schéma est le contrat de l'API. Tout ce qui n'y figure pas est refusé par le
serveur, avant même d'atteindre le code.

### 1.2 Votre première query

Copiez cette requête dans Sandbox et exécutez-la :

```graphql
query AllProducts {
  products {
    id
    name
    price
  }
}
```

Ensuite, à vous :

1. modifiez-la pour ne récupérer que le champ `name`
2. ajoutez `stock`, puis `brandId`

Ce que vous devez constater : la réponse a exactement la forme de la requête.
C'est le client qui décide des champs, pas le serveur.

### 1.3 Une query avec un argument

Écrivez une requête qui récupère le nom et le prix du seul article d'identifiant
`3`. Résultat attendu : `Clavier mécanique K2`, à 89,5 euros.

Réécrivez-la ensuite en passant l'identifiant par une variable `$id` de type
`ID!`, dont la valeur est renseignée dans le panneau Variables, en bas de
l'éditeur :

```json
{ "id": "3" }
```

Essayez enfin avec l'identifiant `999`. Le champ vaut `null` et la réponse ne
contient pas d'erreur : l'article est simplement absent.

### 1.4 Suivre les relations

Écrivez une requête qui renvoie, pour chaque commande : son identifiant, son
état, l'email du client, et pour chaque ligne la quantité et le nom de
l'article commandé.

Résultat attendu : trois commandes, la première passée par
`camille.ferrand@example.com`.

Écrivez ensuite la requête inverse : le prénom du client `1` et la liste des
identifiants et des états de ses commandes.

À retenir : c'est une seule requête, un seul aller-retour réseau, là où une API
REST aurait demandé plusieurs appels.

### 1.5 Alias et fragments

Dans une seule requête, récupérez les articles `1` et `8` avec les mêmes champs
(`id`, `name`, `price`).

Deux difficultés à résoudre :

- le champ `product` ne peut pas apparaître deux fois au même niveau sans être
  distingué, il faut lui donner un **alias** (`first: product(id: "1")`)
- pour ne pas répéter la liste des champs, définissez un **fragment** sur le
  type `Product` et utilisez-le aux deux endroits

### 1.6 Créer des données

Les mutations servent à écrire. Leur syntaxe est celle des queries, précédée du
mot-clé `mutation`, et les champs demandés après la mutation décrivent ce que
vous voulez récupérer une fois l'écriture faite.

1. créez un client avec `createUser`, en renvoyant son `id` et son `email`
2. vérifiez avec la query `users` qu'il a bien été ajouté, et notez son
   identifiant
3. créez un article avec `createProduct` (`name`, `price`, `stock`, et
   `brandId` valant `"2"`), puis vérifiez-le avec `product(id: ...)`

Rappel : les données vivent en mémoire. Au prochain `npm start`, vos créations
auront disparu.

Essayez enfin `createUser` avec un email sans arobase, par exemple
`"bonjour"`. Lisez le message d'erreur et le champ `extensions.code` de la
réponse.

### 1.7 Modifier des données, et lire les erreurs

Faites passer la commande `2` à l'état `DELIVERED` avec `updateOrderStatus`,
puis vérifiez le résultat avec la query `order`.

Provoquez maintenant trois erreurs différentes et comparez-les :

1. `updateOrderStatus` avec `orderId: "99"`
2. `updateOrderStatus` avec `status: ENVOYEE`
3. une query qui demande le champ `taille` sur un article

Question : les cas 2 et 3 portent le code `GRAPHQL_VALIDATION_FAILED` et le cas
1 le code `NOT_FOUND`. Qu'est-ce qui différencie ces deux familles d'erreurs, et
à quel moment chacune est-elle détectée ?

### 1.8 Ce qui manque

Exécutez cette requête :

```graphql
query {
  product(id: "1") {
    name
    brandId
    brand {
      name
    }
  }
}
```

Elle échoue, alors que le fichier `src/db.js` contient bien une liste de
marques et que chaque article porte un `brandId`.

Question : pourquoi le serveur refuse-t-il le champ `brand` ? Votre réponse
tient en une phrase, et c'est le sujet de toute la partie 2.

## Partie 2 : écrire des typeDefs et des resolvers

Méthode, identique pour chaque exercice :

1. déclarer le type ou le champ dans `src/typeDefs.js`, à l'emplacement du
   `TODO` correspondant
2. écrire la fonction qui le remplit dans `src/resolvers.js`, au `TODO` jumeau
3. redémarrer le serveur, tester la requête dans Sandbox

Un champ déclaré dans le schéma mais sans resolver ne provoque pas d'erreur : il
renvoie `null`, ou fait échouer la requête s'il est non nullable.

L'inverse empêche carrément le serveur de démarrer. Un resolver écrit pour un
champ que le schéma ne déclare pas arrête `npm start` comme `npm run check`
sur ce message :

```
Query.brand existe dans src/resolvers.js mais pas dans src/typeDefs.js.
```

C'est l'erreur la plus courante du TP, et elle se corrige en ajoutant la moitié
manquante. D'où l'ordre conseillé : le schéma d'abord, le resolver ensuite.

Pour savoir où vous en êtes :

```bash
npm run check
```

Le script rejoue chaque exercice et affiche `[ OK ]`, `[ KO ]` avec l'écart
constaté, ou `[ -- ]` si l'exercice n'est pas commencé. Lancez `npm run dev`
plutôt que `npm start` pour que le serveur redémarre tout seul à chaque
sauvegarde.

### Exercice 1 : un nouveau type et une query

Déclarez le type `Brand` avec `id: ID!`, `name: String!` et `country: String!`,
puis la query `brands` qui renvoie `[Brand!]!`.

Indice : les données sont déjà dans `db.brands`, le resolver tient en une ligne.

Réussi quand : `{ brands { id name country } }` renvoie les quatre marques.

### Exercice 2 : une query avec un argument

Ajoutez `brand(id: ID!): Brand`, qui renvoie `null` si la marque n'existe pas.

Indice : `Query.product` fait déjà exactement cela pour les articles, et
`findById` est exporté par `src/db.js`.

Réussi quand : `brand(id: "2")` renvoie Lumo, et `brand(id: "999")` renvoie
`null`.

### Exercice 3 : un resolver de champ

Ajoutez le champ `brand: Brand` sur le type `Product`.

Indice : le resolver reçoit en premier argument l'article concerné, dont vous
utilisez le `brandId` pour retrouver la marque. C'est le même mécanisme que
`Order.customer`, qui part de `userId`.

Réussi quand : `{ product(id: "1") { brand { name } } }` renvoie Lumo.

### Exercice 4 : la relation dans l'autre sens

Ajoutez le champ `products: [Product!]!` sur le type `Brand`.

Indice : filtrez `db.products` sur le `brandId`.

Réussi quand : `{ brand(id: "3") { name products { name } } }` renvoie les deux
articles de la marque Kettra.

Une fois l'exercice fini, essayez
`{ brands { name products { name brand { name } } } }`. GraphQL laisse
volontiers tourner en rond, c'est au client de s'arrêter.

### Exercice 5 : des champs calculés

Ajoutez `total: Float!` sur `Order` et `ordersCount: Int!` sur `User`.

`total` vaut la somme des `quantity * unitPrice` de chaque ligne.

Indice : ces deux champs n'existent nulle part dans `db.js`. Un resolver n'est
pas obligé de lire une donnée stockée, il peut la calculer.

Réussi quand : la commande `1` a un total de 129,3 et le client `1` affiche deux
commandes.

### Exercice 6 : des filtres, et une mutation

Ajoutez deux arguments facultatifs à `products` : `brandId: ID` et
`maxPrice: Float`. Ils doivent être cumulables, et `products` sans argument doit
continuer à renvoyer tout le catalogue. `maxPrice` retient les articles dont le
prix est inférieur ou égal à la valeur donnée.

Ajoutez ensuite la mutation `createBrand(input: CreateBrandInput!): Brand!`,
avec un input qui porte `name` et `country`.

Indice : pour l'identifiant de la nouvelle marque, `nextId` est exporté par
`src/db.js`. Regardez comment `createProduct` s'y prend.

Réussi quand : `products(brandId: "1", maxPrice: 100)` ne renvoie que la
bouilloire, et une marque créée apparaît ensuite dans `brands`.

### Exercice 7 : un type imbriqué et de la validation

Première partie, la lecture :

- déclarez `Warehouse` avec `id: ID!`, `name: String!`, `city: String!`, et la
  query `warehouses`
- déclarez `StockEntry` avec `warehouse: Warehouse!` et `quantity: Int!`
- ajoutez `stockByWarehouse: [StockEntry!]!` sur `Product`

Indice : `db.stocks` contient des lignes `{ productId, warehouseId, quantity }`.
Votre resolver filtre celles de l'article, puis transforme chacune en un objet
`{ warehouse, quantity }`. Conservez l'ordre de `db.stocks`.

Seconde partie, l'écriture :

`restockProduct(productId: ID!, warehouseId: ID!, quantity: Int!): Product!`
ajoute `quantity` au stock de l'article dans cet entrepôt, crée la ligne de
stock si elle n'existe pas encore, met à jour le `stock` total de l'article et
renvoie l'article.

La mutation doit refuser, avec un `GraphQLError` explicite :

- un article ou un entrepôt inconnu, avec le code `NOT_FOUND`
- une quantité nulle ou négative, avec le code `BAD_USER_INPUT`

Réussi quand : `{ product(id: "3") { stockByWarehouse { quantity warehouse { city } } } }`
renvoie trois entrées, et un réapprovisionnement de 7 unités de l'article `5`
dans l'entrepôt `2` porte son stock total à 22.

### Exercice 8 : bonus

`createOrder(input: CreateOrderInput!): Order!` crée une commande. L'input
contient `userId: ID!` et `lines: [OrderLineInput!]!`, chaque ligne portant
`productId` et `quantity`.

La commande créée est au statut `PENDING`, sa date est celle du jour, et chaque
ligne enregistre le prix actuel de l'article dans `unitPrice`. Le stock des
articles commandés est décrémenté. La mutation refuse un client ou un article
inconnu, une commande sans ligne, et une quantité supérieure au stock
disponible.

Ajoutez enfin les arguments `limit: Int` et `offset: Int` sur `products`, après
les filtres de l'exercice 6 : `products(limit: 2, offset: 2)` renvoie les
troisième et quatrième articles du catalogue.

### Pour aller plus loin

Quelques pistes sans corrigé :

- un champ `Order.itemCount` qui somme les quantités
- un argument `status: OrderStatus` sur `orders`
- une query `search(term: String!)` qui cherche dans les noms d'articles et de
  marques, et renvoie une union des deux types
- une mutation `cancelOrder` qui remet les articles en stock, et refuse
  d'annuler une commande déjà livrée
