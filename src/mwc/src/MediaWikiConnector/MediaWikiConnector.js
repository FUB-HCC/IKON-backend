const MWC = require('nodemw');
const Promise = require('bluebird');
const Nominatim = require('nominatim-geocoder');
const got = require('got');
const {stringify} = require('flatted/cjs');


// promisify nodemw
ikoncode = Promise.promisifyAll(new MWC(process.env.IKONCODE));
ikoncode.api = Promise.promisifyAll(ikoncode.api, { multiArgs: true });
exports.ikoncode = ikoncode

// set up nominatim endpoint and warmup LRU cache
const geocoder = new Nominatim();

// connect to IKON CODE
wikiLogin = () => {
  try {
    return (ikoncode.logInAsync());
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

queryWiki = async (login, query) => {
  try {
    await login;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  try {
    return (await ikoncode.api.callAsync({action: 'ask', query: query}))[2].query.results;
  } catch (e) {
    console.log(e);
  }
};

const getDistinctEntries = (category, key) => {return Object.entries(Object.values(category).map(entry => entry[key] ? entry[key] : undefined).flat().reduce( (acc, o) => (acc[o] = (acc[o] || 0)+1, acc), {} )).map(([k, v]) => ({name: k, count: v}))}

const replaceMentionsInTarget = (source, target, sourcekey, targetkey, newkey) => {
  for(let coll of source){
    Object.assign(coll, {[newkey]: target.filter(project => {return project[targetkey].includes(coll[sourcekey])})})
  }
}

const replaceMentionsInSource = (source, target, sourcekey, targetkey) => {
  for(let project of source){
    Object.assign(project, {[sourcekey]: project[sourcekey].map(partner => target.find(entry => entry[targetkey] === partner))})
  }
}

const mergeDates = (source, beginning, end) => {return source.map(entry => ({...entry, ...{timeframe: [entry[beginning][0], entry[end][0]]}, ...{[beginning]: undefined}, ...{[end]: undefined}}))}

const fetchGraph = async login => {

  const queries = {
    projects: '[[Category:Drittmittelprojekt]][[RedaktionelleBeschreibung::!""]][[Status::Freigegeben]]|?HatFach|?HatOrganisationseinheit|?HatAntragsteller|?Projektbeginn|?Projektende|?RedaktionelleBeschreibung|?Projektleitung|?Akronym|?BenutztInfrastruktur|?HatSammlungsbezug|?HatKooperationspartner|?HatGeographischeVerschlagwortung|limit=100000',
    missingprojects: '[[Category:Drittmittelprojekt]][[Status::!Freigegeben]]|?Projektbeginn|?Projektende|limit=100000',
    collections: '[[Category:Sammlung]]|?BeschreibungDerSammlung|limit=10000',
    infrastructure: '[[Category:Labor]]|?BeschreibungDerForschungsinfrastruktur|limit=10000',
    ktas: '[[Category:KnowledgeTransferActivity]]|?End|?Start|?ExternalInitiative|?Format|?Goal|?SocialGoals|?FieldOfAction|?TargetGroup|?HatProject|?HatOrganisationseinheit|?Description|limit=10000'
  }
  // get all queries resolved
  const fetch = Object.fromEntries(Object.entries(queries).map(([k, query]) => {return [k, queryWiki(login, query)]}))
  let data = await Promise.props(fetch)

  // flatten the printouts key into the parent object and set `printouts` to undefined so it vanishes once it is serialized
  data = Object.fromEntries(Object.entries(data).map(([k, res]) => {return [k, Object.values(res).map(entry => ({...entry, ...entry.printouts, ...{printouts: undefined}}))]}))

  // get all distinct occurences of cooperations and target groups
  data.institutions = getDistinctEntries(data.projects, 'Kooperationspartner')
  
  // geocode the institutions first to give the Topicextraction time to load all models
  for(entry of data.institutions){
    geo = await geocoder.search({q: entry.name})
    if(geo.length == 0){
      geo = await geocoder.search({q: entry.name.split(' ').pop()})
    }
    if(geo[0]){
      entry.lon = geo[0].lon
      entry.lat = geo[0].lat
    }
    console.log(entry.lon)
  }
  data.targetgroups = getDistinctEntries(data.ktas, 'Zielgruppe')

  // merge date columns
  data.projects = mergeDates(data.projects, 'Projektbeginn', 'Projektende')
  data.missingprojects = mergeDates(data.missingprojects, 'Projektbeginn', 'Projektende')

  // create unique ids by enumeration
  let i = 0
  for(key in data){
    data[key] = data[key].map((entry, j) => ({...entry, ...{id: j + i}}))
    i += data[key].length
  }

  // get embeddings
  // TODO remove the rejection for release
  const response = await got.post('https://TopicExtractionService/embedding?method=BERT', {rejectUnauthorized: false, timeout:100000, json: data.projects.map(entry => entry['Redaktionelle Beschreibung'][0])}).json();
  data.projects = data.projects.map((entry, i) => ({...entry, ...response.project_data[i]}))
  data.cluster_topography = response.cluster_topography

  // map cooperations to projects
  replaceMentionsInSource(data.projects, data.institutions, 'Kooperationspartner', 'name')

  // map collections to projects
  replaceMentionsInTarget(data.collections, data.projects, 'fulltext', 'Sammlungsbezug', 'projects')
  replaceMentionsInSource(data.projects, data.collections, 'Sammlungsbezug', 'fulltext')

  // map infrastructure to projects
  replaceMentionsInTarget(data.infrastructure, data.projects, 'fulltext', 'Forschungsinfrastruktur', 'projects')
  replaceMentionsInSource(data.projects, data.infrastructure, 'Forschungsinfrastruktur', 'fulltext')

  replaceMentionsInSource(data.ktas, data.projects, 'Drittmittelprojekt', 'fulltext')
  replaceMentionsInTarget(data.targetgroups, data.ktas, 'name', 'Zielgruppe', 'ktas')


  // from here on only inplace operations to keep the references alive
  return data

}

// warmup LRU cache of geocoder
fetchGraph(wikiLogin())

exports.fetchGraph = fetchGraph
exports.wikiLogin = wikiLogin
