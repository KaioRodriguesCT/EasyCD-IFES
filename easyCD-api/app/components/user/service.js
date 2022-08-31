const bcryptjs = require('bcryptjs');
const _ = require('lodash');
const async = require('async');
const jwt = require('jsonwebtoken');

const authenticationFailedMessage = 'User authentication failed';
exports = module.exports = function initService(
  mongo,
  Utils,
  UserRepository,
  PersonService,
  settings,
) {
  return {
    findAll,
    findByPerson,
    create,
    update,
    remove,
    auth,
  };

  // Debug purposes
  async function findAll() {
    return UserRepository.findAll();
  }

  async function findByPerson(person) {
    return UserRepository.findByPerson(person);
  }

  async function create(user) {
    // Start the session inside the connection
    const session = await mongo.startSession();
    // Start a transaction
    session.startTransaction();
    try {
      const { createdUser } = await async.auto({
        person: async () => PersonService.create(user),
        createdUser: ['person', async ({ person }) => {
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
      await session.commitTransaction();
      return _.omit(createdUser, 'password');
    } catch (e) {
      console.error(e);
      await session.abortTransaction();
      throw e;
    } finally {
      // End the session inside the connection
      session.endSession();
    }
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
        const oldUser = await UserRepository
          .findById(user._id);
        if (!oldUser) {
          Utils.throwError('Error updating user. User not found', 404);
        }
        return oldUser;
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
    try {
      await async.auto({
        oldUser: async () => {
          const oldUser = await UserRepository
            .findById({ _id: user._id });
          if (!oldUser) {
            Utils.throwError('Error removing user. User not found', 404);
          }
          return oldUser;
        },
        removePerson: ['oldUser', async ({ oldUser }) => PersonService.remove({ _id: oldUser.person })],
        removeUser: ['oldUser', 'removePerson', async ({ oldUser }) => UserRepository.removeById(oldUser._id)],
      });
      await session.commitTransaction();
    } catch (e) {
      console.error(e);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }

  async function auth(user) {
    if (!user) {
      Utils.throwError(`${authenticationFailedMessage}. Error: User not sent`, 400);
    }
    const { userAuth } = await async.auto({
      validateParams: async () => {
        const { username, password } = user;
        if (!username || !password) {
          Utils.throwError(`${authenticationFailedMessage}. Error: Username or Password not sent`, 400);
        }
        return { username, password };
      },
      userFound: ['validateParams', async ({ validateParams }) => {
        const userFound = await UserRepository.findByUsername(validateParams.username);
        if (!userFound) {
          Utils.throwError(`${authenticationFailedMessage}. Error: Username not found`, 404);
        }
        return userFound;
      }],
      userAuth: ['userFound', 'validateParams', async ({ userFound, validateParams }) => {
        const { username, role, password } = userFound;
        const authenticated = await bcryptjs.compare(validateParams.password, password);
        if (!authenticated) {
          Utils.throwError(`${authenticationFailedMessage}. Error: User not authenticated`, 401);
        }
        const token = jwt.sign({
          _id: userFound._id,
          username,
          role,
        }, settings.token.mainToken, {
          expiresIn: settings.token.lifeTime,
        });
        return {
          username,
          role,
          token,
        };
      }],
    });
    return userAuth;
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'lib/mongo',
  'lib/utils',
  'components/user/repository',
  'components/person/service',
  'settings',
];
