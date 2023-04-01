const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

exports = module.exports = function initMiddlewares() {
  const app = this;
  app.phase(() => {
    app.use(bodyParser.urlencoded({
      extended: true,
      parameterLimit: 1000000,
      limit: '500mb',
    }));
    app.use(bodyParser.json({ limit: '500mb' }));
    app.use(cookieParser());
  });
};

exports['@singleton'] = true;
