

const fs = require('fs');
// const hash = require('object-hash')
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const https = require('https');
const { Pool } = require('pg');

// custom imports
const geocoder = require('./geocode.js');

// connect to database
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: fs.readFileSync('/run/secrets/postgres_password', 'utf8').trim(),
  port: process.env.PGPORT,
});

const server = express();

// set server middleware
server.use(helmet());
server.use(compression({ level: 3 }));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// Server setting
const PORT = process.env.PORT || 8080;

// set up sql queries
const queries = {
  getAllProjects: fs.readFileSync('./src/sql/getAllProjects.sql', 'utf8').trim(),
  getAllInstitutions: fs.readFileSync('./src/sql/getAllInstitutions.sql', 'utf8').trim(),
  insertGeolocation: fs.readFileSync('./src/sql/insertGeolocation.sql', 'utf8').trim(),
};

// Configure router
const router = express.Router();
server.use('/', router);

https.createServer({
  key: fs.readFileSync('/run/secrets/ssl_key'),
  cert: fs.readFileSync('/run/secrets/ssl_crt'),
}, server).listen(PORT, () => {
  console.log(`API Server Started On Port ${PORT}!`);
});


// Routes
router.get('/projects', async (req, res) => {
  // define offset and limit
  const offset = req.query.offset || 0;
  const limit = req.query.limit || 1000;
  const institution = req.query.institution || 13232;

  let row = '';
  try {
    row = (await pool.query(queries.getAllProjects, [institution, offset, limit])).rows;
  } catch (err) {
    console.log(err);
  }
  res.status(200).json(row);
});

router.get('/institutions', async (req, res) => {
  // define institution to filter by
  const institution = req.query.institution || 13232;

  // get missing geocodes
  let row = '';
  const missingGeocodes = {};
  try {
    row = (await pool.query(queries.getAllInstitutions, [institution])).rows;
    for (let i = row.length - 1; i >= 0; i = -1) {
      if (!(row[i].lat && row[i].long)) {
        missingGeocodes[i] = geocoder.geocodeLocation(row[i].address);
      }
    }

    await Promise.all(Object.values(missingGeocodes));
    for (const [key, value] of Object.entries(missingGeocodes)) {
      row[key].lat = value[0].lat;
      row[key].long = value[0].lon;
    }
  } catch (err) {
    console.log(err);
  }

  // send results
  res.status(200).json(row);

  // save new geocodes in database
  missingGeocodes.map((missingGeocode) => {
    try {
      pool.query(queries.insertGeolocation, missingGeocode);
    } catch (e) {
      console.log(e);
      return e;
    }
    return missingGeocode;
  });
});

// exit strategy
process.on('SIGINT', async (err) => {
  console.log(err);
  await pool.end();
});
