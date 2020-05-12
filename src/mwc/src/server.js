const fs = require('fs');
const express = require('express');
const {initialize} = require('express-openapi');
const compression = require('compression');
const helmet = require('helmet');
var cors = require('cors');
const https = require('https');
const {stringify} = require('flatted/cjs');
const mediaWikiConnector = require('./services/MediaWikiConnector.js');

const loginPromise = mediaWikiConnector.wikiLogin();
mediaWikiConnector.fetchGraph(loginPromise);


const {apidocs} = require('./apidocs');
const app = express();

app.use(cors())
app.use(helmet());
app.use(compression({ level: 3 }));

initialize({
  app,
  apiDoc: apidocs,
  promiseMode: true,
  dependencies: {
    loginPromise: loginPromise,
    mediaWikiConnector: mediaWikiConnector
  },
  paths: './src/routes',
  docsPath: '/docs'
});

// Server setting
const PORT = process.env.PORT || 8080;


https.createServer({
  key: fs.readFileSync(process.env.SSL_KEY),
  cert: fs.readFileSync(process.env.SSL_CRT),
}, app).listen(PORT, () => {
  console.log(`API Server Started On Port ${PORT}!`);
});

