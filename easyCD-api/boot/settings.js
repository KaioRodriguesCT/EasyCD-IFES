exports = module.exports = function initSettings() {
  const config = {
    defaults: {
      app: {
        port: 8080,
      },
      token: {
        lifeTime: 1 * 60 * 60 * 1000,
        mainToken: '2606560290b99e4caf8fe4af1ccd4e3043f25976adec75eba6ed09333ba85fdb9bd635808043560edca36b7ad9a5968182f217a6550e1eab86faba1f82c09601',
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
