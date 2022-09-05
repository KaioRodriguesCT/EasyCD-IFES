const mongooseDelete = require('mongoose-delete');

exports = module.exports = function initModel(mongo) {
  const ComplementaryActivityType = new mongo.Schema(
    {
      name: {
        type: String,
        required: true,
        index: true,
      },
      description: {
        type: String,
      },
      score: {
        type: Number,
        required: true,
        index: true,
      },
      unit: {
        type: String,
        enum: ['Hour'],
        required: true,
        index: true,
      },
      axle: {
        type: String,
        enum: ['Teaching', 'Research', 'Extension', 'Student Representation'],
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
  ComplementaryActivityType.plugin(mongooseDelete, {
    deletedBy: true,
    deletedAt: true,
    overrideMethods: true,
  });

  return mongo.model('ComplementaryActivityType', ComplementaryActivityType);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
