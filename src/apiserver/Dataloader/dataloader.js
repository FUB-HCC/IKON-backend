const path = require('path')
const fs = require('fs-extra')
const hash = require('object-hash')
const alasql = require('alasql')

class Dataloader {
	constructor(config, secrets){
		this.paths = config.data
		this.googleMapsClient = require('@google/maps').createClient({
  			key: secrets.geocoding_API_key,
  			Promise: Promise
			})
	}

	async read(file) {
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
				this.files.in[key] = await this.read(key)
			}
			this.files.out['projects'] = await alasql.promise(`
			SELECT proj.project_id AS project_id, 
				   FIRST(proj.institution_id) AS institution_id, 
				   ARRAY(DISTINCT countryCode.code) AS countries, 
				   ARRAY(DISTINCT people.person_id) AS people, 
				   FIRST(DISTINCT tax.subject_area) AS subject_area, 
				   FIRST(DISTINCT tax.review_board) AS review_board, 
				   FIRST(DISTINCT tax.research_area) AS research_area 
			FROM ? AS proj

			-- Match the country codes to projects
			LEFT JOIN ? AS countries
			ON proj.project_id = countries.project_id
			LEFT JOIN ? AS countryCode
			ON countries.country = countryCode.country

			-- Match participating people to projects
			LEFT JOIN ? AS projectsPeople
			ON proj.project_id = projectsPeople.project_id_number
			LEFT JOIN ? AS people
			ON projectsPeople.person_id = people.person_id

			-- Match taxonomy
			LEFT JOIN ? AS subj
			ON proj.project_id = subj.project_id
			LEFT JOIN ? AS tax
			ON subj.subject_area = tax.subject_area

			GROUP BY proj.project_id
			`, [this.files.in['projects'], 
				this.files.in['projects-countries'], 
				this.files.in['countryNames'], 
				this.files.in['projects-people'], 
				this.files.in['people'], 
				this.files.in['projects-subjects'],
				this.files.in['taxonomy']])

        	return this._save('projects')	
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
				this.files.out['institutions'] = require(filePath)
				if ( hash(this.files.in['institutions']) !== this.files.out['institutions']['hash'] ) {
					return this.geocodeInstitutions()
				}
			}
			else {
				return this.geocodeInstitutions()
			}
		}
		catch(reason) {
			console.log(reason)
		}
	}

	async geocodeInstitutions() {

		const geocode =  async loc => {
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
				this.files.out['institutions'][i]['loc'] = await geocode(this.files.out['institutions'][i]['address'])
			}
			console.log(this.files.out['institutions'])
			return this._save('institutions')
		}
		catch (reason) {
			console.log(reason)
		}

	}


	findInTaxonomy(names) {
		const tax = this.file['taxonomy-csv'].find(row => 
					names.some(name => Object.values(row).includes(name)))
		return (tax != undefined)?tax : {
			"Wissenschaftsbereich": "1 a",
			"Fachgebiet": "2 b"
		}
	}

	_findInInstitutions(id) {
		const institution = this.file['institutions-json']
				   				.find(row => row.institution_id == id)
		return (institution != undefined)? institution : {"address": ""}		   
	}


	async _computeEntry(entry) {
		const tax = this._findInTaxonomy(entry.subject_area.split(';'))
		const institution = this._findInInstitutions(entry.institution_id)
		console.log(institution)
		const address = institution.address.replace(new RegExp('\n', 'g'), ',')
		const pos = await this._geocode(address)
		return {
				'antragsteller': 'Anonym',
		        'end': entry.funding_end_year,
		        'forschungsbereich': tax['Wissenschaftsbereich'].split(/_(.+)/)[1],
		        'geldgeber': 'DFG',
		        'hauptthema': tax['Fachgebiet'].split(/ (.+)/)[1],
		        'id': entry.project_id,
		        'address': address,
		        'institution': institution.name,
		        'pos' : {
		        	'long': pos.lng,
		        	'lat': pos.lat
		        },
		        'kooperationspartner': '',
		        'nebenthemen': entry.participating_subject_areas_full_string
		        				.split(',')
		        				.map(topic => topic.trim())
		        				.filter(topic => topic != ''),
		        'projektleiter': 'Anonym',
		        'start': entry.funding_start_year,
		        'titel': entry.title,
		        'beschreibung': entry.project_abstract,
		        'href': '',
		        'forschungsregion': entry.international_connections
		        				.split(';')
		        				.map(region => region.trim())
		        				.filter(region => region != '')
		        				.map(region => {
		        					console.log(region, this._findInCountryNames(region))
		        					return this._findInCountryNames(region)}),
		        'synergie': '1'
		}
	}


	print() {
		if (this.file !== {}) {
			console.log(this.file)
		}
	}

	async _save(file) {
		try {
			return fs.writeJson(path.join(__dirname, this.paths.out[file]), this.files.out[file])
			console.log('success!')
		} catch (err) {
			console.error(err)
		}
	}

}

module.exports = Dataloader