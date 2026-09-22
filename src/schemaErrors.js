// Apollo refuse de construire le serveur quand le schéma et les resolvers ne
// s'accordent pas, et son message est assez sec. Cette fonction le traduit en
// consigne utilisable pendant le TP.

const RESOLVER_WITHOUT_FIELD = /^([\w]+)\.([\w]+) defined in resolvers, but not in schema$/;

export function explainSchemaError(error) {
  const match = RESOLVER_WITHOUT_FIELD.exec(error.message);
  if (!match) return error.message;

  const [, type, field] = match;
  return [
    `${type}.${field} existe dans src/resolvers.js mais pas dans src/typeDefs.js.`,
    'Un resolver ne peut exister que pour un champ déclaré dans le schéma.',
    '',
    `À faire : déclarer le champ ${field} sur ${type} dans src/typeDefs.js,`,
    'ou retirer ce resolver si vous ne faites pas encore cet exercice.',
    '',
    'Rappel : chaque exercice se fait en deux temps, le schéma d\'abord,',
    'le resolver ensuite.',
  ].join('\n');
}
