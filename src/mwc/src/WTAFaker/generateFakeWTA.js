const faker = require('faker');

class WTAFaker{

  constructor(projects){
    this.projects = projects;
  }

  coinToss(prob) {
    return Math.random() < prob;
  }

  getRandomInt([mins, maxs]) {
    const min = Math.ceil(mins);
    const max = Math.floor(maxs);
    return Math.floor(Math.random() * (max - min)) + min;
  };

  getRandomArrayElement(projects) {
    return projects[Math.floor(Math.random()*(projects.length-1))];
  }

  getFakeData(type, list) {
    switch (type) {
      case 2:
        return faker.lorem.word();
      case 3:
        return this.getRandomArrayElement(list).subject;
      case 4:
        return faker.random.boolean();
      case 6:
        return faker.date.future();
      case 9:
        return faker.lorem.word();
      default:
        return faker.lorem.word();
    }
  };

  generateEntry(list) {
    const config = [
      {
        name: 'Description', prob: 1.0, type: 2, amount: [1, 2],
      },
      {
        name: 'End', prob: 0.5, type: 6, amount: [1, 2],
      },
      {
        name: 'ExternalInitiative', prob: 1.0, type: 4, amount: [1, 2],
      },
      {
        name: 'FieldOfAction', prob: 1.0, type: 2, amount: [1, 2],
      },
      {
        name: 'Format', prob: 1.0, type: 2, amount: [1, 2],
      },
      {
        name: 'Goal', prob: 1.0, type: 2, amount: [1, 2],
      },
      {
        name: 'HasConnectionTo', prob: 0.8, type: 1, amount: [1, 1],
      },
      {
        name: 'HasCooperationPartner', prob: 0.3, type: 2, amount: [1, 2],
      },
      {
        name: 'HasInhouseproject', prob: 0.5, type: 2, amount: [1, 2],
      },
      {
        name: 'HasProject', prob: 0.6, type: 3, amount: [1, 1],
      },
      {
        name: 'HasSponsor', prob: 1.0, type: 2, amount: [1, 2],
      },
      {
        name: 'HasSubjectArea', prob: 0.9, type: 2, amount: [1, 2],
      },
      {
        name: 'HasThesisproject', prob: 0.8, type: 2, amount: [1, 5],
      },
      {
        name: 'SocialGoals', prob: 0.3, type: 2, amount: [1, 4],
      },
      {
        name: 'Start', prob: 1.0, type: 6, amount: [1, 2],
      },
      {
        name: 'TargetGroup', prob: 0.3, type: 2, amount: [1, 2],
      },
      {
        name: '_INST', prob: 1.0, type: 9, amount: [1, 2],
      },
      {
        name: '_MDAT', prob: 1.0, type: 6, amount: [1, 2],
      },
      {
        name: '_SKEY', prob: 1.0, type: 2, amount: [1, 2],
      },
    ];

    /////// LO AND BEHOLD! THIS IS TERRIBLE CODE!!!

    return () => ({
      query: {
        subject: faker.lorem.words(),
        data: config.map((entry) => {
          if (this.coinToss(entry.prob)) {
            return {
              property: entry.name,
              dataitem: [...Array(this.getRandomInt(entry.amount)).keys()].map(field => ({
                type: entry.type,
                item: this.getFakeData(entry.type, list),
              })),
            };
          }
        }).filter(entry => entry !== undefined),
        serializer: 'SMW\\Serializers\\SemanticDataSerializer',
        version: 0.1,
      },
    });
  };

  async generateFakeWTAs() {
    let projects = (await this.projects);
    let fakewtas = [...Array(this.getRandomInt([90, 100])).keys()].map(this.generateEntry(projects));
    return fakewtas.map( entry => {
      let connectedProject = entry.query.data.find(attribute => {return attribute.property === 'HasProject'});
      if(connectedProject !== undefined){
        let keywords = projects.find(project => {return project.subject === connectedProject.dataitem[0].item}).HatSchlagwort;
        if (keywords !== undefined) {
          entry.query.data.push({
            property: 'HasKeywords',
            dataitem: keywords.map(keyword => {return {type: '1', item: keyword}})
          });
        }
      }
      return entry
    })
  }
}

module.exports = WTAFaker;
