const faker = require('faker');
const fs = require('fs');

const generate = prob => Math.random() < prob;

const getRandomInt = ([min, max]) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const 

const getFakeData = (type, ids) => {
  switch (type) {
    case 1:
      return ids[Math.floor(Math.random() * ids.length)]
    case 2:
      return faker.lorem.word();
    case 3:
      return faker.random.number();
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

const generateEntry = (ids) => {
  const config = [
    {
      name: 'Description', prob: 1.0, type: 2, amount: [1, 2],
    },
    {
      name: 'End', prob: 0.5, type: 6, amount: [1, 2],
    },
    {
      name: 'ExternalInitiative', prob: 0.6, type: 4, amount: [1, 2],
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
      name: 'HasProject', prob: 0.6, type: 3, amount: [1, 2],
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
        if (generate(entry.prob)) {
          return {
            property: entry.name,
            dataitem: [...Array(getRandomInt(entry.amount)).keys()].map(field => ({
              type: entry.type,
              item: getFakeData(entry.type, ids),
            })),
          };
        }
      }).filter(entry => entry !== undefined),
      serializer: 'SMW\\Serializers\\SemanticDataSerializer',
      version: 0.1,
    },
  });
};

console.log();
fs.writeFile('../data/WTA.json', JSON.stringify([...Array(getRandomInt([10, 50])).keys()].map(generateEntry()), null, 2), (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('File has been created');
});
