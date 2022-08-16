const express = require('express');

exports = module.exports = function initRouter(UserController, Policies) {
  const app = this;
  const router = express.Router();

  // Routes

  // User authentication
  router.post('/auth', UserController.auth);

  // Create an user
  router.post('/', UserController.create);

  // Update an user
  router.put(
    '/:userId',
    Policies.JWTAdmin,
    UserController.update,
  );

  // Remove an user
  router.delete(
    '/:userId',
    Policies.JWTAdmin,
    UserController.remove,
  );

  // Get list of users
  router.get(
    '/list',
    Policies.JWTAdmin,
    UserController.find,
  );

  // Definition
  app.use('/api/user', router);
};

exports['@singleton'] = true;
exports['@require'] = ['components/user/controller', 'lib/policies'];
