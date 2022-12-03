const express = require('express');

exports = module.exports = function initRouter(
  HelloWorld,
) {
  const app = this;
  const router = express.Router();

  router.get(
    '/',
    HelloWorld.helloWorld,
  );

  app.use('/api/hello-world', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/hello-world/hello-world',
];
