# Corrigé

Document destiné à l'enseignant, ou à distribuer après la séance.

## Partie 1

### 1.1 Explorer le schéma

Six points d'entrée en lecture : `products`, `product`, `users`, `user`,
`orders`, `order`. Un `Product` porte `id`, `name`, `price`, `stock` et
`brandId`. `OrderStatus` vaut `PENDING`, `SHIPPED`, `DELIVERED` ou `CANCELLED`.

### 1.2 Première query

```graphql
query NamesOnly {
  products {
    name
  }
}
```

```graphql
query NamesAndStocks {
  products {
    name
    stock
    brandId
  }
}
```

### 1.3 Query avec argument

```graphql
query OneProduct {
  product(id: "3") {
    name
    price
  }
}
```

Avec une variable :

```graphql
query OneProduct($id: ID!) {
  product(id: $id) {
    name
    price
  }
}
```

```json
{ "id": "3" }
```

Avec `"999"`, la réponse est `{ "data": { "product": null } }`. Le champ est
nullable dans le schéma (`product(id: ID!): Product`), l'absence n'est donc pas
une erreur.

### 1.4 Relations

```graphql
query AllOrders {
  orders {
    id
    status
    customer {
      email
    }
    lines {
      quantity
      product {
        name
      }
    }
  }
}
```

La relation inverse :

```graphql
query CustomerOrders {
  user(id: "1") {
    firstName
    orders {
      id
      status
    }
  }
}
```

Pour la commande `3`, le serveur appelle `Order.customer`, puis `OrderLine.product`
une fois par ligne, soit un resolver par champ demandé et par objet traversé.

### 1.5 Alias et fragments

```graphql
query TwoProducts {
  first: product(id: "1") {
    ...ProductDetails
  }
  last: product(id: "8") {
    ...ProductDetails
  }
}

fragment ProductDetails on Product {
  id
  name
  price
}
```

### 1.6 Créer des données

```graphql
mutation NewCustomer {
  createUser(input: {
    firstName: "Sofia"
    lastName: "Leroy"
    email: "sofia.leroy@example.com"
  }) {
    id
    email
  }
}
```

Le client créé reçoit l'identifiant `5`, puisque le jeu de données en compte
quatre au démarrage.

```graphql
mutation NewProduct {
  createProduct(input: {
    name: "Souris verticale"
    price: 39.9
    stock: 12
    brandId: "2"
  }) {
    id
    name
    stock
  }
}
```

Avec un email invalide, la réponse porte `data: null` et une erreur :

```
Email invalide : bonjour
extensions.code = BAD_USER_INPUT
```

### 1.7 Modifier, et lire les erreurs

```graphql
mutation MarkDelivered {
  updateOrderStatus(orderId: "2", status: DELIVERED) {
    id
    status
  }
}
```

Les trois erreurs demandées :

1. `orderId: "99"` donne `Commande introuvable : 99`, code `NOT_FOUND`
2. `status: ENVOYEE` donne `Value "ENVOYEE" does not exist in "OrderStatus" enum.`,
   code `GRAPHQL_VALIDATION_FAILED`
3. le champ `taille` donne `Cannot query field "taille" on type "Product".`,
   code `GRAPHQL_VALIDATION_FAILED`

Réponse attendue : les cas 2 et 3 sont détectés à la validation, avant toute
exécution, par simple comparaison de la requête au schéma. Aucun resolver n'est
appelé et `data` est absent de la réponse. Le cas 1 est une erreur métier : la
requête était valide, c'est le resolver qui a refusé une fois exécuté, d'où un
`path` renseigné dans l'erreur.

### 1.8 Ce qui manque

Le serveur répond `Cannot query field "brand" on type "Product". Did you mean
"brandId"?`. La donnée existe dans `db.brands`, mais le champ n'est déclaré ni
dans le schéma ni dans les resolvers : pour GraphQL, il n'existe pas. Exposer
une donnée demande toujours ces deux ajouts.

## Partie 2

Les extraits ci-dessous sont à insérer aux emplacements marqués `TODO` dans
`src/typeDefs.js` et `src/resolvers.js`.

### Exercice 1

Dans `typeDefs`, à côté des autres types :

```graphql
type Brand {
  id: ID!
  name: String!
  country: String!
}
```

Dans `type Query` :

```graphql
brands: [Brand!]!
```

Dans `resolvers.Query` :

```js
brands: () => db.brands,
```

### Exercice 2

Dans `type Query` :

```graphql
brand(id: ID!): Brand
```

Dans `resolvers.Query` :

```js
brand: (_parent, args) => findById(db.brands, args.id),
```

### Exercice 3

Dans `type Product` :

```graphql
brand: Brand
```

Dans `resolvers` :

```js
Product: {
  brand: (product) => findById(db.brands, product.brandId),
},
```

### Exercice 4

Dans `type Brand` :

```graphql
products: [Product!]!
```

Dans `resolvers` :

```js
Brand: {
  products: (brand) => db.products.filter((product) => product.brandId === brand.id),
},
```

### Exercice 5

Dans `type Order` et `type User` :

```graphql
total: Float!
ordersCount: Int!
```

Dans `resolvers` :

```js
Order: {
  customer: (order) => findById(db.users, order.userId),
  total: (order) => order.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
},

User: {
  orders: (user) => db.orders.filter((order) => order.userId === user.id),
  ordersCount: (user) => db.orders.filter((order) => order.userId === user.id).length,
},
```

### Exercice 6

Dans `type Query`, la signature de `products` devient :

```graphql
products(brandId: ID, maxPrice: Float): [Product!]!
```

Dans `type Mutation`, plus l'input associé :

```graphql
createBrand(input: CreateBrandInput!): Brand!
```

```graphql
input CreateBrandInput {
  name: String!
  country: String!
}
```

Dans `resolvers.Query` :

```js
products: (_parent, args) => {
  let result = db.products;
  if (args.brandId) {
    result = result.filter((product) => product.brandId === args.brandId);
  }
  if (args.maxPrice != null) {
    result = result.filter((product) => product.price <= args.maxPrice);
  }
  return result;
},
```

Le test `args.maxPrice != null` plutôt que `if (args.maxPrice)` laisse passer la
valeur `0`, qui est un filtre légitime.

Dans `resolvers.Mutation` :

```js
createBrand: (_parent, { input }) => {
  const brand = { id: nextId(db.brands), ...input };
  db.brands.push(brand);
  return brand;
},
```

### Exercice 7

Dans `typeDefs` :

```graphql
type Warehouse {
  id: ID!
  name: String!
  city: String!
}

type StockEntry {
  warehouse: Warehouse!
  quantity: Int!
}
```

Dans `type Product` :

```graphql
stockByWarehouse: [StockEntry!]!
```

Dans `type Query` :

```graphql
warehouses: [Warehouse!]!
```

Dans `type Mutation` :

```graphql
restockProduct(productId: ID!, warehouseId: ID!, quantity: Int!): Product!
```

Dans `resolvers.Query` :

```js
warehouses: () => db.warehouses,
```

Dans `resolvers.Product` :

```js
stockByWarehouse: (product) =>
  db.stocks
    .filter((line) => line.productId === product.id)
    .map((line) => ({
      warehouse: findById(db.warehouses, line.warehouseId),
      quantity: line.quantity,
    })),
```

Le resolver renvoie des objets qui n'existent pas tels quels dans `db.js` : ils
sont construits à la volée pour correspondre au type `StockEntry`. Le champ
`warehouse` de chacun est ensuite résolu par défaut, puisque la propriété porte
le bon nom.

Dans `resolvers.Mutation`, avec deux fabriques d'erreurs déclarées en haut du
fichier pour éviter les répétitions :

```js
function notFound(message) {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });
}

function invalidInput(message) {
  return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}
```

```js
restockProduct: (_parent, { productId, warehouseId, quantity }) => {
  const product = findById(db.products, productId);
  if (!product) throw notFound(`Article introuvable : ${productId}`);

  const warehouse = findById(db.warehouses, warehouseId);
  if (!warehouse) throw notFound(`Entrepôt introuvable : ${warehouseId}`);

  if (quantity <= 0) throw invalidInput('La quantité doit être strictement positive.');

  const line = db.stocks.find(
    (stock) => stock.productId === product.id && stock.warehouseId === warehouse.id,
  );
  if (line) {
    line.quantity += quantity;
  } else {
    db.stocks.push({ productId: product.id, warehouseId: warehouse.id, quantity });
  }

  product.stock += quantity;
  return product;
},
```

### Exercice 8

Dans `type Query`, `products` prend ses deux derniers arguments :

```graphql
products(brandId: ID, maxPrice: Float, limit: Int, offset: Int): [Product!]!
```

Dans `type Mutation`, plus les inputs associés :

```graphql
createOrder(input: CreateOrderInput!): Order!
```

```graphql
input CreateOrderInput {
  userId: ID!
  lines: [OrderLineInput!]!
}

input OrderLineInput {
  productId: ID!
  quantity: Int!
}
```

La pagination s'applique après les filtres :

```js
products: (_parent, args) => {
  let result = db.products;
  if (args.brandId) {
    result = result.filter((product) => product.brandId === args.brandId);
  }
  if (args.maxPrice != null) {
    result = result.filter((product) => product.price <= args.maxPrice);
  }
  const start = args.offset ?? 0;
  const end = args.limit != null ? start + args.limit : undefined;
  return result.slice(start, end);
},
```

```js
createOrder: (_parent, { input }) => {
  const user = findById(db.users, input.userId);
  if (!user) throw notFound(`Client introuvable : ${input.userId}`);
  if (input.lines.length === 0) throw invalidInput('Une commande doit contenir au moins une ligne.');

  const lines = input.lines.map((line) => {
    const product = findById(db.products, line.productId);
    if (!product) throw notFound(`Article introuvable : ${line.productId}`);
    if (line.quantity <= 0) throw invalidInput('La quantité doit être strictement positive.');
    if (product.stock < line.quantity) {
      throw invalidInput(`Stock insuffisant pour ${product.name} : ${product.stock} disponible(s).`);
    }
    return { productId: product.id, quantity: line.quantity, unitPrice: product.price };
  });

  lines.forEach((line) => {
    findById(db.products, line.productId).stock -= line.quantity;
  });

  const order = {
    id: nextId(db.orders),
    userId: user.id,
    status: 'PENDING',
    createdAt: new Date().toISOString().slice(0, 10),
    lines,
  };
  db.orders.push(order);
  return order;
},
```

Le prix est recopié dans `unitPrice` au moment de la commande : une hausse
ultérieure du catalogue ne doit pas changer le total des commandes passées.

## Erreurs fréquentes à surveiller pendant la séance

- champ ajouté dans `typeDefs` mais pas dans `resolvers` : le champ vaut `null`,
  ou la requête échoue s'il est non nullable
- l'inverse, un resolver écrit sans déclaration dans le schéma : le serveur
  refuse de démarrer, sur `Query.brand defined in resolvers, but not in schema`.
  Le projet reformule ce message pour nommer les deux fichiers concernés. Cela
  arrive typiquement en collant d'un coup les resolvers de deux exercices, alors
  que le schéma n'a reçu que le premier
- comparaison d'identifiants avec `===` entre un nombre et une chaîne : les `ID`
  arrivent toujours en chaîne de caractères, d'où `findById` qui compare via
  `String()`
- oubli du point d'exclamation, ou inversement `[Product!]!` là où la liste peut
  être vide : une liste vide reste valide, c'est `null` qui ne l'est pas
- resolver de champ qui ignore son premier argument et renvoie toute la
  collection, par exemple `Brand.products` qui renvoie `db.products`
