const https = require('https');
const axios = require('axios');

function arrayCleaner(array) {
  const cleanArray = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(array)) {
    if (Array.isArray(array[key])) {
      if (array[key].length === 0) {
        cleanArray[key] = null;
      } else {
        cleanArray[key] = array[key][array[key].length-1];
      }
    }
  }
  return cleanArray;
}

const getCollections = async () => {
  let result = {};

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  console.log('trying: ', encodeURI('https://mwc:8081/collections'));
  try {
    result = await axios.get(encodeURI('https://mwc:8081/collections'), { httpsAgent: agent });
  } catch (e) {
    console.log(e);
  }

  return result.data || [];
};

exports.initCollections = async (pool, { insertCollections }) => {
  try {
    const collections = await getCollections(); // eslint-disable-line no-await-in-loop
    //console.log(projects);

    // eslint-disable-next-line no-restricted-syntax
    for (const coll of Object.values(collections)) {
      //const coll = arrayCleaner(coll);

      if (coll.fulltext != null) {
        pool.query(insertCollections, [ coll.fulltext, coll.printouts["Beschreibung der Sammlung"][0]
        ]);

      }
    }

  } catch (e) {
    console.log(e);
  }
};
