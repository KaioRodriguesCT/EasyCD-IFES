const _ = require('lodash');
const async = require('async');

const defaultErrorCreating = 'Error creating Solicitation Type';
const defaultErrorUpdating = 'Error updating Solicitation Type';
const defaultErrorRemoving = 'Error removing Solicitation Type';

exports = module.exports = function initService(
  SolicitationTypeRepository,
  Utils,
) {
  return {
    create,
    update,
    remove,
  };

  async function create(solicitationType) {
    if (!solicitationType) {
      Utils.throwError(`${defaultErrorCreating}. Solicitation Type not sent`, 400);
    }
    const initialFields = [
      'name',
      'description',
      'requireTeacherApprovval',
      'requireCoordinatorApproval',
      'allowSubmitFile',
    ];
    const newSolicitationType = _.pick(solicitationType, initialFields);
    return SolicitationTypeRepository.create(newSolicitationType);
  }

  async function update(solicitationType) {
    if (_.isNil(solicitationType)) {
      Utils.throwError(`${defaultErrorUpdating}. Solicitation Type not sent`, 400);
    }
    if (_.isNil(solicitationType._id)) {
      Utils.throwError(`${defaultErrorUpdating}. Solicitation Type ID not sent`, 400);
    }
    const { updatedSolicitationType } = await async.auto({
      oldSolicitationType: async () => {
        const oldSolicitationType = await SolicitationTypeRepository
          .findById({ _id: solicitationType._id });
        if (!oldSolicitationType) {
          Utils.throwError(`${defaultErrorUpdating}. Solicitation Type not found`, 404);
        }
        return oldSolicitationType;
      },
      updatedSolicitation: ['oldSolicitationType', async ({ oldSolicitationType }) => {
        const updatableFields = {
          name: { allowEmpty: false },
          description: { allowEmpty: false },
          requireTeacherApproval: { allowEmpty: false },
          requireCoordinatorApproval: { allowEmpty: false },
          allowSubmitFile: { allowEmpty: false },
        };
        _.forOwn(updatableFields, (value, field) => {
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isUndefined(solicitationType[field])) {
            return;
          }
          if ((_.isNull(solicitationType[field])
          || _.isEmpty(solicitationType[field])) && !allowEmpty) {
            return;
          }
          if (_.isEqual(solicitationType[field], oldSolicitationType[field])) {
            return;
          }
          oldSolicitationType[field] = solicitationType[field];
        });
        return SolicitationTypeRepository.update(oldSolicitationType);
      }],
    });
    return updatedSolicitationType;
  }

  async function remove(solicitationType) {
    if (_.isNil(solicitationType)) {
      Utils.throwError(`${defaultErrorRemoving}. Solicitation Type not sent`, 400);
    }
    if (_.isNil(solicitationType._id)) {
      Utils.throwError(`${defaultErrorRemoving}. Solicitation Type ID not sent`, 400);
    }
    await async.auto({
      oldSolicitationType: async () => {
        const oldSolicitationType = await SolicitationTypeRepository
          .findById({ _id: solicitationType._id });
        if (!oldSolicitationType) {
          Utils.throwError(`${defaultErrorUpdating}. Solicitation Type not found`, 404);
        }
        return oldSolicitationType;
      },
      removeSolicitationType: ['oldSolicitationType', async ({ oldSolicitationType: _id }) => SolicitationTypeRepository.removeById(_id)],
    });
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation-type/repository',
  'lib/utils',
];
