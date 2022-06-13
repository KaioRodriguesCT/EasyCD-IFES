const mongoose = require('mongoose');

exports = module.exports = function initMongoDB() {
  const app = this;
  app.phase(() => {
    const url = 'localhost';
    const port = 27017;
    const db = 'easyCD';

    mongoose.connect(`mongodb://${url}:${port}/${db}`);

    const { connection } = mongoose;
    connection.on('error', console.error.bind(console, 'Connection Error:'));
    connection.once('open', () => {
      console.log(`Connected to MongoDB. PORT: ${port}, DB: ${db}`);
    });
    return connection;
  });
};

exports['@singleton'] = true;
