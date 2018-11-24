"use strict";

const fs = require('fs')
//const hash = require('object-hash')
const express = require('express')
const compression = require('compression')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const https = require('https')
const axios = require('axios')
const querystring = require("querystring")
const { Pool } = require('pg')

// custom imports
const geocoder = require('./geocode.js')
const MediaWikiConnector = require('./mediawikiconnector.js')
const bot = new MediaWikiConnector('/run/secrets/ikoncode_secrets')

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

// set up sql queries
const queries = {
	getAllProjects: fs.readFileSync('./src/sql/getAllProjects.sql', 'utf8').trim(),
	getAllInstitutions: fs.readFileSync('./src/sql/getAllInstitutions.sql', 'utf8').trim(),
	insertGeolocation: fs.readFileSync('./src/sql/insertGeolocation.sql', 'utf8').trim()
}

// Configure router
const router = express.Router();
server.use('/', router);

https.createServer({
			    key: fs.readFileSync('/run/secrets/ssl_key'),
			    cert: fs.readFileSync('/run/secrets/ssl_crt')
			}, server).listen(PORT, () => {
			    console.log(`API Server Started On Port ${PORT}!`)
			})


// Routes
router.get('/projects', async (req, res, next) => {
	let row = ''
	try {
		row = (await pool.query(queries.getAllProjects))['rows']
	}
	catch(err) {
		console.log(err)
	}
	res.status(200).json(row)
})

// Routes
router.get('/institutions', async (req, res, next) => {
	// get missing geocodes
	let row = ''
	let missingGeocodes = []
	try {
		row = (await pool.query(queries.getAllInstitutions))['rows']
		for (var i = row.length - 1; i >= 0; i--) {
			if (!(row[i].lat && row[i].long)) {
				const geocode = await geocoder._geocodeLocation(row[i]['address'])
				missingGeocodes.push([row[i]['id'], geocode[0].lat, geocode[0].lon])
				row[i]['lat'] = geocode[0].lat
				row[i]['long'] = geocode[0].lon
			}
		}
	}
	catch(err) {
		console.log(err)
	}

	// send results
	res.status(200).json(row)

	// save new geocodes in database
	for(let missingGeocode of missingGeocodes) {
		try {
			pool.query(queries.insertGeolocation, missingGeocode)
		}
		catch(e) {
			console.log(e)
		}
	}
})

// exit strategy
process.on('SIGINT', async (err) => {  
    console.log('err')
    await pool.end()
})