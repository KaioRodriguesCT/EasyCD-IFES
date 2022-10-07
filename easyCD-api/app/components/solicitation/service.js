const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');

const defaultErrorCreating = 'Error creating Solicitation';
const defaultErrorUpdating = 'Error updating Solicitation';
const defaultErrorRemoving = 'Error removing Solicitation';

exports = module.exports = function initService(
  SolicitationRepository,
  SolicitationTypeService,
  PersonService,
  UserService,
  Utils,
) {
  return {
    create,
    update,
    remove,
    validateStudent,
    validateSolicitationType,
  };

  async function create(solicitation) {
    if (!solicitation) {
      Utils.throwError(`${defaultErrorCreating}. Solicitation not sent`, 400);
    }
    const result = await async.auto({
      valdiateSolicitationType: async () => validateSolicitationType({
        defaultErrorMessage: defaultErrorCreating,
        solicitationTypeId: solicitation.solicitationType,
      }),
      validateMeta: ['valdiateSolicitationType', async () => SolicitationTypeService.validateMeta({
        meta: solicitation.meta,
        solicitationTypeId: solicitation.solicitationType,
      })],
      validateStudent: ['valdiateSolicitationType', async () => validateStudent({
        studentId: solicitation.student,
        defaultErrorMessage: defaultErrorCreating,
      })],
      createdSolicitation: ['validateMeta', 'validateStudent', async () => {
        const initialFields = [
          'solicitationType',
          'student',
          'meta',
        ];
        const newSolicitation = _.pick(solicitation, initialFields);
        return SolicitationRepository.create(newSolicitation);
      }],
      updateStudent: ['createdSolicitation', async ({ createdSolicitation: { _id, student } }) => PersonService.addSolicitation({
        person: student,
        solicitationId: _id,
      })],
      processCreatedSolicitation: ['createdSolicitation', async ({ createdSolicitation }) => SolicitationTypeService.processSolicitation({
        solicitation: createdSolicitation,
        state: 'created',
      })],
    });
    return result.createdSolicitation;
  }

  async function update(solicitation) {
    if (_.isNil(solicitation)) {
      Utils.throwError(`${defaultErrorUpdating}. Solicitation not sent`, 400);
    }
    if (_.isNil(solicitation._id)) {
      Utils.throwError(`${defaultErrorUpdating}. Solicitation ID not sent`, 400);
    }
    const result = await async.auto({
      oldSolicitation: async () => {
        const oldSolicitation = await SolicitationRepository
          .findById({ _id: solicitation._id });
        if (!oldSolicitation) {
          Utils.throwError(`${defaultErrorUpdating}. Solicitation not found`, 404);
        }
        return oldSolicitation;
      },
      updatedSolicitation: ['oldSolicitation', async ({ oldSolicitation }) => {
        const updatableFields = {
          status: { allowEmpty: false },
          teacherApproval: { allowEmpty: false },
          teacherNotes: { allowEmpty: true },
          coordinatorApproval: { allowEmpty: false },
          coordinatorNotes: { allowEmpty: true },
          isProcessed: { allowEmpty: false },
        };
        _.forOwn(updatableFields, (value, field) => {
          const currentValue = solicitation[field];
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isUndefined(currentValue)) {
            return;
          }
          if ((_.isNull(currentValue)
          || (!mongoose.isValidObjectId(currentValue) && _.isEmpty(currentValue)))
          && !allowEmpty
          && !_.isBoolean((currentValue))) {
            return;
          }
          oldSolicitation[field] = currentValue;
        });
        return SolicitationRepository.update(oldSolicitation);
      }],
      processUpdatedSolicitation: ['updatedSolicitation', async ({ updatedSolicitation }) => SolicitationTypeService.processSolicitation({
        solicitation: updatedSolicitation,
        state: 'updated',
      })],
    });
    return result.updatedSolicitation;
  }

  async function remove(solicitation) {
    if (_.isNil(solicitation)) {
      Utils.throwError(`${defaultErrorRemoving}. Solicitation not sent`, 400);
    }
    if (_.isNil(solicitation._id)) {
      Utils.throwError(`${defaultErrorRemoving}. Solicitation ID not sent`, 400);
    }
    await async.auto({
      oldSolicitation: async () => {
        const oldSolicitation = await SolicitationRepository
          .findById({ _id: solicitation._id });
        if (!oldSolicitation) {
          Utils.throwError(`${defaultErrorRemoving}. Solicitation not found`, 404);
        }
        return oldSolicitation;
      },
      removeSolicitation: ['oldSolicitation', async ({ oldSolicitation: { _id } }) => SolicitationRepository.removeById(_id)],
      updateStudent: ['oldSolicitation', 'removeSolicitation', async ({ oldSolicitation: { _id, student } }) => PersonService.removeSolicitation({
        person: student,
        solicitationId: _id,
      })],
      processDeletedSolicitation: ['oldSolicitation', 'removeSolicitation', async ({ oldSolicitation }) => SolicitationTypeService.processSolicitation({
        solicitation: oldSolicitation,
        state: 'deleted',
      })],
    });
  }

  async function validateStudent({ studentId, defaultErrorMessage }) {
    return async.auto({
      student: async () => {
        if (!studentId || !mongoose.isValidObjectId(studentId)) {
          Utils.throwError(`${defaultErrorMessage}. Student not sent or not a valid ID`, 400);
        }
        const student = await PersonService.findById({ _id: studentId });
        if (!student) {
          Utils.throwError(`${defaultErrorMessage}. Student not found`, 404);
        }
        return student;
      },
      validatedRole: ['student', async ({ student: _id }) => {
        const user = await UserService
          .getByPerson(_id);
        if (!user) {
          Utils.throwError(`${defaultErrorMessage}. User not found`, 404);
        }
        if (!_.isEqual(user.role, 'student')) {
          Utils.throwError(`${defaultErrorMessage}. Person sent can't be student`, 400);
        }
        return user;
      }],
    });
  }

  async function validateSolicitationType({ solicitationTypeId, defaultErrorMessage }) {
    if (!solicitationTypeId || !mongoose.isValidObjectId(solicitationTypeId)) {
      Utils.throwError(`${defaultErrorMessage}. Solicitation Type not sent or not a valid ID`, 400);
    }
    const solicitationType = await SolicitationTypeService.findById({ _id: solicitationTypeId });
    if (!solicitationType) {
      Utils.throwError(`${defaultErrorMessage}. Solicitation Type not found`, 404);
    }
    return solicitationType;
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation/repository',
  'components/solicitation-type/service',
  'components/person/service',
  'components/user/service',
  'lib/utils',
];
