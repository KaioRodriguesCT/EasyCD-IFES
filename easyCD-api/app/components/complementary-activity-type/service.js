const _ = require('lodash');
const async = require('async');

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
  };

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
        const oldType = ComplementaryActivityTypeRepository
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
        _.forOwn(updatableFields, (value, field) => {
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isUndefined(type[field])) {
            return;
          }
          if ((_.isNull(type[field]) || _.isEmpty(type[field])) && !allowEmpty) {
            return;
          }
          if (_.isEqual(oldType[field], oldType[field])) {
            return;
          }
          oldType[field] = type[field];
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
      removeType: ['oldType', async ({ oldType: _id }) => ComplementaryActivityTypeRepository.removeById(_id)],
    });
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/complementary-activity-type/repository',
  'lib/utils',
];
