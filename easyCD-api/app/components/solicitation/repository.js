const _ = require('lodash');

exports = module.exports = function initRepository(
  SolicitationModel,
) {
  return {
    create,
    update,
    removeById,
    findById,
    findAll,
  };

  async function findAll({ filters }) {
    return SolicitationModel.find(filters).lean().exec();
  }

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
    return solicitation.delete();
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation/model',
];
