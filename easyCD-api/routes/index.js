/* eslint-disable no-unused-vars */
/* eslint-disable no-multi-assign */
const bootable = require('bootable');
const _ = require('lodash');
const path = require('path');

exports = module.exports = function initRoutes(IoC) {
  const app = this;
  // Here shoulde have the path for all index routes files
  const routes = [
  ];

  _.each(routes, (route) => {
    const routerPath = path.resolve('./routes', route);
    app.phase(bootable.di.routes(routerPath));
  });
};

exports['@singleton'] = true;
exports['@require'] = ['!container'];
