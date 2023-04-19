const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const IoC = require('electrolyte');

const defaultErrorCreating = 'Error creating Solicitation Type';
const defaultErrorUpdating = 'Error updating Solicitation Type';
const defaultErrorRemoving = 'Error removing Solicitation Type';

exports = module.exports = function initService(
  SolicitationTypeRepository,
  ClassroomService,
  ComplementaryActivityTypeService,
  ComplementaryActivityService,
  PersonService,
  CourseService,
  EnrollmentService,
  Utils,
) {
  return {
    create,
    update,
    remove,
    validateFieldsStructure,
    validateMeta,
    validateEnrollmentSolicitationMeta,
    validateEnrollmentChangeSolicitationMeta,
    validateComplementaryActivityMetaSolicitation,
    processingRequiredApprovals,
    processEnrollmentSolicitation,
    processEnrollmentChangeSolicitation,
    processComplementaryActivitySolicitation,
    processSolicitation,
    isApproved,
    isReproved,
    findById,
    findAll,
  };

  async function findAll({ filters }) {
    return SolicitationTypeRepository.findAll({ filters });
  }

  async function findById({ _id }) {
    return SolicitationTypeRepository.findById({ _id });
  }

  async function create(solicitationType) {
    if (!solicitationType) {
      Utils.throwError(`${defaultErrorCreating}. Solicitation Type not sent`, 400);
    }
    const initialFields = [
      'name',
      'description',
      'requireTeacherApproval',
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
      validateFieldsStructure: async () => (solicitationType.fieldsStructure
        ? validateFieldsStructure({
          fieldsStructure: solicitationType.fieldsStructure,
          defaultErrorMessage: defaultErrorCreating,
        }) : null),
      updatedSolicitationType: ['validateFieldsStructure', 'oldSolicitationType', async ({ oldSolicitationType }) => {
        const updatableFields = {
          name: { allowEmpty: false },
          description: { allowEmpty: false },
          requireTeacherApproval: { allowEmpty: false },
          requireCoordinatorApproval: { allowEmpty: false },
          allowSubmitFile: { allowEmpty: false },
          fieldsStructure: { allowEmpty: false },
        };
        await Utils.updateModelWithValidFields({
          oldModel: oldSolicitationType,
          newModel: solicitationType,
          updatableFields,
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
          Utils.throwError(`${defaultErrorRemoving}. Solicitation Type not found`, 404);
        }
        return oldSolicitationType;
      },
      removeSolicitations: ['oldSolicitationType', async ({ oldSolicitationType }) => {
        const SolicitationService = IoC.create('components/solicitation/service');
        return SolicitationService.removeByType({ typeId: _.get(oldSolicitationType, '_id') });
      }],
      removeSolicitationType: ['removeSolicitations', 'oldSolicitationType', async ({ oldSolicitationType: _id }) => SolicitationTypeRepository.removeById(_id)],
    });
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
    return true;
  }

  async function validateMeta({ meta, solicitationTypeId }) {
    if (!solicitationTypeId || !mongoose.isValidObjectId(solicitationTypeId)) {
      Utils.throwError('Solicitation Type ID not sent or not a valid ID', 400);
    }
    // Expect meta to be a object with the properly fields on field named "fieldsStructure"
    // Inside the respective Solicitation Type.
    const solicitationType = await SolicitationTypeRepository.findById({ _id: solicitationTypeId });
    if (!solicitationType) {
      Utils.throwError('Solicitation Type not found', 404);
    }
    switch (solicitationType.name) {
      case 'Enrollment':
        return validateEnrollmentSolicitationMeta({ meta });
      case 'Enrollment Change':
        return validateEnrollmentChangeSolicitationMeta({ meta });
      case 'Complementary Activity':
        return validateComplementaryActivityMetaSolicitation({ meta });
      default:
        return null;
    }
  }

  async function validateEnrollmentSolicitationMeta({ meta }) {
    const defaultErrorMessage = 'Error on validate Enrollment Solicitation meta';
    if (!meta) {
      Utils.throwError(`${defaultErrorMessage}. Meta not sent`, 400);
    }
    const { classroom: classroomId } = meta;
    if (_.isNil(classroomId) || !mongoose.isValidObjectId(classroomId)) {
      Utils.throwError(`${defaultErrorMessage}. Classroom not sent or not a valid ID`, 400);
    }
    const classroom = await ClassroomService.findById({ _id: classroomId });
    if (!classroom) {
      Utils.throwError(`${defaultErrorMessage}. Classroom not found`, 404);
    }
    return true;
  }

  async function validateEnrollmentChangeSolicitationMeta({ meta }) {
    const defaultErrorMessage = 'Error on validate Enrollment Solicitation meta';
    if (!meta) {
      Utils.throwError(`${defaultErrorMessage}. Meta not sent`, 400);
    }
    const { classroomToEnroll, classroomToUnenroll } = meta;
    await async.auto({
      validateEnroll: async () => {
        if (_.isNil(classroomToEnroll) || !mongoose.isValidObjectId(classroomToEnroll)) {
          Utils.throwError(`${defaultErrorMessage}. Classroom to enroll not sent or not a valid ID`, 400);
        }
        const classroom = await ClassroomService.findById({ _id: classroomToEnroll });
        if (!classroom) {
          Utils.throwError(`${defaultErrorMessage}. Classroom to enroll not found`, 404);
        }
      },
      validateUneroll: async () => {
        if (_.isNil(classroomToUnenroll) || !mongoose.isValidObjectId(classroomToUnenroll)) {
          Utils.throwError(`${defaultErrorMessage}. Classroom to unenroll not sent or not a valid ID`, 400);
        }
        const classroom = await ClassroomService.findById({ _id: classroomToUnenroll });
        if (!classroom) {
          Utils.throwError(`${defaultErrorMessage}. Classroom to unenroll not found`, 404);
        }
      },
    });
    return true;
  }

  async function validateComplementaryActivityMetaSolicitation({ meta }) {
    const defaultErrorMessage = 'Error on Complementary Activity Solicitation meta';
    if (!meta) {
      Utils.throwError(`${defaultErrorMessage}. Meta not sent`, 400);
    }
    const {
      complementaryActivityType: cActivityType, evidence, quantity, course,
    } = meta;
    if (_.isNil(cActivityType)
    || !mongoose.isValidObjectId(cActivityType)) {
      Utils.throwError(`${defaultErrorMessage}. Complementary Activity type not sent or not a valid ID`, 400);
    }
    const complementaryActivityType = await ComplementaryActivityTypeService
      .findById({ _id: cActivityType });
    if (!complementaryActivityType) {
      Utils.throwError(`${defaultErrorMessage}. Complementary Activity Type not found`, 404);
    }
    if (_.isNil(evidence)
    // Commment because we don't know
    // if this will be type used for the files || !_.isBuffer(evidence)
    ) {
      Utils.throwError(`${defaultErrorMessage}. Evidence not sent or not a valid Buffer`, 400);
    }
    if (_.isNil(course) || !mongoose.isValidObjectId(course)) {
      Utils.throwError(`${defaultErrorMessage}. Course not sent or not a valid ID`, 400);
    }
    if (_.isNil(quantity)) {
      Utils.throwError(`${defaultErrorMessage}. Quantity not sent or not a valid number`, 400);
    }
    return true;
  }

  async function processSolicitation({
    solicitation,
    state,
  }) {
    if (!solicitation) {
      Utils.throwError(`Error processing recently ${state} solicitation. Solicitation not sent`, 400);
    }
    const solicitationType = await SolicitationTypeRepository
      .findById({ _id: solicitation.solicitationType });
    if (!solicitationType) {
      Utils.throwError(`Error processing recently ${state} solicitation: ${solicitation._id}. Solicitation Type not found`, 404);
    }
    switch (solicitationType.name) {
      case 'Enrollment':
        return processEnrollmentSolicitation({ solicitation, solicitationType, state });
      case 'Enrollment Change':
        return processEnrollmentChangeSolicitation({ solicitation, solicitationType, state });
      case 'Complementary Activity':
        return processComplementaryActivitySolicitation({ solicitation, solicitationType, state });
      default:
        return null;
    }
  }

  async function processEnrollmentSolicitation({ solicitation, solicitationType, state }) {
    const defaultErrorMessage = 'Error on processing Enrollment Solicitation';
    if (!solicitation || !solicitationType) {
      Utils.throwError(`${defaultErrorMessage}. Solicitation or Solicitation type not sent`, 400);
    }
    const { meta, isProcessed } = solicitation;
    const classroom = await ClassroomService
      .findById({ _id: meta.classroom });
    const teacherAndCoordinator = await ClassroomService.getClassroomTeacherAndCoordinator({
      classroom: _.get(classroom, '_id'),
    });
    if (!teacherAndCoordinator) {
      Utils.throwError(`${defaultErrorMessage}. Teacher and Coordinator not found for classroom`, 400);
    }
    switch (state) {
      case 'deleted':
      case 'created':
        return processingRequiredApprovals({
          solicitation,
          coordinator: teacherAndCoordinator.coordinator,
          teacher: teacherAndCoordinator.teacher,
          solicitationType,
          state,
        });
      case 'updated':
        // TODO
        if (isApproved({ solicitation, solicitationType }) && !isProcessed) {
          const newEnrollment = {
            classroom: classroom._id,
            student: solicitation.student,
          };
          return async.auto({
            createdEnrollment: async () => EnrollmentService.create(newEnrollment),
            updatedSolicitation: ['createdEnrollment', async () => {
              const SolicitationService = IoC.create('components/solicitation/service');
              return SolicitationService.update({ _id: solicitation._id, isProcessed: true });
            }],
          });
        }
        return null;
      default:
        return null;
    }
  }

  async function processEnrollmentChangeSolicitation({ solicitation, solicitationType, state }) {
    const defaultErrorMessage = 'Error on processing Enrollment Change Solicitation';
    if (!solicitation || !solicitationType) {
      Utils.throwError(`${defaultErrorMessage}. Solicitation or Solicitation type not sent`, 400);
    }
    const { meta, isProcessed } = solicitation;
    // Get the classrooms.
    const classroomToEnroll = await ClassroomService.findById({ _id: meta.classroomToEnroll });
    const teacherAndCoordinator = await ClassroomService.getClassroomTeacherAndCoordinator({
      classroom: _.get(classroomToEnroll, '_id'),
    });
    if (!teacherAndCoordinator) {
      Utils.throwError(`${defaultErrorMessage}. Teacher and Coordinator not found for classroom`, 404);
    }
    switch (state) {
      case 'deleted':
      case 'created':
        return processingRequiredApprovals({
          solicitation,
          coordinator: teacherAndCoordinator.coordinator,
          teacher: teacherAndCoordinator.teacher,
          solicitationType,
          state,
        });
      case 'updated':
        if (isApproved({ solicitation, solicitationType }) && !isProcessed) {
          const newEnrollment = {
            classroom: classroomToEnroll._id,
            student: solicitation.student,
          };
          return async.auto({
            creating: async () => EnrollmentService.create(newEnrollment),
            canceling: async () => {
              const enrollmentToCancel = await EnrollmentService.findOneByClassroomAndStudent({
                classroom: meta.classroomToUnenroll,
                student: solicitation.student,
              });

              return EnrollmentService.update({
                _id: _.get(enrollmentToCancel, '_id'),
                status: 'Canceled',
              });
            },
            updateSolicitation: ['creating', async () => {
              const SolicitationService = IoC.create('components/solicitation/service');
              return SolicitationService.update({ _id: solicitation._id, isProcessed: true });
            }],
          });
        }
        return null;
      default:
        return null;
    }
  }

  async function processComplementaryActivitySolicitation({
    solicitation,
    solicitationType,
    state,
  }) {
    const defaultErrorMessage = 'Error on processing Complementary Activity Solicitation';
    if (!solicitation || !solicitationType) {
      Utils.throwError(`${defaultErrorMessage}. Solicitation or Solicitation type not sent`, 400);
    }
    const { meta, isProcessed } = solicitation;
    const course = await CourseService.findById({ _id: meta.course });
    if (!course) {
      Utils.throwError(`${defaultErrorMessage}. Course not found`, 404);
    }
    switch (state) {
      case 'deleted':
      case 'created':
        return processingRequiredApprovals({
          solicitation,
          coordinator: course.coordinator,
          teacher: null,
          solicitationType,
          state,
        });
      // TODO
      case 'updated': {
        const newComplementaryActivity = {
          complementaryActivityType: meta.complementaryActivityType,
          student: solicitation.student,
          evidence: meta.evidence,
          quantity: meta.quantity,
          course: meta.course,
        };

        if (solicitation?.status === 'Canceled') {
          const SolicitationService = IoC.create('components/solicitation/service');
          return SolicitationService.update({ _id: solicitation._id, isProcessed: true });
        }

        if (isApproved({ solicitation, solicitationType }) && !isProcessed) {
          return async.auto({
            creatingActivity: async () => ComplementaryActivityService.create({ ...newComplementaryActivity, status: 'Accepted' }),
            updateSolicitation: ['creatingActivity', async () => {
              const SolicitationService = IoC.create('components/solicitation/service');
              return SolicitationService.update({ _id: solicitation._id, isProcessed: true, status: 'Deferred' });
            }],
          });
        }
        if (isReproved({ solicitation, solicitationType }) && !isProcessed) {
          return async.auto({
            creatingActivity: async () => ComplementaryActivityService.create({ ...newComplementaryActivity, status: 'Rejected' }),
            updateSolicitation: ['creatingActivity', async () => {
              const SolicitationService = IoC.create('components/solicitation/service');
              return SolicitationService.update({ _id: solicitation._id, isProcessed: true, status: 'Undeferred' });
            }],
          });
        }
        return null;
      }
      default:
        return null;
    }
  }

  async function processingRequiredApprovals({
    solicitation,
    teacher,
    coordinator,
    solicitationType,
    state,
  }) {
    return async.auto({
      processingTeacher: async () => {
        if (!solicitationType.requireTeacherApproval || !teacher) {
          return null;
        }
        const { updatedTeacher } = await async.auto({
          updatedTeacher: async () => {
            switch (state) {
              case 'created':
                return PersonService.addSolicitation({
                  person: teacher,
                  solicitationId: solicitation._id,
                });
              case 'deleted':
                return PersonService.removeSolicitation({
                  person: teacher,
                  solicitationId: solicitation._id,
                });
              default:
                return null;
            }
          },
          // TODO
          sendEmail: async () => {},
        });
        return updatedTeacher;
      },
      processingCoordinator: async () => {
        if (!solicitationType.requireCoordinatorApproval || !coordinator) {
          return null;
        }
        const { updatedCoordinator } = await async.auto({
          updatedCoordinator: async () => {
            switch (state) {
              case 'created':
                return PersonService.addSolicitation({
                  person: coordinator,
                  solicitationId: solicitation._id,
                });
              case 'deleted':
                return PersonService.removeSolicitation({
                  person: coordinator,
                  solicitationId: solicitation._id,
                });
              default:
                return null;
            }
          },
          // TODO
          sendEmail: async () => {},
        });
        return updatedCoordinator;
      },
    });
  }

  function isApproved({ solicitation, solicitationType }) {
    const { teacherApproval, coordinatorApproval } = solicitation;
    const { requireTeacherApproval, requireCoordinatorApproval } = solicitationType;
    if (requireTeacherApproval && !teacherApproval) {
      return false;
    }
    if (requireCoordinatorApproval && !coordinatorApproval) {
      return false;
    }
    return true;
  }

  function isReproved({ solicitation, solicitationType }) {
    const { teacherApproval, coordinatorApproval } = solicitation;
    const { requireTeacherApproval, requireCoordinatorApproval } = solicitationType;
    if (requireCoordinatorApproval
      && !_.isNil(coordinatorApproval)
      && !coordinatorApproval) {
      return true;
    }
    if (requireTeacherApproval
      && !_.isNil(teacherApproval)
      && !teacherApproval) {
      return true;
    }
    return false;
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation-type/repository',
  'components/classroom/service',
  'components/complementary-activity-type/service',
  'components/complementary-activity/service',
  'components/person/service',
  'components/course/service',
  'components/enrollment/service',
  'lib/utils',
];
