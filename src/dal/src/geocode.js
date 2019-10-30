const axios = require('axios');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const geocodeLocation = async (loc) => {
  let locComponents = loc.replace(/ /g, '+').split('\n');
  let result = {};

  // rate limit imposed by Nominatim
  await sleep(1000);

  while (locComponents.length > 0 && !('data' in result && result.data.length > 0)) {
    console.log('trying: ', encodeURI(`https://nominatim.openstreetmap.org/search?format=json&q=${locComponents.join(',')}`));
    try {
      const config = { 'User-Agent': 'IKON' };
      result = await axios.get(encodeURI(`https://nominatim.openstreetmap.org/search?format=json&q=${locComponents.join(',')}`), config);
    } catch (e) {
      console.log(`failed at: ${locComponents.join(',')}because of${e}`);
    }

    locComponents = locComponents.slice(1);
  }
  return result.data || { lat: null, lon: null };
};

exports.initGeolocations = async (pool, { insertGeolocation, getAllInstitutions }) => {
  // check if all institutions are geolocated
  try {
    const rows = (await pool.query(getAllInstitutions)).rows;
    const missingGeocodes = rows.map((row, index) => [index, row])
      .filter(([index, { lat, lon }]) => !(lat && lon))
      .map(([index, { address }]) => [index, address]);

    for (const [index, address] of missingGeocodes) {
      const gecode = await geocodeLocation(address); // eslint-disable-line no-await-in-loop
      if (typeof gecode[0] != "undefined"){
        //console.log(gecode);
        pool.query(insertGeolocation, [rows[index].id, gecode[0].lat, gecode[0].lon]);
      }
    }
  } catch (e) {
    console.log(e);
    return e;
  }
};
