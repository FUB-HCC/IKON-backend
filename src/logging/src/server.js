const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs')

const server = express();

// set server middleware
server.use(helmet());
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
});

// Routes
router.post('/logging', (req, res) => {
  console.log(`${req.body.event},${req.body.user},${Date.now()},${req.body.eventData}`)
  res.status(200).send()
});