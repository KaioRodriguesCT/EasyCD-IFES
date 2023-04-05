const mongooseDelete = require('mongoose-delete');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
exports = module.exports = function initModel(mongo) {
  const ComplementaryActivity = new mongo.Schema(
    {
      complementaryActivityType: {
        type: ObjectId,
        ref: 'ComplementaryActivityType',
        required: true,
        index: true,
      },
      course: {
        type: ObjectId,
        ref: 'Course',
        required: true,
        index: true,
      },
      student: {
        type: ObjectId,
        ref: 'Student',
        required: true,
        index: true,
      },
      status: {
        type: String,
        required: true,
        index: true,
        enum: ['Accepted', 'Rejected'],
      },
      statusJustification: {
        type: String,
      },
      evidence: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
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
  ComplementaryActivity.plugin(mongooseDelete, {
    deletedBy: true,
    deletedAt: true,
    overrideMethods: true,
  });

  return mongo.model('ComplementaryActivity', ComplementaryActivity);
};

exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
