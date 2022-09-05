const mongooseDelete = require('mongoose-delete');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
exports = module.exports = function initModel(mongo) {
  const Enrollment = new mongo.Schema(
    {
      classroom: {
        type: ObjectId,
        ref: 'Classroom',
        required: true,
        index: true,
      },
      student: {
        type: ObjectId,
        ref: 'Person',
        required: true,
        index: true,
      },
      status: {
        type: String,
        required: true,
        default: 'In Progress',
        enum: ['Canceled', 'In Progress', 'Approved', 'Repproved'],
        index: true,
      },
      observation: {
        type: String,
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
  Enrollment.plugin(
    mongooseDelete,
    {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: true,
    },
  );

  return mongo.model('Enrollment', Enrollment);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
