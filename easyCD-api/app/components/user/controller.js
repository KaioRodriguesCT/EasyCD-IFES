const async = require('async');

exports = module.exports = function initController(
  UserService,
  settings,
  Utils,
) {
  return {
    create,
    update,
    remove,
    auth,
  };

  async function create(req, res, next) {
    try {
      return await async.auto({
        createdUser: async () => UserService.create(req.body),
        sendResponse: ['createdUser', async ({ createdUser }) => res.json({
          message: 'User created successfully',
          user: createdUser,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function update(req, res, next) {
    try {
      const { userId } = req.params;
      const user = req.body;
      return await async.auto({
        updatedUser: async () => UserService.update({
          ...user,
          _id: userId,
        }),
        sendResponse: ['updatedUser', async ({ updatedUser }) => res.json({
          message: 'User updated successfully',
          user: updatedUser,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function remove(req, res, next) {
    try {
      const { userId } = req.params;
      const user = req.body;
      return await async.auto({
        removedUser: async () => UserService.remove({ ...user, _id: userId }),
        sendResponse: ['removedUser', async () => res.json({
          message: 'User deleted successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function auth(req, res, next) {
    try {
      return await async.auto({
        authUser: async () => UserService.auth(req.body),
        sendResponse: ['authUser', async ({ authUser }) => {
          if (!authUser) {
            Utils.throwError('Not authorized', 403);
          }

          const { token, username, role } = authUser;

          res.cookie('JWT', token, {
            httpOnly: true,
            maxAge: settings.token.lifeTime,
          });

          return res.json({
            message: 'User authenticated successfully',
            user: {
              username,
              role,
              token,
            },
          });
        }],
      });
    } catch (e) {
      return next(e);
    }
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/user/service',
  'settings', 'lib/utils',
];
