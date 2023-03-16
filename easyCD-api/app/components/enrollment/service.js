const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');

const defaultErrorCreating = 'Error creating Enrollment';
const defaultErrorUpdating = 'Error updating Enrollment';
const defaultErrorRemoving = 'Error removing Enrollment';

exports = module.exports = function initService(
  EnrollmentRepository,
  PersonService,
  UserService,
  ClassroomService,
  Utils,
) {
  return {
    create,
    update,
    remove,
    validateClassroom,
    validateStudent,
    findOneByClassroomAndStudent,
    findAll,
    removeByClassroom,
  };

  async function create(enrollment) {
    if (!enrollment) {
      Utils.throwError(`${defaultErrorCreating}. Enrollment not sent`, 400);
    }
    const { createdEnrollment } = await async.auto({
      validateStudent: async () => validateStudent({
        studentId: enrollment.student,
        defaultErrorMessage: defaultErrorCreating,
      }),
      validatedClassroom: async () => validateClassroom({
        classroomId: enrollment.classroom,
        defaultErrorMessage: defaultErrorCreating,
      }),
      createdEnrollment: ['validateStudent', 'validatedClassroom', async () => {
        const initialFields = [
          'classroom',
          'student',
          'status',
          'observation',
        ];
        const newEnrollment = _.pick(enrollment, initialFields);
        return EnrollmentRepository.create(newEnrollment);
      }],
      updateStudent: ['createdEnrollment', async ({ createdEnrollment: { student, _id } }) => PersonService.addEnrollment({
        student,
        enrollmentId: _id,
      })],
      updateClassroom: ['createdEnrollment', async ({ createdEnrollment: { classroom, _id } }) => ClassroomService.addEnrollment({
        classroom,
        enrollmentId: _id,
      })],
    });
    console.log('Here');
    return createdEnrollment;
  }

  async function update(enrollment) {
    if (_.isNil(enrollment)) {
      Utils.throwError(`${defaultErrorUpdating}. Enrollment not sent`, 400);
    }
    if (_.isNil(enrollment._id)) {
      Utils.throwError(`${defaultErrorUpdating}. Enrollment ID not sent`, 400);
    }
    const { updatedEnrollment } = await async.auto({
      oldEnrollment: async () => {
        const oldEnrollment = await EnrollmentRepository
          .findById({ _id: enrollment._id });
        if (!oldEnrollment) {
          Utils.throwError(`${defaultErrorUpdating}. Enrollment not found`, 404);
        }
        return oldEnrollment;
      },
      processingStudent: ['oldEnrollment', async ({ oldEnrollment }) => {
        if (!enrollment.student
            || _.isEqual(String(oldEnrollment.student), String(enrollment.student))) {
          return;
        }
        await async.auto({
          // Validating new student
          validatedStudent: async () => validateStudent({
            studentId: enrollment.student,
            defaultErrorMessage: defaultErrorUpdating,
          }),
          // Removing enrollment from old student
          removing: ['validatedStudent', async () => PersonService.removeEnrollment({
            student: oldEnrollment.student,
            enrollmentId: oldEnrollment._id,
          })],
          // Adding enrollment to new student
          adding: ['validatedStudent', async () => PersonService.addEnrollment({
            student: enrollment.student,
            enrollmentId: enrollment._id,
          })],
        });
      }],
      processingClassroom: ['oldEnrollment', async ({ oldEnrollment }) => {
        if (!enrollment.classroom
            || _.isEqual(String(oldEnrollment.classroom), String(enrollment.classroom))) {
          return;
        }
        await async.auto({
          // Validating new classroom
          validatedClassroom: async () => validateClassroom({
            classroomId: enrollment.classroom,
            defaultErrorMessage: defaultErrorUpdating,
          }),
          // Removing enrollment from old classroom
          removing: ['validatedClassroom', async () => ClassroomService.removeEnrollment({
            classroom: oldEnrollment.classroom,
            enrollmentId: oldEnrollment._id,
          })],
          // Adding enrollment to new classroom
          adding: ['validatedClassroom', async () => ClassroomService.addEnrollment({
            classroom: enrollment.classroom,
            enrollmentId: enrollment._id,
          })],
        });
      }],
      updatedEnrollment: ['oldEnrollment', 'processingStudent', 'processingClassroom', async ({ oldEnrollment }) => {
        const updatableFields = {
          classroom: { allowEmpty: false },
          student: { allowEmpty: false },
          status: { allowEmpty: false },
          observation: { allowEmpty: true },
        };

        await Utils.updateModelWithValidFields({
          oldModel: oldEnrollment,
          newModel: enrollment,
          updatableFields,
        });

        return EnrollmentRepository.update(oldEnrollment);
      }],
    });
    return updatedEnrollment;
  }

  async function remove(enrollment) {
    if (_.isNil(enrollment)) {
      Utils.throwError(`${defaultErrorRemoving}. Enrollment not sent`, 400);
    }
    if (_.isNil(enrollment._id)) {
      Utils.throwError(`${defaultErrorRemoving}. Enrollment ID not sent`, 400);
    }
    await async.auto({
      oldEnrollment: async () => {
        const oldEnrollment = await EnrollmentRepository
          .findById({ _id: enrollment._id });
        if (!oldEnrollment) {
          Utils.throwError(`${defaultErrorRemoving}. Enrollment not found`, 404);
        }
        return oldEnrollment;
      },
      removeEnrollment: ['oldEnrollment', async ({ oldEnrollment: _id }) => EnrollmentRepository.removeById(_id)],
      updateStudent: ['oldEnrollment', 'removeEnrollment', async ({ oldEnrollment: { student, _id } }) => PersonService.removeEnrollment({
        student,
        enrollmentId: _id,
      })],
      updateClassroom: ['oldEnrollment', 'removeEnrollment', async ({ oldEnrollment: { classroom, _id } }) => ClassroomService.removeEnrollment({
        classroom,
        enrollmentId: _id,
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

  async function validateClassroom({ classroomId, defaultErrorMessage }) {
    if (!classroomId || !mongoose.isValidObjectId(classroomId)) {
      Utils.throwError(`${defaultErrorMessage}. Classroom not sent or not a valid ID`, 400);
    }
    const classroom = await ClassroomService.findById({ _id: classroomId });
    if (!classroom) {
      Utils.throwError(`${defaultErrorMessage}. Classroom not found`, 404);
    }
    return classroom;
  }

  async function findOneByClassroomAndStudent({
    classroom,
    student,
  }) {
    return EnrollmentRepository.findOne({
      filters: {
        classroom,
        student,
      },
    });
  }

  async function findAll({ filters }) {
    return EnrollmentRepository.findAll({ filters });
  }

  async function removeByClassroom({ classroomId }) {
    const subjects = await EnrollmentRepository.findAll({
      filters: { classroom: classroomId },
    });
    return async.eachSeries(subjects, remove);
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/enrollment/repository',
  'components/person/service',
  'components/user/service',
  'components/classroom/service',
  'lib/utils',
];
