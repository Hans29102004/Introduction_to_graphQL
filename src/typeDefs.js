// Le schéma : la liste des types, des champs et des opérations que le serveur
// accepte. Un client ne peut demander que ce qui est décrit ici.
//
// Les commentaires "TODO Exercice n" marquent les endroits à compléter
// pendant la partie 2 du TP. Chaque TODO a son jumeau dans src/resolvers.js :
// un champ déclaré ici sans resolver correspondant renverra null.

export const typeDefs = `#graphql
  """Un article du catalogue."""
  type Product {
    id: ID!
    name: String!
    "Prix de vente actuel, en euros."
    price: Float!
    "Stock total, tous entrepôts confondus."
    stock: Int!
    "Identifiant de la marque. La marque elle-même n'est pas encore exposée."
    brandId: ID

    # TODO Exercice 3 : ajouter le champ brand qui renvoie la marque de l'article
    # TODO Exercice 7 : ajouter le champ stockByWarehouse
  }

  """Un client de la boutique."""
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    "Les commandes passées par ce client."
    orders: [Order!]!

    # TODO Exercice 5 : ajouter le champ ordersCount
  }

  """Une commande passée par un client."""
  type Order {
    id: ID!
    status: OrderStatus!
    "Date de création, au format AAAA-MM-JJ."
    createdAt: String!
    "Le client qui a passé la commande."
    customer: User!
    "Le détail de la commande, une ligne par article."
    lines: [OrderLine!]!

    # TODO Exercice 5 : ajouter le champ total
  }

  """Une ligne de commande : un article, une quantité, un prix."""
  type OrderLine {
    "L'article commandé."
    product: Product!
    quantity: Int!
    "Prix unitaire au moment de la commande."
    unitPrice: Float!
  }

  """Les états possibles d'une commande."""
  enum OrderStatus {
    PENDING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  # TODO Exercice 1 : déclarer le type Brand (id, name, country)
  type Brand {
  id: ID!
  name: String!
  country: String!
}
  # TODO Exercice 4 : y ajouter le champ products
  # TODO Exercice 7 : déclarer les types Warehouse (id, name, city) et StockEntry

  """Les points d'entrée en lecture."""
  type Query {
    "Tous les articles du catalogue."
    products: [Product!]!
    "Un article par son identifiant, ou null s'il n'existe pas."
    product(id: ID!): Product
    "Tous les clients."
    users: [User!]!
    "Un client par son identifiant, ou null s'il n'existe pas."
    user(id: ID!): User
    "Toutes les commandes."
    orders: [Order!]!
    "Une commande par son identifiant, ou null si elle n'existe pas."
    order(id: ID!): Order

    # TODO Exercice 1 : ajouter brands
    brands: [Brand!]!
    # TODO Exercice 2 : ajouter brand(id: ID!)
    # TODO Exercice 6 : ajouter les arguments brandId et maxPrice sur products
    # TODO Exercice 7 : ajouter warehouses
  }

  """Les points d'entrée en écriture."""
  type Mutation {
    "Crée un client et le renvoie."
    createUser(input: CreateUserInput!): User!
    "Crée un article et le renvoie."
    createProduct(input: CreateProductInput!): Product!
    "Change l'état d'une commande et renvoie la commande mise à jour."
    updateOrderStatus(orderId: ID!, status: OrderStatus!): Order!

    # TODO Exercice 6 : ajouter createBrand(input: CreateBrandInput!)
    # TODO Exercice 7 : ajouter restockProduct(productId: ID!, warehouseId: ID!, quantity: Int!)
    # TODO Exercice 8 : ajouter createOrder(input: CreateOrderInput!)
  }

  """Les champs attendus pour créer un client."""
  input CreateUserInput {
    firstName: String!
    lastName: String!
    email: String!
  }

  """Les champs attendus pour créer un article."""
  input CreateProductInput {
    name: String!
    price: Float!
    "Stock initial, 0 par défaut."
    stock: Int = 0
    brandId: ID
  }

  # TODO Exercice 6 : déclarer l'input CreateBrandInput
  # TODO Exercice 8 : déclarer les inputs CreateOrderInput et OrderLineInput
`;
