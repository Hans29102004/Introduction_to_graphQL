// Base de données en mémoire du TP.
// Tout est déjà rempli, y compris les marques, les entrepôts et les stocks.
// Certaines de ces données ne sont pas encore exposées dans le schéma GraphQL :
// c'est justement le travail de la partie 2 des exercices.
//
// Attention : les données vivent en mémoire. Chaque redémarrage du serveur
// remet le jeu de données dans l'état ci-dessous.

export const db = {
  // Marques. Pas encore exposées dans le schéma (partie 2).
  brands: [
    { id: '1', name: 'Fjordly', country: 'Suède' },
    { id: '2', name: 'Lumo', country: 'France' },
    { id: '3', name: 'Kettra', country: 'Allemagne' },
    { id: '4', name: 'Baseo', country: 'Portugal' },
  ],

  // Articles du catalogue. Exposés dès la partie 1.
  // stock est le stock total, tous entrepôts confondus.
  products: [
    { id: '1', name: 'Lampe de bureau Arc', price: 59.9, stock: 24, brandId: '2' },
    { id: '2', name: 'Chaise ergonomique Fjord', price: 249, stock: 8, brandId: '1' },
    { id: '3', name: 'Clavier mécanique K2', price: 89.5, stock: 42, brandId: '3' },
    { id: '4', name: 'Tapis de souris XL', price: 19.9, stock: 120, brandId: '3' },
    { id: '5', name: 'Étagère modulaire Pino', price: 139, stock: 15, brandId: '4' },
    { id: '6', name: 'Casque audio Silent', price: 179, stock: 30, brandId: '1' },
    { id: '7', name: 'Bouilloire Nord', price: 45, stock: 60, brandId: '1' },
    { id: '8', name: 'Bureau assis-debout', price: 499, stock: 5, brandId: '4' },
  ],

  // Clients de la boutique. Exposés dès la partie 1.
  users: [
    { id: '1', firstName: 'Camille', lastName: 'Ferrand', email: 'camille.ferrand@example.com' },
    { id: '2', firstName: 'Yanis', lastName: 'Bouali', email: 'yanis.bouali@example.com' },
    { id: '3', firstName: 'Lucie', lastName: 'Marchand', email: 'lucie.marchand@example.com' },
    { id: '4', firstName: 'Tom', lastName: 'Nguyen', email: 'tom.nguyen@example.com' },
  ],

  // Commandes. Exposées dès la partie 1.
  // unitPrice est le prix au moment de la commande : il ne suit pas les
  // changements de prix du catalogue.
  orders: [
    {
      id: '1',
      userId: '1',
      status: 'DELIVERED',
      createdAt: '2026-01-12',
      lines: [
        { productId: '3', quantity: 1, unitPrice: 89.5 },
        { productId: '4', quantity: 2, unitPrice: 19.9 },
      ],
    },
    {
      id: '2',
      userId: '2',
      status: 'SHIPPED',
      createdAt: '2026-02-03',
      lines: [{ productId: '2', quantity: 1, unitPrice: 249 }],
    },
    {
      id: '3',
      userId: '1',
      status: 'PENDING',
      createdAt: '2026-03-08',
      lines: [
        { productId: '1', quantity: 2, unitPrice: 59.9 },
        { productId: '6', quantity: 1, unitPrice: 179 },
        { productId: '7', quantity: 1, unitPrice: 45 },
      ],
    },
  ],

  // Entrepôts. Pas encore exposés dans le schéma (partie 2).
  warehouses: [
    { id: '1', name: 'Entrepôt Nord', city: 'Lille' },
    { id: '2', name: 'Entrepôt Sud', city: 'Marseille' },
    { id: '3', name: 'Entrepôt Ouest', city: 'Nantes' },
  ],

  // Répartition du stock par entrepôt. Pas encore exposée (partie 2).
  // Pour chaque article, la somme des quantités vaut le champ stock de l'article.
  stocks: [
    { productId: '1', warehouseId: '1', quantity: 10 },
    { productId: '1', warehouseId: '2', quantity: 14 },
    { productId: '2', warehouseId: '1', quantity: 3 },
    { productId: '2', warehouseId: '3', quantity: 5 },
    { productId: '3', warehouseId: '1', quantity: 20 },
    { productId: '3', warehouseId: '2', quantity: 12 },
    { productId: '3', warehouseId: '3', quantity: 10 },
    { productId: '4', warehouseId: '2', quantity: 70 },
    { productId: '4', warehouseId: '3', quantity: 50 },
    { productId: '5', warehouseId: '1', quantity: 15 },
    { productId: '6', warehouseId: '2', quantity: 18 },
    { productId: '6', warehouseId: '3', quantity: 12 },
    { productId: '7', warehouseId: '1', quantity: 25 },
    { productId: '7', warehouseId: '2', quantity: 35 },
    { productId: '8', warehouseId: '3', quantity: 5 },
  ],
};

// Retrouve un élément par son identifiant.
// Les identifiants GraphQL de type ID arrivent sous forme de chaîne,
// d'où la comparaison sur String().
export function findById(collection, id) {
  return collection.find((item) => String(item.id) === String(id));
}

// Calcule le prochain identifiant libre d'une collection.
export function nextId(collection) {
  const maxId = collection.reduce((max, item) => Math.max(max, Number(item.id)), 0);
  return String(maxId + 1);
}
