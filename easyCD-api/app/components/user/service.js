const _ = require('lodash');
const async = require('async');

exports = module.exports = function initService(UserRepo) {
  return {
    create,
  };

  async function createUser(user) {
    return async.auto({

    });
  }
};
exports['@singleton'] = true;
exports['@require'] = ['components/user/repository'];
