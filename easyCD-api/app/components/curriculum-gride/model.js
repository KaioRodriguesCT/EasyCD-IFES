const mongooseDelete = require('mongoose-delete');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

exports = module.exports = function initModel(mongo) {
  const CurriculumGride = new mongo.Schema(
    {
      name: {
        type: String,
        required: true,
        index: true,
      },
      dtStart: {
        type: String, // YYYY-MM-DD
        required: true,
        index: true,
      },
      dtEnd: {
        type: String, // YYYY-MM-DD,
        required: true,
        index: true,
      },
      isActive: {
        type: Boolean,
        index: true,
        default: true,
      },
      course: {
        type: ObjectId,
        ref: 'Course',
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
  CurriculumGride.plugin(
    mongooseDelete,
    {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: true,
    },
  );

  return mongo.model(CurriculumGride, 'CurriculumGride');
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
