const mongooseDelete = require('mongoose-delete');

exports = module.exports = function initModel(mongo) {
  const SolicitationType = new mongo.Schema(
    {
      name: {
        // Actually we should have : Enrollment, Enrollment Change, Complementary Activity
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      requireTeacherApproval: {
        type: Boolean,
        required: true,
      },
      requireCoordinatorApproval: {
        type: Boolean,
        required: true,
      },
      allowSubmitFile: {
        type: Boolean,
        required: true,
      },
      fieldsStructure: {
        type: [{
          name: {
            type: String,
            required: true,
          },
          type: {
            type: String,
            required: true,
          },
        }],
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
  SolicitationType.plugin(mongooseDelete, {
    deletedBy: true,
    deletedAt: true,
    overrideMethods: true,
  });

  return mongo.model('SolicitationType', SolicitationType);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
