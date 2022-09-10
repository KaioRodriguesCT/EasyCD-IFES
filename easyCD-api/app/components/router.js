/* eslint-disable no-unused-vars */
/* eslint-disable no-multi-assign */
const bootable = require('bootable');
const _ = require('lodash');
const path = require('path');

exports = module.exports = function initRoutes() {
  const app = this;
  // Here shoulde have the path for all index routes files
  const components = [
    'user',
    'course',
    'curriculum-gride',
    'subject',
    'classroom',
    'enrollment',
    'complementary-activity-type',
    'complementary-activity',
    'solicitation-type',
    'solicitation',
  ];

  _.each(components, (component) => {
    const routerPath = path.resolve('./app', 'components', component, 'router');
    app.phase(bootable.di.routes(routerPath));
  });

  app.phase(() => {
    app.all('*', (req, res, next) => {
      const error = new Error('404 – There is no such resource');
      error.status = 404;
      next(error);
    });
  });
};

exports['@singleton'] = true;
