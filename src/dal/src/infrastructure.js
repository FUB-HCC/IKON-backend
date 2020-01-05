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

const getInfrastructure = async () => {
  let result = {};

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  console.log('trying: ', encodeURI('https://mwc/infrastructure'));
  try {
    result = await axios.get(encodeURI('https://mwc/infrastructure'), { httpsAgent: agent });
  } catch (e) {
    console.log(e);
  }

  return result.data || [];
};

exports.initInfrastructure = async (pool, { insertInfrastructure }) => {
  try {
    const infrastructure = await getInfrastructure(); // eslint-disable-line no-await-in-loop
    if (infrastructure.length === 0) throw "MWC did not return infrastructure data";
    // eslint-disable-next-line no-restricted-syntax
      for (const inf of Object.values(infrastructure)) {
        if (inf.fulltext != null && inf.printouts.Einleitung != null) {
          pool.query(insertInfrastructure, [ inf.fulltext, inf.printouts.Einleitung[0]
          ]);
        }
      }

  } catch (e) {
    console.log(e);
  }
};
