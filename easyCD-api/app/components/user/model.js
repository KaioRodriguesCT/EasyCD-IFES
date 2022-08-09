const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { ObjectId } = mongoose.Types;
exports = module.exports = function initModel() {
  const User = new mongoose.Schema(
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
        enum: ['student', 'teacher'],
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
    },
    {
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
  );

  // Plugins
  User.plugin(
    mongooseDelete,
    { deletedBy: true, deletedAt: true },
    { overrideMethods: 'all' },
  );

  // Keep this always on the end
  return mongoose.model('User', User);
};
exports['@singleton'] = true;
