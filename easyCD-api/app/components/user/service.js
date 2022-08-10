const _ = require('lodash');
const async = require('async');
const { default: mongoose } = require('mongoose');

exports = module.exports = function initService(UserRepository, PersonService, Utils) {
  return {
    find,
    create,
    update,
    remove,
    list,
  };

  async function find() {
    return UserRepository.find();
  }

  async function create(user) {
    return async.auto({
      session: async () => mongoose.startSession(),
      transaction: ['session', async ({ session }) => {
        session.startTransaction();
        await async.auto({
          person: async () => PersonService.create(user),
          user: ['person', async ({ person }) => {
            const initialFields = [
              'username',
              'password',
              'role',
              'person',
              'siape',
              'registration',
            ];
            const newUser = _.pick(user, initialFields);

            if (_.isEqual(newUser.role, 'teacher') && _.isNil(newUser.siape)) {
              Utils.throwError('Error creating user. Required Field: siape is required for Teachers');
            }
            if (_.isEqual(newUser.role, 'student') && _.isNil(newUser.registration)) {
              Utils.throwError('Error creating user. Required Field: Registration is required for Students');
            }

            // Setting the person
            newUser.person = _.get(person, '_id');

            return UserRepository.create(newUser);
          }],
        });
        session.commitTransaction();
      }],
      endSession: ['session', 'transaction', async ({ session }) => session.endSession()],
    });
  }

  async function update(user) {
    if (_.isNil(user)) {
      Utils.throwError('Error updating user. User not sent', 400);
    }
    if (_.isNil(user._id)) {
      Utils.throwError('Error updating user. User ID not sent', 400);
    }
    return UserRepository.update(user);
  }

  async function remove(userId) {
    if (_.isNil(userId)) {
      Utils.throwError('Error updating user. User ID not sent', 400);
    }
    return async.auto({
      session: async () => mongoose.startSession(),
      transaction: ['session', async ({ session }) => {
        session.startTransaction();
        await async.auto({
          user: async () => {
            const user = await UserRepository.findById(userId);
            if (!user) {
              Utils.throwError('Error deleting User. User not found', 404);
            }
            return user;
          },
          removePerson: ['user', async ({ user }) => PersonService.remove({ _id: user.person })],
          removeUser: ['user', 'removePerson', async () => UserRepository.removeById(userId)],
        });
        session.commitTransaction();
      }],
      endSession: ['session', 'transaction', async ({ session }) => session.endSession()],

    });
  }

  async function list() {
    return UserRepository.find();
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/user/repository',
  'components/person/service',
  'lib/utils',
];
