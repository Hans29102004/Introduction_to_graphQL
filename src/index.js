import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';
import { explainSchemaError } from './schemaErrors.js';

// Le serveur assemble le schéma (typeDefs) et son implémentation (resolvers).
let server;
try {
  server = new ApolloServer({
    typeDefs,
    resolvers,
    // Sans cette option, chaque erreur renvoyée embarque sa pile d'appels.
    // Le message et le code placé dans extensions suffisent pendant le TP.
    includeStacktraceInErrorResponses: false,
  });
} catch (error) {
  console.error('Le serveur ne peut pas démarrer.\n');
  console.error(explainSchemaError(error));
  process.exit(1);
}

const { url } = await startStandaloneServer(server, {
  listen: { port: Number(process.env.PORT) || 4000 },
});

console.log(`Serveur GraphQL prêt sur ${url}`);
console.log('Ouvrez cette adresse dans un navigateur pour accéder à Apollo Sandbox.');
