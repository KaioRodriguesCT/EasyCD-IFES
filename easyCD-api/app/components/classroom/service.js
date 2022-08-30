const _ = require('lodash');
const async = require('async');

const defaultErrorCreating = 'Error creating Classroom';
const defaultErrorUpdating = 'Error updating Classroom';
const defaultErrorRemoving = 'Error removing Classroom';

exports = module.exports = function initService(
  ClassroomRepository,
  SubjectService,
  PersonService,
  Utils,
) {
  return {
    create,
    update,
    remove,
  };

  async function create(classroom) {
    if (!classroom) {
      Utils.throwError(`${defaultErrorCreating}. Classroom not sent`, 400);
    }
    const { newClassroom } = await async.auto({
      validateSubject: async () => validateSubject({
        subjectId: classroom.subject,
        defaultErrorMessage: defaultErrorCreating,
      }),
      validateTeacher: async () => validateTeacher({
        teacherId: classroom.teacher,
        defaultErrorMessage: defaultErrorCreating,
      }),
      // TODO
      validateEnrollments: async () => {},
      newClassroom: ['validateSubject', 'validateTeacher', 'validateEnrollments', async () => {
        const initialFields = [
          'subject',
          'semester',
          'enrollmentsLimit',
          'allowExceedLimit',
          'enrollments',
          'classTimes',
          'classDays',
          'teacher',
        ];
        const newClassroom = _.pick(classroom, initialFields);
        return ClassroomRepository.create(newClassroom);
      }],
      updateSubject: ['newClassroom', async ({ newClassroom: subject, _id }) => SubjectService.addClassroom({
        subject,
        classroomId: _id,
      })],
      updateTeacher: ['newClassroom', async ({ newClassroom: teacher, _id }) => PersonService.addClassroom({
        teacher,
        classroomId: _id,
      })],
    });
    return newClassroom;
  }

  async function update(classroom) {
    if (_.isNil(classroom)) {
      Utils.throwError(`${defaultErrorUpdating}. Classroom not sent`, 400);
    }
    if (_.isNil(classroom._id)) {
      Utils.throwError(`${defaultErrorUpdating}. Classroom ID not sent`, 400);
    }
    const { updatedClassroom } = await async.auto({
      oldClassroom: async () => {
        const oldClassroom = await ClassroomRepository
          .findById({ _id: classroom._id });
        if (!oldClassroom) {
          Utils.throwError(`${defaultErrorUpdating}. Classroom not found`, 404);
        }
        return oldClassroom;
      },
      processingSubject: ['oldClassroom', async ({ oldClassroom }) => {
        if (!classroom.subject
            || _.isEqual(oldClassroom.subject, classroom.subject)) {
          return;
        }
        await async.auto({
          // Validating new subject
          validatedSubject: async () => validateSubject({
            subjectId: classroom.subject,
            defaultErrorMessage: defaultErrorUpdating,
          }),
          // Removing classrom from old subject
          removing: ['validatedSubject', async () => SubjectService.removeClassroom({
            subject: oldClassroom.subject,
            classroomId: oldClassroom._id,
          })],
          // Adding classrom to new subject
          adding: ['validatedSubject', async () => SubjectService.addClassroom({
            subject: oldClassroom.subject,
            classroomId: classroom._id,
          })],
        });
      }],
      processingTeacher: ['oldClassroom', async ({ oldClassroom }) => {
        if (!classroom.teacher
            || _.isEqual(oldClassroom.teacher, classroom.teacher)) {
          return;
        }
        await async.auto({
          // Validating new teacher
          validatedTeacher: async () => validateTeacher({
            teacherId: classroom.teacher,
            defaultErrorMessage: defaultErrorUpdating,
          }),
          // Removing classrom from old teacher
          removing: ['validatedTeacher', async () => PersonService.removeClassroom({
            teacher: oldClassroom.teacher,
            classroomId: oldClassroom._id,
          })],
          // Adding classrom to new teacher
          adding: ['validatedTeacher', async () => PersonService.addClassroom({
            teacher: oldClassroom.teacher,
            classroomId: classroom._id,
          })],
        });
      }],
      updatedClassroom: ['processingSubject', 'processingTeacher', 'oldClassroom', async ({ oldClassroom }) => {
        const updatableFields = {
          subject: { allowEmpty: false },
          semester: { allowEmpty: false },
          enrollmentsLimit: { allowEmpty: true },
          allowExceedLimit: { allowEmpty: false },
          enrollments: { allowEmpty: true },
          classTimes: { allowEmpty: true },
          classDays: { allowEmpty: true },
          teacher: { allowEmpty: false },
        };
        _.forOwn(updatableFields, (value, field) => {
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isNil(classroom[field]) && !allowEmpty) {
            return;
          }
          if (_.isEqual(classroom[field], oldClassroom[field])) {
            return;
          }
          oldClassroom[field] = classroom[field];
        });
        return ClassroomRepository.update(oldClassroom);
      }],
    });
    return updatedClassroom;
  }

  async function remove(classroom) {
    if (_.isNil(classroom)) {
      Utils.throwError(`${defaultErrorRemoving}. Classroom not sent`, 400);
    }
    if (_.isNil(classroom._id)) {
      Utils.throwError(`${defaultErrorRemoving}. Classroom ID not sent`, 400);
    }
    await async.auto({
      oldClassroom: async () => {
        const oldClassroom = await ClassroomRepository
          .findById({ _id: classroom._id });
        if (!oldClassroom) {
          Utils.throwError(`${defaultErrorRemoving}. Classroom not found`, 404);
        }
        return oldClassroom;
      },
      removeClassroom: ['oldClassroom', async ({ oldClassroom }) => ClassroomRepository.removeById(oldClassroom._id)],
      updateSubject: ['oldClassroom', 'removeClassroom', async ({ oldClassroom: subject, _id }) => SubjectService.removeClassroom({
        subject,
        classroomId: _id,
      })],
      updateTeacher: ['oldClassroom', 'removeClassroom', async ({ oldClassroom: teacher, _id }) => PersonService.removeClassroom({
        teacher,
        classroomId: _id,
      })],
    });
  }

  async function validateTeacher({ teacherId, defaultErrorMessage }) {
    if (!teacherId) {
      Utils.throwError(`${defaultErrorMessage}. Teacher not sent`, 400);
    }
    const teacher = await PersonService.findById({ _id: teacherId });
    if (!teacher) {
      Utils.throwError(`${defaultErrorMessage}. Teacher not found`, 404);
    }
    return teacher;
  }

  async function validateSubject({ subjectId, defaultErrorMessage }) {
    if (!subjectId) {
      Utils.throwError(`${defaultErrorMessage}. Subject not sent`, 400);
    }
    const subject = await SubjectService.findById({ _id: subjectId });
    if (!subject) {
      Utils.throwError(`${defaultErrorMessage}. Subject not found`, 404);
    }
    return subject;
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/classroom/repository',
  'components/subject/service',
  'components/person/service',
  'lib/utils',
];
