const bcryptjs = require('bcryptjs');
const _ = require('lodash');
const async = require('async');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const defaultErrorCreating = 'Error creating User';
const defaultErrorUpdating = 'Error updating User';
const defaultErrorRemoving = 'Error removing User';

const authenticationFailedMessage = 'User authentication failed';
exports = module.exports = function initService(
  mongo,
  Utils,
  UserRepository,
  PersonService,
  settings,
) {
  return {
    getByPerson,
    getByUsername,
    findById,
    create,
    update,
    remove,
    auth,
  };

  async function findById({ _id }) {
    return UserRepository.findById({ _id });
  }

  async function getByUsername(username) {
    return UserRepository.findOne({ filters: { username } });
  }

  async function getByPerson(person) {
    return UserRepository.findOne({ filters: { person } });
  }

  async function create(user) {
    const { createdUser } = await async.auto({
      validateRole: async () => checkRoleFields({
        user,
        defaultErrorMessage: defaultErrorCreating,
      }),
      validateUsername: async () => validateUsername({
        user,
        defaultErrorMessage: defaultErrorCreating,
      }),
      person: ['validateRole', 'validateUsername', async () => PersonService.create(user)],
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

        // Setting  the person
        newUser.person = _.get(person, '_id');

        return UserRepository.create(newUser);
      }],
    });
    return _.omit(createdUser, 'password');
  }

  async function update(user) {
    if (_.isNil(user)) {
      Utils.throwError(`${defaultErrorUpdating}. User not sent`, 400);
    }
    if (_.isNil(user._id)) {
      Utils.throwError(`${defaultErrorUpdating}. User ID not sent`, 400);
    }
    const { updatedUser } = await async.auto({
      oldUser: async () => {
        const oldUser = await UserRepository
          .findById(user._id);
        if (!oldUser) {
          Utils.throwError(`${defaultErrorUpdating}. User not found`, 404);
        }
        return oldUser;
      },
      validateRole: ['oldUser', async () => (user.role ? checkRoleFields({
        user,
        defaultErrorMessage: defaultErrorUpdating,
      }) : null)],
      validateUsername: ['oldUser', async () => (user.username ? validateUsername({
        user,
        defaultErrorMessage: defaultErrorUpdating,
      }) : null)],
      updatedUser: ['validateRole', 'validateUsername', 'oldUser', async ({ oldUser }) => {
        const updatableFields = {
          username: { allowEmpty: false },
          password: { allowEmpty: false },
          role: { allowEmpty: false },
          siape: { allowEmpty: false },
          registration: { allowEmpty: false },
        };
        _.forOwn(updatableFields, (value, field) => {
          const currentValue = user[field];
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isUndefined(currentValue)) {
            return;
          }
          if ((_.isNull(currentValue)
          || (!mongoose.isValidObjectId(currentValue) && _.isEmpty(currentValue)))
          && !allowEmpty) {
            return;
          }
          oldUser[field] = currentValue;
        });
        return UserRepository.update(oldUser);
      }],
    });
    return updatedUser;
  }

  async function remove(user) {
    if (!user) {
      Utils.throwError(`${defaultErrorRemoving}. User not sent`, 400);
    }
    if (_.isNil(user._id)) {
      Utils.throwError(`${defaultErrorRemoving}. User ID not sent`, 400);
    }
    await async.auto({
      oldUser: async () => {
        const oldUser = await UserRepository
          .findById({ _id: user._id });
        if (!oldUser) {
          Utils.throwError(`${defaultErrorRemoving}. User not found`, 404);
        }
        return oldUser;
      },
      removePerson: ['oldUser', async ({ oldUser }) => PersonService.remove({ _id: oldUser.person })],
      removeUser: ['oldUser', 'removePerson', async ({ oldUser }) => UserRepository.removeById(oldUser._id)],
    });
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
        const userFound = await getByUsername(validateParams.username);
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

  // Internal Functions
  async function validateUsername({ user, defaultErrorMessage }) {
    const { username } = user;
    const exists = await existsUserWithUsername({ username });
    if (exists) {
      Utils.throwError(`${defaultErrorMessage}. Username is already being used`, 400);
    }
    return true;
  }

  async function existsUserWithUsername({ username }) {
    return UserRepository.exists({ filters: { username } });
  }

  function checkRoleFields({ user, defaultErrorMessage }) {
    if (_.isEqual(user.role, 'student') && !user.registration) {
      Utils.throwError(`${defaultErrorMessage}. Field: Registration is required for Student`, 400);
    }
    if (_.isEqual(user.role, 'teacher') && !user.siape) {
      Utils.throwError(`${defaultErrorMessage}. Field: Siape is required for Teacher`, 400);
    }
    return true;
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
