const fs = require('fs');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const https = require('https');
const MediaWikiConnector = require('./MediaWikiConnector/MediaWikiConnector.js');
const WTAFaker = require('./WTAFaker/generateFakeWTA.js');

const server = express();

const loginPromise = MediaWikiConnector.wikiLogin();
const data = MediaWikiConnector.getAllProjects(loginPromise).then(data => {return data;});
const faker = new WTAFaker(data);


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


https.createServer({
  key: fs.readFileSync(process.env.SSL_KEY),
  cert: fs.readFileSync(process.env.SSL_CRT),
}, server).listen(PORT, () => {
  console.log(`API Server Started On Port ${PORT}!`);
});

// Routes
router.get('/projects', async (req, res) => {
  try {
    const result = (await MediaWikiConnector.getAllProjects(loginPromise));
    console.log(result);
    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

/* router.get('/ktas', async (req, res) => {
  try {
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(faker)));
    const result = await faker.generateFakeWTAs();
    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
}); */

router.get('/ktas', async (req, res) => {
  try {
    const result = (await MediaWikiConnector.getAllKTAs(loginPromise));
    console.log(result);
    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get('/collections', async (req, res) => {
  try {
    const result = (await MediaWikiConnector.getAllCollections(loginPromise));
    console.log(result);
    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get('/infrastructure', async (req, res) => {
  try {
    const result = (await MediaWikiConnector.getAllInfrastructure(loginPromise));
    console.log(result);
    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

// exit strategy
process.on('SIGINT', async (err) => {
  console.log(err);
  process.exit(0);
});
