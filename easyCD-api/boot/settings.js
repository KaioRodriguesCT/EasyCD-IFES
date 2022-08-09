exports = module.exports = function initSettings() {
  const config = {
    development: {
      database: {
        url: 'localhost',
        port: 27017,
        db: 'easyCD',
      },
      app: {
        port: 3000,
      },
    },
  };
  // Returning development for now
  return config.development;
};

exports['@singleton'] = true;
