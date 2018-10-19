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
	getAllProjects: fs.readFileSync('./src/sql/getAllProjects.sql', 'utf8').trim()
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

// exit strategy
process.on('SIGINT', async (err) => {  
    console.log('err')
    await pool.end()
})

/*

class Dataloader {
	constructor(config, secrets){
		this.paths = config.data


	async _read(file) {
		try {
			const filePath = path.join(__dirname, this.paths.in[file])
			if (this.paths.in[file].endsWith('csv')) {
				return alasql.promise(`SELECT * FROM CSV("${path.join(__dirname, this.paths.in[file])}")`)
			}
			else if (this.paths.in[file].endsWith('json')){
				return fs.readJson(filePath)
			}
			else {
				throw `${file} is not in a supported file format!`
			}
		}
		catch(reason)
		{
			console.log(reason)
			process.exit()
		}
	}

	async load() {
		try {
			// a subselect does not work yet in alasql. That's why this is a bit ugly
			this.files = {}
			this.files.in = {}
			this.files.out = {}
			for (const key in this.paths.in) {
				this.files.in[key] = await this._read(key)
			}

			alasql.fn.pattern = (address) => {
				return '%' + address.split('\n')
				                    .map(topic => topic.trim())
				                    .filter(line => line != '')
				                    .slice(0,2)
				                    .join('\n') + '%'
			}

			alasql.fn.clean = (list) => {
				return ((Array.isArray(list))?list:list.split(',').map(elem => elem.trim())).filter(elem => elem != '' && elem != undefined)
			}

			this.files.out['projects'] = await alasql.promise(`

			`, [this.files.in['projects'], 
				this.files.in['projects-countries'], 
				this.files.in['countryNames'], 
				this.files.in['projects-people'], 
				this.files.in['people'],
				this.files.in['institutions'], 
				this.files.in['projects-subjects'],
				this.files.in['taxonomy']])
			console.log(this.files.out['projects'])
        	return this._save('projects', this.files.out['projects'])	
		}
		catch(reason) {
			console.log(reason)
		}
	}

	async transform() {
		const filePath = path.join(__dirname, this.paths.out['institutions'])
		try {
			if ((await fs.pathExists(filePath)))
			{
				const filetemp = await fs.readJson(filePath)
				this.files.out['institutions'] = filetemp['data']
				const hashvalue = hash(this.files.in['institutions']) + hash(this.files.out['projects'])
				if ( hashvalue != filetemp['hash'] ) {
					return this._geocodeInstitutions()
				}
				else {
					console.log('Loading saved file!')
				}
			}
			else {
				console.log('Not found')
				return this._geocodeInstitutions()
			}
		}
		catch(reason) {
			console.log(reason)
		}
	}

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