const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { ObjectId } = mongoose.Types;

exports = module.exports = function initModel(mongo) {
  const User = new mongo.Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },
      password: {
        type: String,
        required: true,
        index: true,
      },
      role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        required: true,
        index: true,
        default: 'student',
      },
      person: {
        type: ObjectId,
        ref: 'Person',
        required: true,
        index: true,
      },
      siape: {
        // Only for Teachers
        type: Number,
      },
      registration: {
        // Only for Students
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
  User.plugin(
    mongooseDelete,
    {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: true,
    },
  );

  // Keep this always on the end
  return mongo.model('User', User);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
