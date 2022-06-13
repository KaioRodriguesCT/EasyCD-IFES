const express = require('express');

exports = module.exports = function initUserRouter(User) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create an user
  router.post('/', User.create);

  // Delete an user
  // Comented because idk if we will delete users.
  // router.delete('/:userId', User.remove);

  // Update an user
  router.put('/:userId', User.update);

  // Get an user
  router.get('/:userId', User.findById);

  // Get list of users

  router.get('/', User.findList);

  // Definition
  app.use('/api/user');
};

exports['@singleton'] = true;
exports['@require'] = ['controllers/user'];
