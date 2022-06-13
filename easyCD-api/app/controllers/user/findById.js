const _ = require('lodash');

exports = module.exports = function userFind(User, Utils) {
  return findById;

  async function findById(req, res, next) {
    try {
      const userId = _.get(req.param, 'userId');
      if (!userId) {
        return Utils.throwError('User ID not sent', 400);
      }
      const user = await User.findById(userId).exec();
      if (!user) {
        return Utils.throwError('User not found', 400);
      }
      return res.json({ user });
    } catch (e) {
      return next(e);
    }
  }
};

exports['@singleton'] = true;
exports['@require'] = ['models/user', 'lib/utils'];
