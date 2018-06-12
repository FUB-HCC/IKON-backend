const express = require('express')
const helmet = require('helmet')
const fs = require('fs-extra')
const bodyParser = require('body-parser')
const https = require('https')
const path = require('path')
	
const server = express()
server.use(helmet())
server.use('static', express.static('IKON-projektor/build' ))

// Server setting
const PORT = process.env.PORT || 8080

// Register body-parser
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

// Configure router
const router = express.Router();
server.use('/', router);

// Create https server & run
https.createServer({
    key: fs.readFileSync(path.join(__dirname, '/../../assets/ssl/server.key')),
    cert: fs.readFileSync(path.join(__dirname, '/../../assets/ssl/server.crt'))
}, server).listen(PORT, () => {
    console.log(`API Server Started On Port ${PORT}!`)
})

// Routes
router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/../../IKON-projektor/build/index.html'))
})	

router.get('/api/cluster', (req, res) => {
	res.send('Not implemented yet!')
})

	