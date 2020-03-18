const fs = require('fs');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const https = require('https');
const {stringify} = require('flatted/cjs');
const MediaWikiConnector = require('./MediaWikiConnector/MediaWikiConnector.js');

const server = express();

// set server middleware
server.use(helmet());
server.use(compression({ level: 3 }));

const loginPromise = MediaWikiConnector.wikiLogin();

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

router.get('/graph', async (req, res) => {
  try {
    const result = (await MediaWikiConnector.fetchGraph(loginPromise));
    res.status(200).send(stringify(result));
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


