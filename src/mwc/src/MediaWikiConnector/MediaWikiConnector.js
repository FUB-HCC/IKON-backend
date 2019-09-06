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
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(projects[2].query.results)) {
    const params2 = {
      action: 'browsebysubject',
      subject: key,
    };
    try {
      results.push(ikoncode.api.callAsync(params2));
    } catch (e) {
      console.log(params2, e);
    }
  }
  // for some reason this is necessary
  await Promise.all(results);
  return Promise.all(results);
};

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
      query: '[[Category:KnowledgeTransferActivity]]|?ExternalInitiative|?Format|?Goal|?SocialGoals|?FieldOfAction|limit=10000',
    };
    KTAs = await ikoncode.api.callAsync(params);
    console.log(Object.keys(KTAs[2].query.results));
    // console.log(Object.keys(KTAs));
  } catch (e) {
    console.log(e);
  }
  return KTAs[2].query.results;
  //return KTAs;
};

const fetchAllCollections = async (login) => {
  try {
    await login;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  let collections = [];

  try {
    const params = {
      action: 'ask',
      query: '[[Category:Sammlung]]|?BeschreibungDerSammlung|limit=10000',
    };
    collections = await ikoncode.api.callAsync(params);
    console.log(Object.keys(collections[2].query.results));
  } catch (e) {
    console.log(e);
  }
  return collections[2].query.results;
};

const fetchAllInfrastructure = async (login) => {
  try {
    await login;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  let infrastructure = [];

  try {
    const params = {
      action: 'ask',
      query: '[[Category:Labor]]|?BeschreibungDerForschungsinfrastruktur|limit=10000',
    };
    infrastructure = await ikoncode.api.callAsync(params);
    console.log(Object.keys(infrastructure[2].query.results));
  } catch (e) {
    console.log(e);
  }
  return infrastructure[2].query.results;
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
};

exports.getAllKTAs = async (loginPromise) => {
  return fetchAllKTAs(loginPromise);
};

exports.getAllCollections = async (loginPromise) => {
  return fetchAllCollections(loginPromise);
};

exports.getAllInfrastructure = async (loginPromise) => {
  return fetchAllInfrastructure(loginPromise);
};

exports.parseMediaWikiResponse = (response) => {
 
};
