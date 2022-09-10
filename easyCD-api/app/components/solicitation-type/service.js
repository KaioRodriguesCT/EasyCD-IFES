const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');

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
    validateMeta,
    // processCreatedSolicitation,
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
      'fieldsStructure',
    ];
    const newSolicitationType = _.pick(solicitationType, initialFields);
    // Validating the fields structure field
    validateFieldsStructure({
      fieldsStructure: newSolicitationType.fieldsStructure,
      defaultErrorMessage: defaultErrorCreating,
    });
    return SolicitationTypeRepository.create(newSolicitationType);
  }

  function validateFieldsStructure({ fieldsStructure, defaultErrorMessage }) {
    const allowedTypes = ['String', 'Number', 'Buffer', 'Boolean', 'ObjectId'];
    if (_.isEmpty(fieldsStructure)) {
      Utils.throwError(`${defaultErrorMessage}. Structure of the fields sent is not valid`, 400);
    }
    _.forEach(fieldsStructure, (field) => {
      const { name, type } = field;
      if (_.isNil(name) || _.isNil(type)) {
        Utils.throwError(`${defaultErrorMessage}. Name or type of the field are not valid, on fields structure array`, 400);
      }
      if (!allowedTypes.includes(type)) {
        Utils.throwError(`${defaultErrorMessage}. Type of field ${name} not valid. Please use one of the allow types: ${_.join(allowedTypes, ', ')}`, 400);
      }
    });
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
          fieldsStructure: { allowEmpty: false },
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

  async function validateMeta({ meta, solicitationTypeId, defaultErrorMessage }) {
    if (!solicitationTypeId || !mongoose.isValidObjectId(solicitationTypeId)) {
      Utils.throwError('Solicitation Type ID not sent or not a valid ID', 400);
    }
    // Expect meta to be a object with the properly fields on field named "fieldsStructure"
    // Inside the respective Solicitation Type.
    const solicitationType = await SolicitationTypeRepository.findById({ _id: solicitationTypeId });
    if (!solicitationType) {
      Utils.throwError('Solicitation Type not found', 404);
    }
    const { fieldsStructure } = solicitationType;
    _.forEach(fieldsStructure, (field) => {
      const { name, type } = field;
      if (_.isNil(meta[name])) {
        Utils.throwError(`${defaultErrorMessage}. Required field: ${name}, not sent on meta`, 400);
      }
      if (!verifyFieldType({ type, field: meta[name] })) {
        Utils.throwError(`${defaultErrorMessage}. Field ${name} sent with wrong type`, 400);
      }
    });
  }

  function verifyFieldType({ type, field }) {
    switch (type) {
      case 'String':
        return _.isString(field);
      case 'Number':
        return _.isNumber(field);
      case 'Buffer':
        return _.isBuffer(field);
      case 'Boolean':
        return _.isBoolean(field);
      case 'ObjectId':
        return mongoose.isValidObjectId(field);
      default:
        return null;
    }
  }

  // TODO
  // async function processCreatedSolicitation({ solicitation }) {
  //   return true;
  //    if(!solicitation){
  //      Utils.throwError(
  // `Error processing recently created solicitation. Solicitation not sent`, 400);
  //    }
  //    const {solicitation, status, student, meta} = solicitation
  // }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation-type/repository',
  'lib/utils',
];
