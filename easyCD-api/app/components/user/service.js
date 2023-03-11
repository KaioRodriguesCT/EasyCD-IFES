const bcryptjs = require('bcryptjs');
const _ = require('lodash');
const async = require('async');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const moment = require('moment');

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
    refreshAuth,
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
    const { createdUser, person: newPerson } = await async.auto({
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
    return { ..._.omit(createdUser, 'password'), person: newPerson };
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
          accessToken: { allowEmpty: true },
          refreshToken: { allowEmpty: true },
        };
        _.forOwn(updatableFields, (value, field) => {
          const currentValue = user[field];
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isUndefined(currentValue)) {
            return;
          }
          if ((_.isNull(currentValue)
          || (!mongoose.isValidObjectId(currentValue) && _.isEmpty(currentValue)))
          && !allowEmpty
          && !_.isBoolean((currentValue))) {
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
        const { password, _id } = userFound;
        const authenticated = await bcryptjs.compare(validateParams.password, password);
        if (!authenticated) {
          Utils.throwError(`${authenticationFailedMessage}. Error: User not authenticated`, 401);
        }
        const accessToken = buildAccessToken(userFound);
        const refreshToken = buildRefreshToken(userFound);
        const updatedUser = await update({ _id, accessToken, refreshToken });
        return _.omit(updatedUser, 'password');
      }],
    });
    return userAuth;
  }

  async function refreshAuth({ refreshToken }) {
    if (!refreshToken) {
      Utils.throwError('Refresh token not sent', 401);
    }

    const tokenUser = jwt.verify(refreshToken, settings.refreshToken.secret, (err, user) => {
      if (err?.expiredAt < moment()) {
        return Utils.throwError('Not authorized', 401);
      }
      return user;
    });

    const user = await UserRepository.findById({ _id: _.get(tokenUser, '_id') });
    if (!user) {
      Utils.throwError('User from token not found', 401);
    }

    const userId = _.get(user, '_id');
    const accessToken = buildAccessToken(user);
    const newRefreshToken = buildRefreshToken(user);
    const updatedUser = await update({ _id: userId, accessToken, refreshToken: newRefreshToken });
    return _.omit(updatedUser, 'password');
  }

  function buildAccessToken(user) {
    return buildUserToken(user, settings.accessToken.secret, settings.accessToken.lifeTime);
  }

  function buildRefreshToken(user) {
    return buildUserToken(user, settings.refreshToken.secret, settings.refreshToken.lifeTime);
  }

  function buildUserToken(user, secret, lifeTime) {
    const userFields = ['username', '_id', 'role'];
    return jwt.sign(_.pick(user, userFields), secret, { expiresIn: lifeTime });
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
