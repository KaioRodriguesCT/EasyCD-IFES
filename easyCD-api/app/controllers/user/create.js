const _ = require('lodash');
const bcryptjs = require('bcryptjs');

exports = module.exports = function userCreate(User, Utils) {
  return create;

  async function create(req, res, next) {
    try {
      const user = _.get(req.body, 'user');
      if (!user) {
        return Utils.throwError('User not sent', 400);
      }
      const userValidation = User.modelValidation(user);
      if (!_.get(userValidation, 'isValid')) {
        return Utils.throwError(_.get(userValidation, 'message'), 400);
      }
      const newUser = new User(user);
      newUser.password = await bcryptjs.hash(_.get(user, 'password'), 10);
      newUser.save();
      return res.json({ newUser });
    } catch (e) {
      return next(e);
    }
  }
};

exports['@singleton'] = true;
exports['@require'] = ['models/user', 'lib/utils'];
