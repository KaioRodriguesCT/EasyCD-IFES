const mongooseDelete = require('mongoose-delete');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
exports = module.exports = function initModel(mongo) {
  const Solicitation = new mongo.Schema({

  });

  // Plugins
  Solicitation.plugin(
    mongooseDelete,
    {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: true,
    },
  );

  return mongo.model('Solicitation', Solicitation);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
