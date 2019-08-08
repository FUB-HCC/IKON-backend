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

const viaProjects = async () => {
  let result = {};

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  console.log('trying: ', encodeURI('https://mwc:8081/projects'));
  try {
    result = await axios.get(encodeURI('https://mwc:8081/projects'), { httpsAgent: agent });
  } catch (e) {
    console.log(e);
  }

  return result.data || [];
};

exports.initVia = async (pool, { insertMfNProject, insertProject }) => {
  try {
    const projects = await viaProjects(); // eslint-disable-line no-await-in-loop

    // eslint-disable-next-line no-restricted-syntax
    for (const [i, project] of projects.entries()) {
      const p = arrayCleaner(project);

      if (p.project_summary != null) {
        pool.query(insertProject, [
          p.Identifier, p.title, p.project_summary, p.funding_start_year, p.funding_end_year,
          p.description,
        ]).then(() => {
          pool.query(insertMfNProject, [
            p.Identifier, p.organisational_unit, p.acronym, p.HatAntragsteller,
            p.FoerderkennzeichenDrittmittelprojekt, p.HatMittelgeber, p.HatProjektleiter,
            p.HatProjekttraeger, p.EditorialEntry, p.Status, p.project_summary,
            p.title, p.TitelEN, p.WeitereInformationen, p.description,
          ]);
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};
