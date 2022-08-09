exports = module.exports = function initServer(settings) {
  const app = this;
  const { app: appSettings } = settings;
  console.log(`Starting application, listening port ${appSettings.port}`);
  app.listen(appSettings.port);
};

exports['@singleton'] = true;
exports['@require'] = ['settings'];
