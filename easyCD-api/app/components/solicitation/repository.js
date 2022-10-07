const _ = require('lodash');

exports = module.exports = function initRepository(
  SolicitationModel,
  Utils,
) {
  return {
    create,
    update,
    removeById,
    findById,
  };

  async function findById({ _id }) {
    return SolicitationModel
      .findById(_id)
      .lean()
      .exec();
  }

  async function create(solicitation) {
    const newSolicitation = await SolicitationModel.create(solicitation);
    return newSolicitation.toJSON();
  }

  async function update(solicitation) {
    const oldSolicitation = await SolicitationModel
      .findById(solicitation._id)
      .exec();
    if (!oldSolicitation) {
      Utils.throwError('Error updating Solicitation. Solicitation not found', 404);
    }
    _.forOwn(solicitation, (value, field) => {
      oldSolicitation[field] = value;
    });
    const updatedSolicitation = await oldSolicitation.save();
    return updatedSolicitation.toJSON();
  }

  async function removeById(solicitationId) {
    const solicitation = await SolicitationModel
      .findById(solicitationId)
      .exec();
    if (!solicitation) {
      Utils.throwError('Error removing Solicitation. Solicitation not found', 404);
    }
    return solicitation.delete();
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation/model',
];
