const _ = require('lodash');

exports = module.exports = function initRepository(
  SolicitationTypeModel,
  Utils,
) {
  return {
    create,
    update,
    removeById,
    findById,
  };

  async function findById({ _id }) {
    return SolicitationTypeModel
      .findById(_id)
      .lean()
      .exec();
  }

  async function create(solicitationType) {
    const requiredFields = [
      'name',
      'description',
      'requireTeacherApproval',
      'requireCoordinatorApproval',
      'allowSubmitFile',
    ];
    _.forEach(requiredFields, (field) => {
      if (_.isNil(solicitationType[field])) {
        Utils.throwError(`Error creating Solicitation Type. Required Field: ${field} not sent`, 400);
      }
    });
    const newSolicitationType = await SolicitationTypeModel.create(solicitationType);
    return newSolicitationType.toJSON();
  }

  async function update(solicitationType) {
    const oldSolicitationType = await SolicitationTypeModel
      .findById(solicitationType._id)
      .exec();
    if (!oldSolicitationType) {
      Utils.throwError('Error updating Solicitation Type. Solicitation Type not found', 404);
    }
    _.forOwn(solicitationType, (value, field) => {
      oldSolicitationType[field] = value;
    });
    const updatedSolicitationType = await oldSolicitationType.save();
    return updatedSolicitationType.toJSON();
  }

  async function removeById(solicitationTypeId) {
    const solicitationType = await SolicitationTypeModel
      .findById(solicitationTypeId)
      .exec();
    if (!solicitationType) {
      Utils.throwError('Error removing Solicitation Type. Solicitation Type not found', 404);
    }
    return solicitationType.delete();
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation-type/model',
  'lib/utils',
];
