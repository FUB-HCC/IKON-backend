  	const sleep = ms => {
  		return new Promise(resolve => setTimeout(resolve, ms));
	}

	exports._geocodeLocation =  async loc => {
		let loc_components = loc.replace(/ /g, '+').split('\n')
		let result = {};
		while(loc_components.length > 0 && !('data' in result && result.data.length > 0)) {
			console.log('trying: ', encodeURI('https://nominatim.openstreetmap.org/search?format=json&q=' + loc_components.join(',')))
			try {
				const config = {'User-Agent': 'IKON'}
				result = await axios.get(encodeURI('https://nominatim.openstreetmap.org/search?format=json&q=' + loc_components.join(',')), config)
			}
			catch(e) {
				console.log('failed at: ' + loc_components.join(',') + 'because of' + e)
			}

			loc_components = loc_components.slice(1)
		}
		//rate limit imposed by Nominatim
		await sleep(1000)
		return result.data.length > 0 ? result.data : {lat:0, lon:0} 
	}

	exports._geocodeLocations = async listOfLocs => {
		let geocodes = []
		for (let loc of listOfLocs) {
			geocodes.push(await _geocodeLocation(loc['address']))
			await sleep(1000)
		}
		return geocodes
	}