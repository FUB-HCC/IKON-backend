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
        cleanArray[key] = array[key].pop();
      }
    }
  }
  return cleanArray;
}

const getKnowledgeTransferActivities = async () => {
  let result = {};

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  console.log('trying: ', encodeURI('https://mwc:8081/ktas'));
  try {
    result = await axios.get(encodeURI('https://mwc:8081/ktas'), { httpsAgent: agent });
  } catch (e) {
    console.log(e);
  }

  return result.data || [];
};

exports.initKnowledgeTransferActivities = async (pool, { insertKnowledgeTransferActivities }) => {
  try {
    let i = 0;
    const ktas = await getKnowledgeTransferActivities(); // eslint-disable-line no-await-in-loop
    // eslint-disable-next-line no-restricted-syntax
    for (const value of Object.values(ktas)) {
      const kta = value.printouts;
      const k = arrayCleaner(kta);
      let externalInternal = true;
      if (k.ExternalInitiative === 'f') {
        externalInternal = false;
      }
      pool.query(insertKnowledgeTransferActivities, [
        // eslint-disable-next-line no-plusplus
        ++i, externalInternal, k.Format, null, k.Handlungsfeld, k.Ziel,
      ]);
    }
  } catch (e) {
    console.log(e);
  }
};
