const mongoose = require('mongoose');
const _ = require('lodash');

exports = module.exports = function initMongo(settings) {
  const _connection = createConnection();
  return _.extend(_connection, { createConnection });

  function createConnection() {
    const { database } = settings;
    let connection;
    const mongoUri = `mongodb://${database.url}:${database.port}/${database.db}`;
    console.log('Trying to connect on', mongoUri);
    connection = mongoose.createConnection(mongoUri, {
      socketTimeoutMS: 120000,
      connectTimeoutMS: 120000,
      heartbeatFrequencyMS: 20000,
      serverSelectionTimeoutMS: 60000,
    });

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
