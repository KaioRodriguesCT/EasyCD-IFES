const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(UserModel, Utils) {
  return {
    create,
    update,
    removeById,
    findById,
    findOne,
    exists,
  };

  async function findOne({
    filters,
    select,
    sort,
    populate,
  }) {
    return UserModel
      .findOne(filters)
      .populate(populate)
      .select(select)
      .sort(sort)
      .lean()
      .exec();
  }

  async function findById({ _id }) {
    return UserModel
      .findById(_id)
      .lean()
      .exec();
  }

  async function exists({ filters }) {
    return UserModel.exists(filters).exec();
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
    const newUser = await UserModel.create(user);
    return newUser.toJSON();
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
    return updatedUser.toJSON();
  }

  async function removeById(userId) {
    const user = await UserModel
      .findById(userId)
      .exec();
    if (!user) {
      Utils.throwError('Error removing user. User not found', 404);
    }
    return user.delete();
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/user/model',
  'lib/utils',
];
