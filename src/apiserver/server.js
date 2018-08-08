"use strict";

const express = require('express')
const helmet = require('helmet')
const fs = require('fs-extra')
const bodyParser = require('body-parser')
const https = require('https')
const path = require('path')
const Dataloader = require('./Dataloader/dataloader')

const config = require(path.join(__dirname, '/../../assets/IKON-backend-config/config.json'))
const secrets = require(path.join(__dirname, '/../../assets/IKON-backend-config/secrets.json'))

const server = express()
server.use(helmet())
server.use('/static', express.static(path.join(__dirname, config.frontend.staticFolder)))

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

router.get('/api/projects', (req, res) => {
	console.log(dataloader.out.files['projects'])
	Promise.resolve(dataloader.out.files['projects'])
		.then((value) => {res.status(200).json(value)})
	
})

router.get('/api/institutions', (req, res) => {
	console.log(dataloader.out.files['institutions'])
	Promise.resolve(dataloader.out.files['institutions'])
		.then((value) => {res.status(200).json(value)})
	
})

// exit strategy
process.on('exit', (err) => {  
    console.log(err);
})

	