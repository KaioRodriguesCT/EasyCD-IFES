const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(
  ComplementaryActivityTypeModel,
  Utils,
) {
  return {
    create,
    update,
    removeById,
    findById,
    findAll,
    aggregate,
  };

  async function findAll({ filters }) {
    return ComplementaryActivityTypeModel
      .find(filters)
      .lean()
      .exec();
  }
  async function findById({ _id }) {
    return ComplementaryActivityTypeModel.findById(_id).lean().exec();
  }

  async function create(complementaryActivityType) {
    const requiredFields = [
      'name',
      'score',
      'unit',
      'axle',
    ];
    _.forEach(requiredFields, (field) => {
      if (_.isNil(complementaryActivityType[field])) {
        Utils.throwError(`Error creating Complementary Activity Type. Required Field: ${field} not sent`, 400);
      }
    });
    const newType = await ComplementaryActivityTypeModel.create(complementaryActivityType);
    return newType.toJSON();
  }

  async function update(complementaryActivityType) {
    const { updatedType } = await async.auto({
      oldType: async () => ComplementaryActivityTypeModel
        .findById(complementaryActivityType._id)
        .exec(),
      updatedType: ['oldType', async ({ oldType }) => {
        _.forOwn(complementaryActivityType, (value, field) => {
          oldType[field] = value;
        });
        return oldType.save();
      }],
    });
    return updatedType.toJSON();
  }

  async function removeById(typeId) {
    const type = await ComplementaryActivityTypeModel
      .findById(typeId)
      .exec();
    return type.delete();
  }

  async function aggregate(pipeline) {
    return ComplementaryActivityTypeModel.aggregate(pipeline).exec();
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/complementary-activity-type/model',
  'lib/utils',
];
