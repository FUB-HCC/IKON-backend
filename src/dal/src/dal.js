const fs = require('fs');
// const hash = require('object-hash')
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const { Pool } = require('pg');

// custom imports
const { initVia } = require('./mfn.js');
const { initGeolocations } = require('./geocode.js');

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
server.use(cors());
server.use(helmet());
server.use(compression({ level: 3 }));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// Server setting
const PORT = process.env.PORT || 8080;

// set up sql queries
const queries = {
  getAllProjects: fs.readFileSync('./src/sql/getAllProjects.sql', 'utf8').trim(),
  getAllInstitutions: fs.readFileSync('./src/sql/getAllInstitutions.sql', 'utf8').trim(),
  // getAllCollections: fs.readFileSync('./src/sql/getAllCollections.sql', 'utf8').trim(),
  // getAllInfrastructure: fs.readFileSync('./src/sql/getAllInfrastructure.sql', 'utf8').trim(),
  getAllKnowledgeTransferActivities: fs.readFileSync('./src/sql/getAllKnowledgeTransferActivities.sql', 'utf8').trim(),
  getConnectedInstitutions: fs.readFileSync('./src/sql/getConnectedInstitutions.sql', 'utf8').trim(),
  insertGeolocation: fs.readFileSync('./src/sql/insertGeolocation.sql', 'utf8').trim(),
  insertMfNProject: fs.readFileSync('./src/sql/insertMfNProject.sql', 'utf-8').trim(),
  insertProject: fs.readFileSync('./src/sql/insertProject.sql', 'utf-8').trim(),
};

// Configure router
const router = express.Router();
server.use('/', router);

https.createServer({
  key: fs.readFileSync('/run/secrets/ssl_key'),
  cert: fs.readFileSync('/run/secrets/ssl_crt'),
}, server).listen(PORT, () => {
  console.log(`API Server Started On Port ${PORT}!`);
});

// Routes
router.get('/projects', async (req, res) => {
  // define offset and limit
  const offset = req.query.offset || 0;
  const limit = req.query.limit || 1000;
  const institution = req.query.institution || 13232;

  let rows = '';
  try {
    rows = (await pool.query(queries.getAllProjects, [institution, offset, limit])).rows;
    res.status(200).json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get('/knowledgeTransferActivities', async (req, res) => {
  let rows = '';
  try {
    rows = (await pool.query(queries.getAllKnowledgeTransferActivities, [])).rows;
    res.status(200).json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get('/institutions', async (req, res) => {
  // define institution to filter by
  const institution = req.query.institution || 13232;

  let rows = '';
  try {
    rows = (await pool.query(queries.getConnectedInstitutions, [institution])).rows;
    res.status(200).json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.patch('/institutions', async (req, res) => {
  try {
    initGeolocations(pool, queries);
    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch('/projects', async (req, res) => {
  try {
    initVia(pool, queries);
    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch('/knowledgeTransferActivities', async (req, res) => {
  try {
    // TODO insert kta in DB
    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

// exit strategy
process.on('SIGINT', async (err) => {
  console.log(err);
  await pool.end();
  process.exit(0);
});
