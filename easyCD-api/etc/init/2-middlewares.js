const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

exports = module.exports = function initMiddlewares() {
  const app = this;
  app.phase(() => {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());
  });
};

exports['@singleton'] = true;
