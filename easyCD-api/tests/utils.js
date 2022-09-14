const async = require('async');

exports = module.exports = function initTestUtils(mongo) {
  return {
    cleanDatabase,
  };

  async function cleanDatabase() {
    return async.eachSeries(mongo.models, async (model) => model.deleteMany());
  }
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
