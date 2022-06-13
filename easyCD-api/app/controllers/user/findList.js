const _ = require('lodash');

exports = module.exports = function userFindList(User, Utils) {
  return findList;

  async function findList(req, res, next) {
    try {
      const filters = _.get(req.query, 'filters');
      const pipeline = [];
      pipeline.push(buildFiltersPipeline(filters));
      pipeline.push(buildProjectPipeline());

      const users = await User.aggregate(_.flatMap(pipeline)).exec();
      if (!users) {
        return Utils.throwError('Something goes wrong using findList for user', 400);
      }
      return res.json({ users: _.flatMap(users) });
    } catch (e) {
      return next(e);
    }
  }

  function buildFiltersPipeline(filters) {
    const pipeline = [];
    pipeline.push({ $match: { deleted: { $ne: true } } });
    if (!filters) {
      return pipeline;
    }
    // Building filters
    return pipeline;
  }

  function buildProjectPipeline() {
    return {
      username: 1,
      role: 1,
      email: 1,
      name: 1,
      surname: 1,
      fullName: 1,
      birthDate: 1,
      phoneNumber: 1,
      secondaryPhoneNumber: 1,
      studentRegistration: 1,
    };
  }
};

exports['@singleton'] = true;
exports['@require'] = ['models/user', 'lib/utils'];
