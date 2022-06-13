/* eslint-disable no-param-reassign */
const _ = require('lodash');
const async = require('async');

exports = module.exports = function userUpdate(User, Utils) {
  return update;

  async function update(req, res, next) {
    try {
      // Initial variables
      const userId = _.get(req.param, 'userId') || null;
      const newUser = _.get(req.body, 'newUser') || null;
      if (!userId) {
        return Utils.throwError('User ID was not send', 400);
      }
      if (!newUser) {
        return Utils.throwError('User was not send', 400);
      }
      // Update process
      return await async.auto({
        oldUser: async () => {
          const oldUser = await User.findById(userId).exec();
          if (!oldUser) {
            return Utils.throwError('User not found', 404);
          }
          return oldUser;
        },
        updatedUser: ['oldUser', async ({ oldUser }) => {
          // Validating the model
          const userValidation = User.modelValidation(newUser);
          if (!_.get(userValidation, 'isValid')) {
            return Utils.throwError(_.get(userValidation, 'message'), 400);
          }
          const userFields = [
            'username',
            'password',
            'role',
            'email',
            'name',
            'surname',
            'fullName',
            'birthDate',
            'phoneNumber',
            'secondaryPhoneNumber',
          ];
          _.each(userFields, (field) => {
            if (newUser[field] !== oldUser[field]) {
              oldUser[field] = newUser[field];
            }
          });
          return oldUser.save();
        }],
        sendResponse: ['updatedUser', async ({ updatedUser }) => res.json({ updatedUser })],
      });
    } catch (e) {
      return next(e);
    }
  }
};

exports['@singleton'] = true;
exports['@require'] = ['models/user', 'lib/utils'];
