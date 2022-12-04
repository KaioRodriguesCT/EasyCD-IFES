const http = require('http');

exports = module.exports = function initServer(settings) {
  const app = this;
  app.phase(() => {
    const { app: appSettings } = settings;
    console.log(`Starting application, listening port ${appSettings.port}`);
    const server = http.createServer(app);
    server.listen(appSettings.port, () => {
      console.log(`Server running on port ${appSettings.port}`);
    });
  });
};

exports['@singleton'] = true;
exports['@require'] = ['settings'];
