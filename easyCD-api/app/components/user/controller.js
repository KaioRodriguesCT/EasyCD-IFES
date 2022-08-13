const async = require('async');

exports = module.exports = function initController(UserService) {
  return {
    create,
    update,
    remove,
    find,
  };

  async function find(req, res, next) {
    try {
      return res.json({ users: await UserService.find() });
    } catch (e) {
      return next(e);
    }
  }

  async function create(req, res, next) {
    try {
      return await async.auto({
        createUser: async () => UserService.create(req.body),
        sendResponse: ['createUser', async () => res.json({
          message: 'User created successfully',
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
        updatedUser: async () => UserService.update({ ...user, _id: userId }),
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
          message: 'User removed successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }
};

exports['@singleton'] = true;
exports['@require'] = ['components/user/service'];
