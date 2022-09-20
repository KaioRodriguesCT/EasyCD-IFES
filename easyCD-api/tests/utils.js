const async = require('async');
const IoC = require('electrolyte');

// Models
const UserService = IoC.create('components/user/service');

exports = module.exports = function initTestUtils(mongo) {
  return {
    cleanDatabase,
    buildDefaultUser,
  };

  async function cleanDatabase() {
    return async.eachSeries(mongo.models, async (model) => model.deleteMany());
  }

  async function buildDefaultUser({ role = 'student', props }) {
    const defaultPerson = {
      name: 'Person',
      surname: '#1',
      email: 'person#1@gmail.com',
      phone: '99999999',
    };
    const defaultUser = {
      username: 'username',
      password: 'password',
      registration: '555',
      role: 'student',
    };
    return UserService.create({
      ...defaultPerson, ...defaultUser, role, ...props,
    });
  }
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
