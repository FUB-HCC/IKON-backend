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

exports.initKnowledgeTransferActivities = async (pool, { insertTargetGroup, insertKnowledgeTransferActivity, insertKnowledgeTransferActivityTargetGroup }) => {
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
// eslint-disable-next-line no-restricted-syntax
      let ktastart = null;
      let ktaend = null;

    if(typeof k["Gestartet am"] != "undefined" && k["Gestartet am"] != null) {
        //console.log(k["Gestartet am"].raw);
       ktastart = k["Gestartet am"].raw;
    }
    if(typeof k["Endet am"] != "undefined" && k["Endet am"] != null)  {
      //console.log(k["Endet am"].raw);
      ktaend = k["Endet am"].raw;
    }
    //console.log(ktaend, ktastart);
      pool.query(insertKnowledgeTransferActivity, [
        // eslint-disable-next-line no-plusplus
        i, externalInternal, k.Format, null, k.Handlungsfeld, k.Ziel, k.Drittmittelprojekt, ktastart, ktaend
      ])

      for (const type of Object.values(kta.Zielgruppe)) {

        pool.query(insertTargetGroup, [type]);

        pool.query(insertKnowledgeTransferActivityTargetGroup,
          [i, type]);
      }
      i++;
    }
  } catch (e) {
    console.log(e);
  }
};
