const bcryptjs = require('bcryptjs');
const _ = require('lodash');
const async = require('async');

exports = module.exports = function initService(
  mongo,
  UserRepository,
  PersonService,
  Utils,
) {
  return {
    find,
    create,
    update,
    remove,
  };

  async function find() {
    return UserRepository.find();
  }

  async function create(user) {
    // Start the session inside the connection
    const session = await mongo.startSession();
    // Start a transaction
    session.startTransaction();
    const { newUser } = await async.auto({
      person: async () => PersonService.create(user),
      newUser: ['person', async ({ person }) => {
        const initialFields = [
          'username',
          'role',
          'person',
          'siape',
          'registration',
        ];
        const newUser = _.pick(user, initialFields);

        // Encrypting the password
        newUser.password = await bcryptjs.hash(_.get(user, 'password'), 10);

        // Validating the roles and required fields for those roles
        if (_.isEqual(newUser.role, 'teacher') && _.isNil(newUser.siape)) {
          Utils.throwError('Error creating user. Required Field: siape is required for Teachers');
        }
        if (_.isEqual(newUser.role, 'student') && _.isNil(newUser.registration)) {
          Utils.throwError('Error creating user. Required Field: Registration is required for Students');
        }

        // Setting  the person
        newUser.person = _.get(person, '_id');

        return UserRepository.create(newUser);
      }],
    });
    // Commit the transaction
    session.commitTransaction();
    // End the session inside the connection
    session.endSession();
    return newUser;
  }

  async function update(user) {
    if (_.isNil(user)) {
      Utils.throwError('Error updating user. User not sent', 400);
    }
    if (_.isNil(user._id)) {
      Utils.throwError('Error updating user. User ID not sent', 400);
    }
    const { updatedUser } = await async.auto({
      oldUser: async () => {
        const user = await UserRepository
          .findById(user._id);
        if (!user) {
          Utils.throwError('Error updating user. User not found', 404);
        }
        return user;
      },
      updatedUser: ['oldUser', async ({ oldUser }) => {
        const updatableFields = {
          username: { allowEmpty: false },
          password: { allowEmpty: false },
          role: { allowEmpty: false },
        };

        _.forOwn(updatableFields, (value, field) => {
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isNil(user[field]) && !allowEmpty) {
            return;
          }
          if (_.isEqual(user[field], oldUser[field])) {
            return;
          }
          oldUser[field] = user[field];
        });
        return UserRepository.update(oldUser);
      }],
    });
    return updatedUser;
  }

  async function remove(user) {
    if (!user) {
      Utils.throwError('Error removing user. User not sent', 400);
    }
    if (_.isNil(user._id)) {
      Utils.throwError('Error removing user. User ID not sent', 400);
    }
    const session = await mongo.startSession();
    session.startTransaction();
    await async.auto({
      removePerson: ['user', async ({ user }) => PersonService.remove({ _id: user.person })],
      removeUser: ['user', 'removePerson', async () => UserRepository.removeById(user._id)],
    });
    session.commitTransaction();
    session.endSession();
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'lib/mongo',
  'components/user/repository',
  'components/person/service',
  'lib/utils',
];
