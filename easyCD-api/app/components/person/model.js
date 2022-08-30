const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const { ObjectId } = mongoose.Types;
exports = module.exports = function initModel(mongo) {
  const Person = new mongo.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      surname: {
        type: String,
        required: true,
      },
      fullName: {
        type: String,
      },
      phone: {
        type: String,
        required: true,
      },
      city: {
        type: String,
      },
      uf: {
        type: String,
      },
      address: {
        type: String,
      },

      // Teacher/Coordinator Fields
      classrooms: {
        type: [ObjectId],
        ref: 'Classroom',
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
  Person.plugin(
    mongooseDelete,
    {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: true,
    },
  );

  return mongo.model('Person', Person);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
