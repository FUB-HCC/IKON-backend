const express = require('express')
const helmet = require('helmet')
const fs = require('fs-extra')
const bodyParser = require('body-parser')
const https = require('https')
const path = require('path')
const Dataloader = require('./Dataloader/dataloader')

const config = require(path.join(__dirname, '/../../assets/config/config.json'))
const secrets = require(path.join(__dirname, '/../../assets/config/secrets.json'))

const server = express()
server.use(helmet())
server.use('static', express.static(config.frontend.buildFolder))

// Server setting
const PORT = process.env.PORT || 8080

// Register body-parser
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

// Configure router
const router = express.Router();
server.use('/', router);

// load Dataloader
const data = new Dataloader(config, secrets)
data.load()
	.then(() => data.transform())

// Create https server & run
https.createServer({
    key: fs.readFileSync(path.join(__dirname, config.ssl.keyPath)),
    cert: fs.readFileSync(path.join(__dirname, config.ssl.crtPath))
}, server).listen(PORT, () => {
    console.log(`API Server Started On Port ${PORT}!`)
})

// Routes
router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, config.frontend.htmlPath))
})	

router.get('/api/cluster', (req, res) => {
	res.send('Not implemented yet!')
})

// exit strategy
process.on('exit', (err) => {  
    console.log(err);
})

	