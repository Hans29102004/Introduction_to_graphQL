// Auto-évaluation des exercices de la partie 2.
// Le script construit le serveur à partir de vos typeDefs et de vos resolvers,
// puis exécute des requêtes en mémoire. Aucun serveur à démarrer, aucun réseau.
//
// Lancement : npm run check

import { ApolloServer } from '@apollo/server';

import { typeDefs } from '../src/typeDefs.js';
import { resolvers } from '../src/resolvers.js';
import { db, findById } from '../src/db.js';
import { explainSchemaError } from '../src/schemaErrors.js';

const NOT_STARTED = Symbol('non commencé');

let server;
try {
  server = new ApolloServer({ typeDefs, resolvers, includeStacktraceInErrorResponses: false });
  await server.start();
} catch (error) {
  console.error('Le schéma ne se construit pas. Corrigez cette erreur avant de continuer.\n');
  console.error(explainSchemaError(error));
  process.exit(1);
}

// Exécute une opération et renvoie { data, errors }.
async function exec(query, variables) {
  const response = await server.executeOperation({ query, variables });
  return response.body.singleResult;
}

// Une erreur de validation signifie que le champ demandé n'existe pas encore
// dans le schéma : l'exercice n'est pas commencé, ce n'est pas un échec.
function isNotStarted(errors) {
  return Boolean(errors?.some((error) => error.extensions?.code === 'GRAPHQL_VALIDATION_FAILED'));
}

// Renvoie null si tout va bien, sinon un message d'écart.
function expectEqual(expected, actual, label) {
  const a = JSON.stringify(expected);
  const b = JSON.stringify(actual);
  return a === b ? null : `${label} : attendu ${a}, reçu ${b}`;
}

function expectClose(expected, actual, label) {
  if (typeof actual !== 'number') return `${label} : attendu un nombre, reçu ${JSON.stringify(actual)}`;
  return Math.abs(expected - actual) < 0.01 ? null : `${label} : attendu ${expected}, reçu ${actual}`;
}

const ids = (list) => (Array.isArray(list) ? list.map((item) => item?.id) : list);

// Chaque exercice renvoie null en cas de succès, ou un message d'écart.
// L'ordre compte : les exercices qui modifient les données passent en dernier.
const exercises = [
  {
    number: 1,
    title: 'Le type Brand et la query brands',
    async run() {
      const { data, errors } = await exec('{ brands { id name country } }');
      if (isNotStarted(errors)) return NOT_STARTED;
      if (errors) return errors[0].message;
      return (
        expectEqual(db.brands.map((brand) => brand.id), ids(data.brands), 'identifiants des marques') ||
        expectEqual(db.brands[0].name, data.brands?.[0]?.name, 'nom de la première marque') ||
        expectEqual(db.brands[0].country, data.brands?.[0]?.country, 'pays de la première marque')
      );
    },
  },
  {
    number: 2,
    title: 'La query brand(id)',
    async run() {
      const { data, errors } = await exec('{ found: brand(id: "2") { id name } unknown: brand(id: "999") { id } }');
      if (isNotStarted(errors)) return NOT_STARTED;
      if (errors) return errors[0].message;
      return (
        expectEqual(findById(db.brands, '2').name, data.found?.name, 'marque 2') ||
        expectEqual(null, data.unknown, 'marque inexistante')
      );
    },
  },
  {
    number: 3,
    title: 'Le champ Product.brand',
    async run() {
      const { data, errors } = await exec('{ product(id: "1") { brand { id name } } }');
      if (isNotStarted(errors)) return NOT_STARTED;
      if (errors) return errors[0].message;
      const brand = findById(db.brands, findById(db.products, '1').brandId);
      return (
        expectEqual(brand.id, data.product?.brand?.id, 'identifiant de la marque') ||
        expectEqual(brand.name, data.product?.brand?.name, 'nom de la marque')
      );
    },
  },
  {
    number: 4,
    title: 'Le champ Brand.products',
    async run() {
      const { data, errors } = await exec('{ brand(id: "3") { products { id } } }');
      if (isNotStarted(errors)) return NOT_STARTED;
      if (errors) return errors[0].message;
      const expectedIds = db.products.filter((product) => product.brandId === '3').map((product) => product.id);
      return expectEqual(expectedIds, ids(data.brand?.products), 'articles de la marque 3');
    },
  },
  {
    number: 5,
    title: 'Les champs calculés Order.total et User.ordersCount',
    async run() {
      const { data, errors } = await exec('{ order(id: "1") { total } user(id: "1") { ordersCount } }');
      if (isNotStarted(errors)) return NOT_STARTED;
      if (errors) return errors[0].message;
      const order = findById(db.orders, '1');
      const total = order.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
      const orderCount = db.orders.filter((candidate) => candidate.userId === '1').length;
      return (
        expectClose(total, data.order?.total, 'total de la commande 1') ||
        expectEqual(orderCount, data.user?.ordersCount, 'nombre de commandes du client 1')
      );
    },
  },
  {
    number: 6,
    title: 'Les filtres sur products et la mutation createBrand',
    async run() {
      const filtered = await exec(`{
        byBrand: products(brandId: "3") { id }
        byPrice: products(maxPrice: 50) { id }
        combined: products(brandId: "1", maxPrice: 100) { id }
        noFilter: products { id }
      }`);
      if (isNotStarted(filtered.errors)) return NOT_STARTED;
      if (filtered.errors) return filtered.errors[0].message;

      const mismatch =
        expectEqual(
          db.products.filter((product) => product.brandId === '3').map((product) => product.id),
          ids(filtered.data.byBrand),
          'filtre brandId',
        ) ||
        expectEqual(
          db.products.filter((product) => product.price <= 50).map((product) => product.id),
          ids(filtered.data.byPrice),
          'filtre maxPrice',
        ) ||
        expectEqual(
          db.products.filter((product) => product.brandId === '1' && product.price <= 100).map((product) => product.id),
          ids(filtered.data.combined),
          'filtres combinés',
        ) ||
        expectEqual(db.products.map((product) => product.id), ids(filtered.data.noFilter), 'products sans argument');
      if (mismatch) return mismatch;

      const brandsBefore = db.brands.length;
      const created = await exec(
        'mutation($input: CreateBrandInput!) { createBrand(input: $input) { id name country } }',
        { input: { name: 'Marque de test', country: 'Italie' } },
      );
      if (isNotStarted(created.errors)) return 'createBrand n\'existe pas encore';
      if (created.errors) return created.errors[0].message;
      return (
        expectEqual('Marque de test', created.data.createBrand?.name, 'nom de la marque créée') ||
        expectEqual(brandsBefore + 1, db.brands.length, 'nombre de marques après création')
      );
    },
  },
  {
    number: 7,
    title: 'Les entrepôts, le stock détaillé et la mutation restockProduct',
    async run() {
      const read = await exec(`{
        warehouses { id name city }
        product(id: "3") { stockByWarehouse { quantity warehouse { id name } } }
      }`);
      if (isNotStarted(read.errors)) return NOT_STARTED;
      if (read.errors) return read.errors[0].message;

      const stockLines = db.stocks.filter((line) => line.productId === '3');
      const mismatch =
        expectEqual(db.warehouses.map((warehouse) => warehouse.id), ids(read.data.warehouses), 'identifiants des entrepôts') ||
        expectEqual(db.warehouses[0].city, read.data.warehouses?.[0]?.city, 'ville du premier entrepôt') ||
        expectEqual(
          stockLines.map((line) => line.warehouseId),
          read.data.product?.stockByWarehouse?.map((entry) => entry.warehouse?.id),
          'entrepôts de l\'article 3',
        ) ||
        expectEqual(
          stockLines.map((line) => line.quantity),
          read.data.product?.stockByWarehouse?.map((entry) => entry.quantity),
          'quantités de l\'article 3',
        );
      if (mismatch) return mismatch;

      const stockBefore = findById(db.products, '5').stock;
      const restocked = await exec(
        'mutation { restockProduct(productId: "5", warehouseId: "2", quantity: 7) { id stock stockByWarehouse { quantity warehouse { id } } } }',
      );
      if (isNotStarted(restocked.errors)) return 'restockProduct n\'existe pas encore';
      if (restocked.errors) return restocked.errors[0].message;

      const createdLine = restocked.data.restockProduct?.stockByWarehouse?.find((entry) => entry.warehouse?.id === '2');
      const restockMismatch =
        expectEqual(stockBefore + 7, restocked.data.restockProduct?.stock, 'stock total après réapprovisionnement') ||
        expectEqual(7, createdLine?.quantity, 'quantité dans l\'entrepôt 2');
      if (restockMismatch) return restockMismatch;

      const invalidQuantity = await exec('mutation { restockProduct(productId: "5", warehouseId: "2", quantity: -3) { id } }');
      if (!invalidQuantity.errors) return 'une quantité négative devrait déclencher une erreur';

      const unknownProduct = await exec('mutation { restockProduct(productId: "999", warehouseId: "2", quantity: 3) { id } }');
      if (!unknownProduct.errors) return 'un article inexistant devrait déclencher une erreur';
      return null;
    },
  },
  {
    number: 8,
    title: 'Bonus : createOrder et la pagination de products',
    bonus: true,
    async run() {
      const catalog = db.products.map((product) => product.id);
      const paginated = await exec('{ firstPage: products(limit: 3) { id } nextPage: products(limit: 2, offset: 2) { id } }');
      if (isNotStarted(paginated.errors)) return NOT_STARTED;
      if (paginated.errors) return paginated.errors[0].message;

      const mismatch =
        expectEqual(catalog.slice(0, 3), ids(paginated.data.firstPage), 'products(limit: 3)') ||
        expectEqual(catalog.slice(2, 4), ids(paginated.data.nextPage), 'products(limit: 2, offset: 2)');
      if (mismatch) return mismatch;

      const stockBefore = findById(db.products, '4').stock;
      const ordersBefore = db.orders.length;
      const created = await exec(
        `mutation($input: CreateOrderInput!) {
          createOrder(input: $input) { id status total customer { id } lines { quantity unitPrice product { id } } }
        }`,
        { input: { userId: '3', lines: [{ productId: '4', quantity: 2 }, { productId: '7', quantity: 1 }] } },
      );
      if (isNotStarted(created.errors)) return 'createOrder n\'existe pas encore';
      if (created.errors) return created.errors[0].message;

      const order = created.data.createOrder;
      const expectedTotal = findById(db.products, '4').price * 2 + findById(db.products, '7').price;
      return (
        expectEqual('PENDING', order?.status, 'état de la commande créée') ||
        expectEqual('3', order?.customer?.id, 'client de la commande créée') ||
        expectClose(expectedTotal, order?.total, 'total de la commande créée') ||
        expectEqual(ordersBefore + 1, db.orders.length, 'nombre de commandes après création') ||
        expectEqual(stockBefore - 2, findById(db.products, '4').stock, 'stock de l\'article 4 après la commande')
      );
    },
  },
];

console.log('Vérification des exercices de la partie 2.');
console.log('La partie 1 se valide dans Apollo Sandbox, pas par ce script.\n');

let passed = 0;
let bonusPassed = 0;
let bonusCount = 0;

for (const exercise of exercises) {
  if (exercise.bonus) bonusCount += 1;

  let result;
  try {
    result = await exercise.run();
  } catch (error) {
    result = `erreur pendant l'exécution : ${error.message}`;
  }

  const label = `Exercice ${exercise.number}  ${exercise.title}`;
  if (result === null) {
    console.log(`[ OK ] ${label}`);
    if (exercise.bonus) bonusPassed += 1;
    else passed += 1;
  } else if (result === NOT_STARTED) {
    console.log(`[ -- ] ${label}`);
  } else {
    console.log(`[ KO ] ${label}`);
    console.log(`       ${result}`);
  }
}

const required = exercises.length - bonusCount;
console.log(`\nRésultat : ${passed} sur ${required}, bonus ${bonusPassed} sur ${bonusCount}.`);
console.log('[ -- ] signale un exercice non commencé, [ KO ] un résultat inattendu.');

await server.stop();
