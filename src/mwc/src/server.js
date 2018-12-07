"use strict";

const fs = require('fs')
var Promise = require('bluebird')
const express = require('express')
const compression = require('compression')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const https = require('https')
const { Pool } = require('pg')
const mwc = require('nodemw')

// connect to IKON CODE
let ikoncode = Promise.promisifyAll(new mwc('/run/secrets/ikoncode_secrets'))
ikoncode.api = Promise.promisifyAll(ikoncode.api,{multiArgs: true})
try {
	this.login = ikoncode.logInAsync()
}
catch (e) {
	console.log(e)
	exit(1)
}

const getAllProjects = async () => {
	await this.login
	const params = {
		action: 'ask',
		query: '[[Category:Drittmittelprojekt]]|?Identifier|?TitelProjekt|limit=10000'
	}
	const data = await ikoncode.api.callAsync(params)
	console.log(data)
	console.log(data[2].query.results)
}

getAllProjects()


// connect to database
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: fs.readFileSync('/run/secrets/postgres_password', 'utf8').trim(),
  port: process.env.PGPORT,
})

const server = express()

// set server middleware
server.use(helmet())
server.use(compression({level: 3}))
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

// Server setting
const PORT = process.env.PORT || 8080

// Configure router
const router = express.Router()
server.use('/', router)

https.createServer({
			    key: fs.readFileSync('/run/secrets/ssl_key'),
			    cert: fs.readFileSync('/run/secrets/ssl_crt')
			}, server).listen(PORT, () => {
			    console.log(`API Server Started On Port ${PORT}!`)
			})


// Routes
router.get('/projects', async (req, res, next) => {

})

// exit strategy
process.on('SIGINT', async (err) => {  
    console.log('err')
    await pool.end()
})