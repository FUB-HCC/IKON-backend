const axios = require('axios');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const geocodeLocation = async (loc) => {
  let locComponents = loc.replace(/ /g, '+').split('\n');
  let result = {};
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
  // rate limit imposed by Nominatim
  await sleep(1000);
  return result.data || { lat: 0, lon: 0 };
};

exports.geocodeLocations = async (listOfLocs) => {
  const geocodes = [];
  for (const loc of listOfLocs) {
    geocodes.push(geocodeLocation(loc.address));
    await sleep(1000); // eslint-disable-line no-await-in-loop
  }
  await Promise.all(geocodes);
  return geocodes;
};
