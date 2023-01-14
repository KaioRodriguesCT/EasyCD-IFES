// # security

const apiRouteRegexp = /^(\/api\/).*$/;

module.exports = function initSecurity() {
  const app = this;

  app.phase(() => {
    // allow CORS for the API route
    const corsHeaders = 'Authentication, Origin, X-Requested-With, Content-Type, Accept, CH-API-KEY, apikey';
    const corsMethods = 'GET,HEAD,PUT,PATCH,POST,DELETE';

    app.options(apiRouteRegexp, (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', corsHeaders);
      res.setHeader('Access-Control-Allow-Methods', corsMethods);
      res.setHeader('Access-Control-Max-Age', 20 * 24 * 60 * 60);

      res.statusCode = 200;
      res.setHeader('Content-Length', '0');
      res.send(corsMethods);
    });

    app.all(apiRouteRegexp, (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', corsHeaders);
      return next();
    });
  });
};
