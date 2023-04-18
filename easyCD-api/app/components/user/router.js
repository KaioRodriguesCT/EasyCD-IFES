const express = require('express');

exports = module.exports = function initRouter(UserController, Policies) {
  const app = this;
  const router = express.Router();

  // Routes

  // User authentication
  router.post('/auth', UserController.auth);

  // User re-authentication
  router.post('/re-auth', UserController.refreshAuth);

  // Create an user
  router.post('/', UserController.create);

  // Update an user
  router.put(
    '/:userId',
    Policies.JWTLogged,
    UserController.update,
  );

  // Remove an user
  router.delete(
    '/:userId',
    Policies.JWTAdmin,
    UserController.remove,
  );

  // Definition
  app.use('/api/users', router);
};

exports['@singleton'] = true;
exports['@require'] = ['components/user/controller', 'lib/policies'];
