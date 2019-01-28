const fs = require('fs');
const Promise = require('bluebird');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const https = require('https');
const { Pool } = require('pg');
const MWC = require('nodemw');

// connect to IKON CODE
const ikoncode = Promise.promisifyAll(new MWC('/run/secrets/ikoncode_secrets'));
ikoncode.api = Promise.promisifyAll(ikoncode.api, { multiArgs: true });
try {
  this.login = ikoncode.logInAsync();
} catch (e) {
  console.log(e);
  process.exit(1);
}

const getAllProjects = async () => {
  await this.login;
  const params1 = {
    action: 'ask',
    query: '[[Category:Drittmittelprojekt]]|?Identifier|limit=100000',
  };
  const data = await ikoncode.api.callAsync(params1);
  console.log(Object.keys(data[2].query.results));
  const responses = Object.keys(data[2].query.results).map((key) => {
    const params2 = {
      action: 'browsebysubject',
      subject: key,
    };
    return ikoncode.api.callAsync(params2);
  });
  await Promise.all(responses);
  return responses.map(entry => entry[2].query.data);
};

getAllProjects();


// connect to database
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: fs.readFileSync('/run/secrets/postgres_password', 'utf8').trim(),
  port: process.env.PGPORT,
});

const server = express();

// set server middleware
server.use(helmet());
server.use(compression({ level: 3 }));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// Server setting
const PORT = process.env.PORT || 8080;

// Configure router
const router = express.Router();
server.use('/', router);

https.createServer({
  key: fs.readFileSync('/run/secrets/ssl_key'),
  cert: fs.readFileSync('/run/secrets/ssl_crt'),
}, server).listen(PORT, () => {
  console.log(`API Server Started On Port ${PORT}!`);
});

// exit strategy
process.on('SIGINT', async (err) => {
  console.log(err);
  await pool.end();
});
