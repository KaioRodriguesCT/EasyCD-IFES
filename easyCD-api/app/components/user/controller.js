const async = require('async');

exports = module.exports = function initController(
  UserService,
) {
  return {
    create,
    update,
    remove,
    auth,
    refreshAuth,
  };

  async function create(req, res, next) {
    try {
      const user = req.body;
      return await async.auto({
        createdUser: async () => UserService.create(user),
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
        sendResponse: ['authUser', async ({ authUser }) => res.json({
          message: 'User authenticated successfully',
          user: authUser,
        }),
        ],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function refreshAuth(req, res, next) {
    try {
      const { body: { refreshToken } } = req;
      const refreshedUser = await UserService.refreshAuth({ refreshToken });
      return res.json({
        message: 'User re-authenticated successfully',
        user: refreshedUser,
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
