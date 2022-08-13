const mongooseDelete = require('mongoose-delete');

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
    },
    {
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
  );

  // Plugins
  Person.plugin(
    mongooseDelete,
    { deletedBy: true, deletedAt: true },
    { overrideMethods: 'all' },
  );

  return mongo.model('Person', Person);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
