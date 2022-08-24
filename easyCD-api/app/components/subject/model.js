const mongooseDelete = require('mongoose-delete');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
exports = module.exports = function initModel(mongo) {
  const Subject = new mongo.Schema(
    {
      name: {
        type: String,
        required: true,
        index: true,
      },
      description: {
        type: String,
      },
      qtyHours: {
        type: Number,
        required: true,
        index: true,
      },
      externalCod: {
        type: String,
        index: true,
      },
      curriculumGride: {
        type: ObjectId,
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
  Subject.plugin(
    mongooseDelete,
    {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: true,
    },
  );

  return mongo.model(Subject, 'Subject');
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
