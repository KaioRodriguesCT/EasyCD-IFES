const mongooseDelete = require('mongoose-delete');

exports = module.exports = function initModel(mongo) {
  const SolicitationType = new mongo.Schema(
    {
      name: {
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
      // Defines how the meta should be send and build on solicitation
      fieldsStructure: {
        type: [Object], // Expect a array of {name, type},
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
  SolicitationType.plugin(mongooseDelete, {
    deletedBy: true,
    deletedAt: true,
    overrideMethods: true,
  });

  return mongo.model('SolicitationType', SolicitationType);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
