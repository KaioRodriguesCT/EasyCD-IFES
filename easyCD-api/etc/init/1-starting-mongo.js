const mongoose = require('mongoose');

exports = module.exports = function initMongoDB(settings) {
  const app = this;
  app.phase(() => {
    const { database } = settings;
    mongoose.connect(`mongodb://${database.url}:${database.port}/${database.db}`);

    const { connection } = mongoose;
    connection.on('error', console.error.bind(console, 'Connection Error:'));
    connection.once('open', () => {
      console.log(`Connected to MongoDB. PORT: ${database.port}, DB: ${database.db}`);
    });
    return connection;
  });
};

exports['@singleton'] = true;
exports['@require'] = ['settings'];
