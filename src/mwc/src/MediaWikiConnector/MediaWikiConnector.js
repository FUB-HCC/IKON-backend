const MWC = require('nodemw');
const Promise = require('bluebird');

ikoncode = Promise.promisifyAll(new MWC(process.env.IKONCODE));
ikoncode.api = Promise.promisifyAll(ikoncode.api, { multiArgs: true });
exports.ikoncode = ikoncode

// connect to IKON CODE
exports.wikiLogin = () => {
  try {
    return (ikoncode.logInAsync());
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

const fetchGraph = async (login) => {
  try {
    await login;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  let projects = [];

  try {
    const params1 = {
      action: 'generator=ask',
      query: '[[Category:Drittmittelprojekt]][[RedaktionelleBeschreibung::!%27%27]]|[[Status::Freigegeben]]|?Identifier|limit=100000',
    };
    projects = await ikoncode.api.callAsync(params1);
    console.log(Object.keys(projects[2].query.results));
  } catch (e) {
    console.log(e);
  }
  //'[[Category:Drittmittelprojekt]][[RedaktionelleBeschreibung::+]][[Status::Freigegeben]]|?Identifier|limit=100000',

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
      //console.log(params2, e);
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
      query: '[[Category:KnowledgeTransferActivity]]|?End|?Start|?ExternalInitiative|?Format|?Goal|?SocialGoals|?FieldOfAction|?TargetGroup|?HatProject|?HatOrganisationseinheit|?Description|limit=10000',
    };
    KTAs = await ikoncode.api.callAsync(params);
    //console.log(Object.keys(KTAs[2].query.results));
  } catch (e) {
    console.log(e);
  }
  return KTAs[2].query.results;
};

exports.fetchAllCollections = async (login) => {
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
    //console.log(Object.keys(collections[2].query.results));
  } catch (e) {
    console.log(e);
  }
  console.log(collections[2].query.results)
  return Object.values(collections[2].query.results)
               .filter(coll => coll.fulltext != null)
               .map(coll => ({
                              name : coll.fulltext, 
                              description : coll.printouts["Beschreibung der Sammlung"][0]
                            }));
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
    //console.log(Object.keys(infrastructure[2].query.results));
  } catch (e) {
    console.log(e);
  }
  return Object.values(infrastructure[2].query.results)
             .filter(infr => infr.fulltext != null && infr.printouts.Einleitung != null)
             .map(infr => ({
                            name : infr.fulltext, 
                            description : infr.printouts.Einleitung[0]
                          }));
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
    HatOrganisationseinheit: 'organisationseinheit',
    Akronym: 'acronym',
    Identifier: 'id',
    HatSammlungsBezug: 'sammlungen',
    BenutztInfrastruktur: 'infrastruktur'
  };

  return (Object.keys(mapping).includes(name)) ? mapping[name] : name;
};

exports.getAllProjects = async (loginPromise) => {
  return (await fetchAllProjects(loginPromise)).map(([a, b, { query: { subject, data } }]) => data.reduce((dict, { property, dataitem }) => {
    dict[getNameMapping(property)] = (dataitem.length == 1) ? dataitem[0].item : dataitem.map(({ item }) => item);
    return dict;
  }, { subject }));
};

exports.getAllKTAs = async (loginPromise) => {
  return fetchAllKTAs(loginPromise);
};

exports.getAllInfrastructure = async (loginPromise) => {
  return fetchAllInfrastructure(loginPromise);
};

exports.parseMediaWikiResponse = (response) => {

};
