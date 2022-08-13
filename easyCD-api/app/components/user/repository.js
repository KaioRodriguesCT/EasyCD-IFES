const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(UserModel, Utils) {
  return {
    create,
    update,
    removeById,
    find,
    findById,
  };

  async function findById(_id) {
    return UserModel
      .findById(_id)
      .lean()
      .exec();
  }

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
      oldUser: async () => UserModel
        .findById(newUser._id)
        .exec(),
      updatedUser: ['oldUser', async ({ oldUser }) => {
        _.forOwn(newUser, (value, field) => {
          oldUser[field] = value;
        });
        return oldUser.save();
      }],
    });
    return updatedUser;
  }

  async function removeById(userId) {
    return async.auto({
      user: async () => {
        const user = await UserModel
          .findById(userId)
          .exec();
        if (!user) {
          Utils.throwError('Error removing user. User not found', 404);
        }
        return user;
      },
      deletedUser: ['user', async ({ user }) => user.delete()],
    });
  }
};
exports['@singleton'] = true;
exports['@require'] = ['components/user/model', 'lib/utils'];
