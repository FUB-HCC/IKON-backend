const faker = require('faker');

class WTAFaker{

  constructor(projects){
    this.projects = projects;
  }

  coinToss(prob) {
    return Math.random() < prob;
  }

  getRandomInt([min, max]) {
    const min = Math.ceil(min);
    const max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  };

  getRandomArrayElement(projects) {
    return projects[Math.floor(Math.random()*projects.length)];
  }

  getFakeData(type) {
    switch (type) {
      case 2:
        return faker.lorem.word();
      case 3:
        return getRandomArrayElement(this.projects).id;
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

  generateEntry() {
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

    return () => ({
      query: {
        subject: faker.lorem.words(),
        data: config.map((entry) => {
          if (this.coinToss(entry.prob)) {
            return {
              property: entry.name,
              dataitem: [...Array(this.getRandomInt(entry.amount)).keys()].map(field => ({
                type: entry.type,
                item: this.getFakeData(entry.type, ids),
              })),
            };
          }
        }).filter(entry => entry !== undefined),
        serializer: 'SMW\\Serializers\\SemanticDataSerializer',
        version: 0.1,
      },
    });
  };

  generateFakeWTAs() {
    return [...Array(this.getRandomInt([90, 100])).keys()].map(this.generateEntry())
  }
}

module.exports = WTAFaker;
