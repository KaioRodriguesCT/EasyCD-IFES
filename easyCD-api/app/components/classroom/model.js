const mongooseDelete = require('mongoose-delete');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
exports = module.exports = function initModel(mongo) {
  const Classroom = new mongo.Schema(
    {
      name: {
        type: String,
        index: true,
      },
      subject: {
        type: ObjectId,
        ref: 'Subject',
        required: true,
        index: true,
      },
      semester: {
        type: String, // Format: Year/ 1 or 2. Ex: 2022/1,
        required: true,
        index: true,
      },
      enrollmentsLimit: {
        type: Number,
        index: true,
      },
      allowExceedLimit: {
        type: Boolean,
        required: true,
        default: false,
      },
      enrollments: {
        type: [ObjectId],
        ref: 'Enrollment',
      },
      classTimes: {
        type: [{
          day: {
            type: Number,
            required: true,
          }, // Week day
          start: {
            type: String,
            required: true,
          }, // HH:mm
          end: {
            type: String,
            required: true,
          }, // HH:mm
        }],
      },
      teacher: {
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
  Classroom.plugin(
    mongooseDelete,
    {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: true,
    },
  );

  return mongo.model('Classroom', Classroom);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
