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
				return ((Array.isArray(list))?list:list.split(',').map(elem => elem.trim())).filter(elem => elem != '' && elem != undefined && elem != 'NA')
			}

			this.files.out['projects'] = await alasql.promise(`
			SELECT proj.project_id AS id, 
				   FIRST(proj.institution_id) AS institution_id, 
				   clean(ARRAY(DISTINCT countryCode.code)) AS region, 
				   clean(ARRAY(DISTINCT people.institution_id)) AS cooperating_institutions, 
				   FIRST(tax.subject_area) AS subject_area, 
				   FIRST(tax.review_board) AS review_board, 
				   FIRST(tax.research_area) AS research_area,
				   'Anonym' AS applicant,
				   'DFG' AS sponsor,
				   clean(FIRST(proj.participating_subject_areas_full_string)) AS side_topics,
				   'Anonym' AS project_leader,
				   FIRST(proj.funding_start_year) AS start_date,
				   FIRST(proj.funding_end_year) AS end_date,
				   FIRST(proj.title) AS title,
				   FIRST(proj.project_abstract) AS abstract,
				   '' AS href,
				   '1' AS synergy


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
			ORDER BY proj.project_id
			`, [this.files.in['projects'], 
				this.files.in['projects-countries'], 
				this.files.in['countryNames'], 
				this.files.in['projects-people'], 
				this.files.in['people'],
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
				console.log('Saved file not found! Regenerating tables ...')
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
				SELECT DISTINCT inst.institution_id, inst.name, inst.address, inst.phone, inst.fax, inst.email
				FROM ? AS inst
 				JOIN ? AS proj
 				ON proj.institution_id = inst.institution_id

 				`,[this.files.in['institutions'], 
				   this.files.out['projects']])

			this.files.out['institutions'].push( ...(await alasql.promise(`
				SELECT DISTINCT inst.institution_id, inst.name, inst.address, inst.phone, inst.fax, inst.email
				FROM ? AS projectsPeople
				JOIN ? AS people
				ON projectsPeople.person_id = people.person_id
				JOIN ? AS inst
				ON people.institution_id = inst.institution_id

				`,[this.files.in['projects-people'], 
				   this.files.in['people'],
				   this.files.in['institutions']
				   ])))
			this.files.out['institutions'] = [... new Set(this.files.out['institutions'])]

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

	async _save(file, data) {
		try {
			return fs.writeJson(path.join(__dirname, this.paths.out[file]), data)
			console.log('success!')
		} catch (err) {
			console.error(err)
		}
	}

}

module.exports = Dataloader