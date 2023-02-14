const express = require('express');

exports = module.exports = function initRouter(PeopleController, Policies) {
  const app = this;
  const router = express.Router();

  // Routes

  // User authentication
  router.get('/', Policies.JWTLogged, PeopleController.list);

  // User authentication
  router.get('/slim', Policies.JWTLogged, PeopleController.listSlim);

  // Definition
  app.use('/api/people', router);
};

exports['@singleton'] = true;
exports['@require'] = ['components/person/controller', 'lib/policies'];
