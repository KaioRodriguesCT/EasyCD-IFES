const express = require('express');

exports = module.exports = function initRouter(UserController) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create an user
  router.post('/', UserController.create);

  // Update an user
  router.put('/:userId', UserController.update);

  // Get an user
  router.get('/:userId', UserController.findById);

  // Get list of users
  router.get('/', UserController.findList);

  // Definition
  app.use('/api/user', router);
};

exports['@singleton'] = true;
exports['@require'] = ['components/user/controller'];
