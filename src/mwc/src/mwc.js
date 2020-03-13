const fs = require('fs');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const https = require('https');
const MediaWikiConnector = require('./MediaWikiConnector/MediaWikiConnector.js');

const server = express();

const loginPromise = MediaWikiConnector.wikiLogin();

const fetchAllKTAs = async (login) => {
  try {
    await login;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  let KTAs = [];

  try {
    const params = {
      action: 'ask',
      query: '[[Category:Drittmittelprojekt]][[RedaktionelleBeschreibung::!%27%27]]|[[Status::Freigegeben]]|?Identifier|?HatFach|?HatOrganisationseinheit|?HatAntragsteller|?Projektbeginn|?Projektende|?Zusammenfassung|?Projektleitung|?Akronym|?BenutztInfrastruktur|?HatSammlungsbezug|?HatKooperationspartner|?HatWtaSammlungsbezug|limit=100000',
    };
    KTAs = await MediaWikiConnector.ikoncode.api.callAsync(params);
  } catch (e) {
    console.log(e);
  }
  return KTAs[2].query.results;
};

fetchAllKTAs(loginPromise).then(results => {
  console.log(results)
  process.exit()

})
