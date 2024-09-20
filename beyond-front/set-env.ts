const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

const envFile = process.env['NODE_ENV'] === 'production' ? '.env.prod' : '.env';
dotenv.config({ path: envFile });

const targetFileName =
  process.env['NODE_ENV'] === 'production'
    ? 'environment.prod.ts'
    : 'environment.ts';
const targetPath = path.resolve(
  __dirname,
  `./src/environments/${targetFileName}`
);

const envConfigFile = `
export const environment = {
  production: ${process.env['NODE_ENV'] === 'production'},
  apiUrl: '${process.env['API_URL']}',
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`Output generated at ${targetPath}`);
