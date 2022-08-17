const mongooseDelete = require('mongoose-delete');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

exports = module.exports = function initModel(mongo) {
  const Course = new mongo.Schema(
    {
      name: {
        type: String,
        required: true,
        index: true,
      },
      description: {
        type: String,
      },
      coordinator: {
        type: ObjectId,
        ref: 'Person',
        required: true,
        index: true,
      },
    },
    {
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
    },
  );

  // Plugins
  Course.plugin(
    mongooseDelete,
    {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: true,
    },
  );

  return mongo.model('Course', Course);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
