"use strict";

const fs = require('fs')
//const hash = require('object-hash')

const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const https = require('https')

const { Pool } = require('pg')
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: fs.readFileSync('/run/secrets/postgres_password', 'utf8').trim(),
  port: process.env.PGPORT,
})

const server = express()
server.use(helmet())

// Server setting
const PORT = process.env.PORT || 8080

// set up sql queries
const queries = {
	getAllProjects: fs.readFileSync('./src/sql/getAllProjects.sql', 'utf8').trim(),
	getAllInstitutions: fs.readFileSync('./src/sql/getAllInstitutions.sql', 'utf8').trim()
}

console.log(queries.getAllProjects)

// Register body-parser
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

/*
console.log(process.env.PGPASSWORD)
// set up Google maps client
const googleMapsClient = require('@google/maps').createClient({
		key: fs.readFileSync('/run/secrets/geocoding_api_key'),
		Promise: Promise
	}) */

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
router.get('/projects', async (req, res) => {
	let row = ''
	try {
		row = await pool.query(queries.getAllProjects)
	}
	catch(err) {
		console.log(err)
	}
	res.status(200).json(row)
})

// Routes
router.get('/institutions', async (req, res) => {
	let row = ''
	try {
		row = await pool.query(queries.getAllProjects)
	}
	catch(err) {
		console.log(err)
	}
	res.status(200).json(row)
})

// exit strategy
process.on('SIGINT', async (err) => {  
    console.log('err')
    await pool.end()
})

/*

class Dataloader {
	constructor(config, secrets){
		this.paths = config.data




	async _geocodeInstitutions() {

		const _geocode =  async loc => {
		return this.googleMapsClient.geocode({address: loc})
				  .asPromise()
				  .then((response) => {
				  	console.log(loc, response.json.results[0]['geometry']['location'], '\n')
				    return response.json.results[0]['geometry']['location']
				  })
				  .catch((err) => {
				    console.log(err)
				    return {lat: 'error', lng: 'error'}
				  })
		}	

		try {
			this.files.out['institutions'] = await alasql.promise(`
				SELECT DISTINCT inst.*
				FROM ? AS inst
 				JOIN ? AS proj
				ON proj.institution_id = inst.institution_id
				`,[this.files.in['institutions'], this.files.out['projects']])
			for (var i in this.files.out['institutions']) {
				this.files.out['institutions'][i]['loc'] = await _geocode(this.files.out['institutions'][i]['address'])
			}
			console.log(this.files.out['institutions'])
			return this._save('institutions', {hash: hash(this.files.in['institutions']) + hash(this.files.out['projects']), data: this.files.out['institutions']})
		}
		catch (reason) {
			console.log(reason)
		}

	}


	print() {
		if (this.file !== {}) {
			console.log(this.file)
		}
	}

	async _save(file, data) {
		try {
			return fs.writeJson(path.join(__dirname, this.paths.out[file]), data)
			console.log('success!')
		} catch (err) {
			console.error(err)
		}
	}

}
*/