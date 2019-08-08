const https = require('https');
const axios = require('axios');

function extractValue(array, key) {
  if (!(key in array)) {
    return false;
  }
  return array[key][0];
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
      const projectAbstract = extractValue(project, 'project_summary');
      const title = extractValue(project, 'title');
      const fundingStartYear = extractValue(project, 'funding_start_year');
      const fundingEndYear = extractValue(project, 'funding_end_year');
      const description = extractValue(project, 'description');
      if (projectAbstract) {
        pool.query(insertProject, [
          i, title, projectAbstract, fundingStartYear, fundingEndYear, description,
        ]).then(() => {
          pool.query(insertMfNProject, [i, projectAbstract, title]);
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};
