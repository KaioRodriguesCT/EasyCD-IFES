const mongoose = require('mongoose');
const _ = require('lodash');

exports = module.exports = function initMongo(settings) {
  const connection = createConnection();
  return _.extend(connection, { createConnection });

  function createConnection() {
    const { database } = settings;
    let connection;
    connection = mongoose.createConnection(`mongodb://${database.url}:${database.port}/${database.db}`);

    connection.on('error', console.error.bind(console, 'Connection Error:'));
    connection.once('open', () => {
      console.log(`Connected to MongoDB. PORT: ${database.port}, DB: ${database.db}`);
    });
    connection = _.defaultsDeep(connection, mongoose);

    return connection;
  }
};

exports['@singleton'] = true;
exports['@require'] = ['settings'];
