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
const ikoncode = Promise.promisifyAll(new MWC(process.env.IKONCODE));
ikoncode.api = Promise.promisifyAll(ikoncode.api, { multiArgs: true });
try {
  this.login = ikoncode.logInAsync();
} catch (e) {
  console.log(e);
  process.exit(1);
}

const getAllProjects = async () => {
  try {
    await this.login;
  } catch (e) {
  console.log(e);
  process.exit(1);
  }

  let projects = [];

  try {
    const params1 = {
      action: 'ask',
      query: '[[Category:Drittmittelprojekt]]|?Identifier|limit=100000',
    };
    projects = await ikoncode.api.callAsync(params1);
    console.log(Object.keys(projects[2].query.results));
  }
  catch (e) {
    console.log(e)
  }

  let results = [];
  for (const key of Object.keys(projects[2].query.results)) {
    try {
      const params2 = {
        action: 'browsebysubject',
        subject: key,
      };
      results.push(ikoncode.api.callAsync(params2));
    }
    catch (e) {
      console.log(e);
    }
  } 
  // for some reason this is necessary
  await Promise.all(results)
  return Promise.all(results);
};

getAllProjects().then(results => results.map(([a,b, {query}]) => console.log(query)));

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'dev') {
  // connect to database
  const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: fs.readFileSync('/run/secrets/postgres_password', 'utf8').trim(),
    port: process.env.PGPORT,
  });
}

const server = express();

// set server middleware
server.use(helmet());
server.use(compression({ level: 3 }));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// Server setting
const PORT = process.env.PORT || 8081;

// Configure router
const router = express.Router();
server.use('/', router);

/*
https.createServer({
  key: fs.readFileSync(process.env.SSL_KEY),
  cert: fs.readFileSync(process.env.SSL_CERT),
}, server).listen(PORT, () => {
  console.log(`API Server Started On Port ${PORT}!`);
});*/

// exit strategy
process.on('SIGINT', async (err) => {
  console.log(err);
  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'dev') {
    await pool.end();
  }
});
