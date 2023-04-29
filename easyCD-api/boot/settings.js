exports = module.exports = function initSettings() {
  const config = {
    defaults: {
      app: {
        port: 8080,
      },
      accessToken: {
        lifeTime: '30m',
        secret: process.env.ACCESS_TOKEN_SECRET,
      },
      refreshToken: {
        lifeTime: '60m',
        secret: process.env.REFRESH_TOKEN_SECRET,
      },
      email: {
        user: 'easycd.notification@gmail.com',
        password: 'rbkezjkkhfgdjyml',
      },
    },
    development: {
      database: {
        url: 'mongo_db',
        port: 27017,
        db: 'easyCD',
      },
    },
    test: {
      database: {
        url: 'mongo_db',
        port: 27017,
        db: 'easyCD-test',
      },
    },
  };

  return { ...config.defaults, ...config[process.env.ENVIRONMENT || 'development'] };
};

exports['@singleton'] = true;
