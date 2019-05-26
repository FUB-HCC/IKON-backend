const MWC = require('nodemw');
const Promise = require('bluebird');

const ikoncode = Promise.promisifyAll(new MWC(process.env.IKONCODE));
ikoncode.api = Promise.promisifyAll(ikoncode.api, { multiArgs: true });

// connect to IKON CODE
exports.wikiLogin = () => {
  try {
    return (ikoncode.logInAsync());
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

const fetchAllProjects = async (login) => {
  try {
    await login;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  let projects = [];

  try {
    const params1 = {
      action: 'ask',
      query: '[[Category:Drittmittelprojekt]][[RedaktionelleBeschreibung::+]][[Status::Freigegeben]]|?Identifier|limit=100000',
    };
    projects = await ikoncode.api.callAsync(params1);
    console.log(Object.keys(projects[2].query.results));
  } catch (e) {
    console.log(e);
  }

  const results = [];
  for (const key of Object.keys(projects[2].query.results)) {
    try {
      const params2 = {
        action: 'browsebysubject',
        subject: key,
      };
      results.push(ikoncode.api.callAsync(params2));
    } catch (e) {
      console.log(params2, e);
    }
  }
  // for some reason this is necessary
  await Promise.all(results);
  return Promise.all(results);
};

const getNameMapping = (name) => {
  const mapping = {
    Projektbeginn: 'funding_start_year',
    Projektende: 'funding_end_year',
    Zusammenfassung: 'project_summary',
    subject: 'id',
    RedaktionelleBeschreibung: 'description',
    HatFach: 'participating_subject_area',
    TitelProjekt: 'title',
    HatOrganisationseinheit: 'organisational_unit',
    Akronym: 'acronym',
    
  };

  return (Object.keys(mapping).includes(name)) ? mapping[name] : name;
};

exports.getAllProjects = async (loginPromise) => {
  return (await fetchAllProjects(loginPromise)).map(([a, b, { query: { subject, data } }]) => data.reduce((dict, { property, dataitem }) => {
      dict[getNameMapping(property)] = dataitem.map(({ item }) => item);
      return dict;
    }, { subject }));
} 

exports.parseMediaWikiResponse = (response) => {
 
}
