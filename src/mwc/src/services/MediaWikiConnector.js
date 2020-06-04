const MWC = require("nodemw");
const Promise = require("bluebird");
const Nominatim = require("nominatim-geocoder");
const got = require("got");
const { stringify } = require("flatted/cjs");

// promisify nodemw
ikoncode = Promise.promisifyAll(new MWC(process.env.IKONCODE));
ikoncode.api = Promise.promisifyAll(ikoncode.api, { multiArgs: true });
exports.ikoncode = ikoncode;

// set up nominatim endpoint and warmup LRU cache
const geocoder = new Nominatim({ secure: false });

/**
 * Creates a promise for the login to VIA. The login process is done once it resolves.
 * @returns {Promise} - The promise
 */
wikiLogin = () => {
  try {
    return ikoncode.logInAsync();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

/**
 * Represents a book.
 * @param {Promise} login - The login promise.
 * @param {string} query - The semantic Wiki query which is passed the VIA.
 * @returns {Any} - The result from the VIA
 */
queryWiki = async (login, query) => {
  try {
    await login;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  try {
    return (await ikoncode.api.callAsync({ action: "ask", query: query }))[2]
      .query.results;
  } catch (e) {
    console.log(e);
  }
};

/**
 * A general function to get all distinct entries in a dict and their counts
 * @param {string} category - The title of the book.
 * @param {string} key - The author of the book.
 * @returns {Dict} - A dict of distinct entries and their counts as values
 */
const getDistinctEntries = (category, key) => {
  return Object.entries(
    Object.values(category)
      .map((entry) => (entry[key] ? entry[key] : undefined))
      .flat()
      .reduce((acc, o) => ((acc[o] = (acc[o] || 0) + 1), acc), {})
  ).map(([k, v]) => ({ name: k, count: v }));
};

/**
 * A general function to interlink two lists  in two dicts by replacing all mentions of a key in the target list with the respective value from the other list
 * @param {Dict} source - The source dict.
 * @param {Dict} target - The target array.
 * @param {string} sourcekey - The key at which the array is found in source.
 * @param {string} targetkey - The key at which the array is found in target.
 * @param {string} newKey - The name of the new key under which the links are safed in the source.
 */
const replaceMentionsInTarget = (
  source,
  target,
  sourcekey,
  targetkey,
  newkey
) => {
  for (let coll of source) {
    Object.assign(coll, {
      [newkey]: target.filter((project) => {
        return project[targetkey].includes(coll[sourcekey]);
      }),
    });
  }
};

/**
 * A general function to interlink two lists  in two dicts by replacing all mentions of a key in the source list with the respective value from the other list
 * @param {Dict} source - The source dict.
 * @param {Dict} target - The target array.
 * @param {string} sourcekey - The key at which the array is found in source.
 * @param {string} targetkey - The key at which the array is found in target.
 */
const replaceMentionsInSource = (source, target, sourcekey, targetkey) => {
  for (let project of source) {
    Object.assign(project, {
      [sourcekey]: project[sourcekey]
        .map((partner) => target.find((entry) => entry[targetkey] === partner))
        .filter((partner) => partner),
    });
  }
};

/**
 * A function to merge map the date format from VIA to a simpel timestamp format in a two-element array
 * @param {Array} source - The source list.
 * @param {string} beginning - The key in which the start is found.
 * @param {string} end - he key in which the end is found.
 */
const mergeDates = (source, beginning, end) => {
  return source.map((entry) => ({
    ...entry,
    ...{ timeframe: [entry[beginning][0].timestamp, entry[end][0].timestamp] },
    ...{ [beginning]: undefined },
    ...{ [end]: undefined },
  }));
};

/**
 * This function queries the VIA and embedds all information in a cyclical graph which is marshalled to a string
 * @returns {string} - A marshalled version of the graph in the flatted (https://github.com/WebReflection/flatted) format
 */

const fetchGraph = async (login) => {
  const geocoding = true;
  const embedding = true;

  const queries = {
    projects:
      '[[Category:Drittmittelprojekt]][[RedaktionelleBeschreibung::!""]][[Status::Freigegeben]]|?HatFach|?HatOrganisationseinheit|?HatAntragsteller|?Projektbeginn|?Projektende|?RedaktionelleBeschreibung|?HatProjektleiter|?Akronym|?BenutztInfrastruktur|?HatSammlungsbezug|?HatKooperationspartner|?HatGeographischeVerschlagwortung|limit=100000',
    missingprojects:
      "[[Category:Drittmittelprojekt]][[Status::!Freigegeben]]|?Projektbeginn|?Projektende|limit=100000",
    collections: "[[Category:Sammlung]]|?BeschreibungDerSammlung|limit=10000",
    infrastructure:
      "[[Category:Labor]]|?BeschreibungDerForschungsinfrastruktur|limit=10000",
    ktas:
      "[[Category:KnowledgeTransferActivity]]|?End|?Start|?ExternalInitiative|?Format|?Goal|?SocialGoals|?FieldOfAction|?TargetGroup|?HatProject|?HatOrganisationseinheit|?Description|limit=10000",
  };
  // get all queries resolved
  const fetch = Object.fromEntries(
    Object.entries(queries).map(([k, query]) => {
      return [k, queryWiki(login, query)];
    })
  );
  let data = await Promise.props(fetch);

  // flatten the printouts key into the parent object and set `printouts` to undefined so it vanishes once it is serialized
  data = Object.fromEntries(
    Object.entries(data).map(([k, res]) => {
      return [
        k,
        Object.values(res).map((entry) => ({
          ...entry,
          ...entry.printouts,
          ...{ printouts: undefined },
        })),
      ];
    })
  );

  // get all distinct occurences of cooperations and target groups
  data.institutions = getDistinctEntries(data.projects, "Kooperationspartner");

  // geocode the institutions first to give the Topicextraction time to load all models
  if (geocoding) {
    let i = 1;
    for (entry of data.institutions) {
      geo = await geocoder.search({ q: entry.name });
      if (geo.length == 0) {
        geo = await geocoder.search({ q: entry.name.split(" ").pop() });
      }
      if (geo[0]) {
        entry.lon = geo[0].lon;
        entry.lat = geo[0].lat;
      }
      console.log(
        `${i} out of ${data.institutions.length} institutions geocoded`
      );
      i++;
    }
  }
  data.targetgroups = getDistinctEntries(data.ktas, "Zielgruppe");
  data.formats = getDistinctEntries(data.ktas, "Format");

  // merge date columns
  data.projects = mergeDates(data.projects, "Projektbeginn", "Projektende");
  data.missingprojects = mergeDates(
    data.missingprojects,
    "Projektbeginn",
    "Projektende"
  );

  // create unique ids by enumeration
  let i = 0;
  for (key in data) {
    data[key] = data[key].map((entry, j) => ({ ...entry, ...{ id: j + i } }));
    i += data[key].length;
  }

  // get embeddings
  // TODO remove the rejection for release
  if (embedding) {
    let retry = true;
    let response = undefined;
    while (retry) {
      try {
        response = await got
          .post("https://TopicExtractionService/embedding?method=HDP", {
            rejectUnauthorized: false,
            timeout: 100000,
            json: data.projects.map(
              (entry) => entry["Redaktionelle Beschreibung"][0]
            ),
          })
          .json();
        retry = false;
      } catch (e) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    data.projects = data.projects.map((entry, i) => ({
      ...entry,
      ...response.project_data[i],
    }));
    data.cluster_topography = response.cluster_topography;
  }

  // map cooperations to projects
  replaceMentionsInSource(
    data.projects,
    data.institutions,
    "Kooperationspartner",
    "name"
  );

  // map collections to projects
  replaceMentionsInTarget(
    data.collections,
    data.projects,
    "fulltext",
    "Sammlungsbezug",
    "projects"
  );
  replaceMentionsInSource(
    data.projects,
    data.collections,
    "Sammlungsbezug",
    "fulltext"
  );

  // map infrastructure to projects
  replaceMentionsInTarget(
    data.infrastructure,
    data.projects,
    "fulltext",
    "Forschungsinfrastruktur",
    "projects"
  );
  replaceMentionsInSource(
    data.projects,
    data.infrastructure,
    "Forschungsinfrastruktur",
    "fulltext"
  );

  replaceMentionsInSource(
    data.ktas,
    data.projects,
    "Drittmittelprojekt",
    "fulltext"
  );
  replaceMentionsInTarget(
    data.targetgroups,
    data.ktas,
    "name",
    "Zielgruppe",
    "ktas"
  );

  replaceMentionsInTarget(data.formats, data.ktas, "name", "Format", "ktas");
  replaceMentionsInSource(data.ktas, data.formats, "Format", "name");

  return stringify(data);
};
exports.fetchGraph = fetchGraph;
exports.wikiLogin = wikiLogin;
