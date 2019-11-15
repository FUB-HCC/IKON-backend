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

const getProjects = async () => {
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

exports.initProjects = async (pool, { insertMfNProject, insertProject , insertProjectInstitutions, insertInstitution }) => {
  try {
    const projects = await getProjects(); // eslint-disable-line no-await-in-loop
    //console.log(projects);

    // eslint-disable-next-line no-restricted-syntax
    for (const [i,project] of projects.entries()) {
      const p = arrayCleaner(project);

      if (p.project_summary != null) {
        pool.query(insertProject, [
          p.Identifier, p.title, p.project_summary, p.funding_start_year, p.funding_end_year,
          p.participating_subject_area, p.description
        ]).then(() => {
          pool.query(insertMfNProject, [
            p.Identifier, p.organisational_unit, p.acronym, p.HatAntragsteller,
            p.FoerderkennzeichenDrittmittelprojekt, p.HatMittelgeber, p.HatProjektleiter,
            p.HatProjekttraeger, p.EditorialEntry, p.Status, p.project_summary,
            p.title, p.TitelEN, p.WeitereInformationen, p.description,
          ]);

          if(typeof project.HatKooperationspartner != "undefined"){
            for (const coop of Object.values(project.HatKooperationspartner)) {
                    pool.query(insertInstitution, [coop] );
                    pool.query(insertProjectInstitutions, [p.Identifier, coop]);
            }
          }
        });

        }
      }

  } catch (e) {
    console.log(e);
  }
};
