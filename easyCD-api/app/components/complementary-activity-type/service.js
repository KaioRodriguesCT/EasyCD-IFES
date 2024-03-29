const _ = require('lodash');
const async = require('async');
const IoC = require('electrolyte');

const defaultErrorCreating = 'Error creating Complementary Activity Type';
const defaultErrorUpdating = 'Error updating Complementary Activity Type';
const defaultErrorRemoving = 'Error removing Complementary Activity Type';

exports = module.exports = function initService(
  ComplementaryActivityTypeRepository,
  Utils,
) {
  return {
    create,
    update,
    remove,
    findById,
    list,
  };

  async function list({ filters }) {
    const pipeline = [{ $match: { deleted: { $ne: true } } }];

    if (filters?.axle) {
      pipeline.push({
        $match: {
          axle: filters.axle,
        },
      });
    }

    if (filters?.name) {
      pipeline.push({
        $match: {
          name: { $regex: new RegExp(`^${filters.name}`) },
        },
      });
    }
    return ComplementaryActivityTypeRepository.aggregate(pipeline);
  }

  async function findById({ _id }) {
    return ComplementaryActivityTypeRepository.findById({ _id });
  }

  async function create(type) {
    if (!type) {
      Utils.throwError(`${defaultErrorCreating}. Type not sent`, 400);
    }
    const initialFields = ['name', 'description', 'score', 'unit', 'axle'];
    const newType = _.pick(type, initialFields);
    return ComplementaryActivityTypeRepository.create(newType);
  }

  async function update(type) {
    if (_.isNil(type)) {
      Utils.throwError(`${defaultErrorUpdating}. Type not sent`, 400);
    }
    if (_.isNil(type._id)) {
      Utils.throwError(`${defaultErrorUpdating}. Type ID not sent`, 400);
    }
    const { updatedType } = await async.auto({
      oldType: async () => {
        const oldType = await ComplementaryActivityTypeRepository
          .findById({ _id: type._id });
        if (!oldType) {
          Utils.throwError(`${defaultErrorUpdating}. Type not found`, 404);
        }
        return oldType;
      },
      updatedType: ['oldType', async ({ oldType }) => {
        const updatableFields = {
          name: { allowEmpty: false },
          description: { allowEmpty: true },
          score: { allowEmpty: false },
          unit: { allowEmpty: false },
          axle: { allowEmpty: false },
        };
        await Utils.updateModelWithValidFields({
          oldModel: oldType,
          newModel: type,
          updatableFields,
        });
        return ComplementaryActivityTypeRepository.update(oldType);
      }],
    });
    return updatedType;
  }

  async function remove(type) {
    if (_.isNil(type)) {
      Utils.throwError(`${defaultErrorRemoving}. Type not sent`, 400);
    }
    if (_.isNil(type._id)) {
      Utils.throwError(`${defaultErrorRemoving}. Type ID not sent`, 400);
    }
    await async.auto({
      oldType: async () => {
        const oldType = await ComplementaryActivityTypeRepository
          .findById({ _id: type._id });
        if (!oldType) {
          Utils.throwError(`${defaultErrorRemoving}. Type not found`, 404);
        }
        return oldType;
      },
      removeCA: ['oldType', async ({ oldType }) => {
        const CAService = IoC.create('components/complementary-activity/service');
        return CAService.removeByType({ typeId: _.get(oldType, '_id') });
      }],
      removeType: ['oldType', async ({ oldType: { _id } }) => ComplementaryActivityTypeRepository.removeById(_id)],
    });
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/complementary-activity-type/repository',
  'lib/utils',
];
