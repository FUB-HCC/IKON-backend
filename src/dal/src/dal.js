"use strict";

const fs = require('fs')
//const hash = require('object-hash')

const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const https = require('https')
const axios = require('axios')
const querystring = require("querystring")

const { Pool } = require('pg')
console.log(fs.readFileSync('/run/secrets/postgres_password', 'utf8').trim())
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
	getAllInstitutions: fs.readFileSync('./src/sql/getAllInstitutions.sql', 'utf8').trim(),
	insertGeolocation: fs.readFileSync('./src/sql/insertGeolocation.sql', 'utf8').trim()
}

// Register body-parser
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))


// set up Google maps client
const googleMapsClient = require('@google/maps').createClient({
		key: fs.readFileSync('/run/secrets/geocoding_api_key'),
		Promise: Promise
	}) 

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

	const _geocode =  async loc => {
		let loc_components = loc.replace(/ /g, '+').split('\n')
		let result = {};
		while(loc_components && !('data' in result && result.data)) {
			console.log('trying: ', 'https://nominatim.openstreetmap.org/search?format=json&q=' + loc_components.join(','))
			try {
				result = await axios.get('https://nominatim.openstreetmap.org/search?format=json&q=' + loc_components.join(','))
			}
			catch(e) {
				console.log('failed at: ' + loc_components.join(','))
			}

			loc_components = loc_components.slice(1)
		}
		return result.data?result.data:[]
	}	

	let rows = ''
	try {
		rows = (await pool.query(queries.getAllInstitutions))['rows']
		rows = rows.map(async row => {
			if (row.lat && row.long) {
				return row
			}
			else {
				const loc = await _geocode(row['address'])
				console.log(row['address'].replace(/ /g, '+').replace(/\n/g, ','), loc?'1':'0')
				return Object.assign({}, row)
			}
		})
	}
	catch(err) {
		console.log(err)
	}
	Promise.all(rows)
		.then(rows =>{
			res.status(200).json(rows)
		})
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