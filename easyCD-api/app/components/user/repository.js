const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(UserModel, Utils) {
  return {
    create,
    update,
    removeById,
    find,
  };

  async function find() {
    return UserModel
      .find()
      .lean()
      .exec();
  }
  async function create(user) {
    const requiredFields = [
      'username',
      'password',
      'person',
    ];

    _.forEach(requiredFields, (field) => {
      if (_.isNil(user[field])) {
        Utils.throwError(`Error creating User. Required Field: ${field}, not sent`, 400);
      }
    });

    return UserModel.create(user);
  }

  async function update(newUser) {
    const { updatedUser } = await async.auto({
      oldUser: async () => {
        const oldUser = await UserModel
          .findById(newUser._id)
          .exec();
        if (_.isNil(oldUser)) {
          Utils.throwError('Error updating User. User not found', 404);
        }
        return oldUser;
      },
      updatedUser: ['oldUser', async ({ oldUser }) => {
        const updatableFields = [
          'username',
          'password',
        ];
        _.forEach(updatableFields, (field) => {
          if (!_.isNil(newUser[field]) && !_.isEqual(newUser[field], oldUser[field])) {
            oldUser[field] = newUser[field];
          }
        });
        return oldUser.save();
      }],
    });
    return updatedUser;
  }

  async function removeById(userId) {
    return async.auto({
      user: async () => UserModel
        .findById(userId)
        .exec(),
      deletedUser: ['user', async ({ user }) => user.delete()],
    });
  }
};
exports['@singleton'] = true;
exports['@require'] = ['components/user/model', 'lib/utils'];
