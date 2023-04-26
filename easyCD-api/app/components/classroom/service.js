const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const moment = require('moment');
const IoC = require('electrolyte');

const defaultErrorCreating = 'Error creating Classroom';
const defaultErrorUpdating = 'Error updating Classroom';
const defaultErrorRemoving = 'Error removing Classroom';

const { ObjectId } = mongoose.Types;

exports = module.exports = function initService(
  ClassroomRepository,
  SubjectService,
  PersonService,
  UserService,
  Utils,
) {
  return {
    create,
    update,
    remove,
    findById,
    findAll,
    addEnrollment,
    removeEnrollment,
    validateSubject,
    validateTeacher,
    getClassroomTeacherAndCoordinator,
    removeBySubject,
    getTeacherClassrooms,
  };

  async function findAll({ filters }) {
    const pipeline = [
      {
        $match: {
          deleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subject',
        },
      },
      {
        $unwind: {
          path: '$subject',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'curriculumgrides',
          localField: 'subject.curriculumGride',
          foreignField: '_id',
          as: 'curriculumGride',
        },
      },
      {
        $unwind: {
          path: '$curriculumGride',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'curriculumGride.course',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: {
          path: '$course',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    return ClassroomRepository.aggregate(pipeline);
  }

  async function findById({ _id }) {
    return ClassroomRepository.findById({ _id });
  }

  async function create(classroom) {
    if (!classroom) {
      Utils.throwError(`${defaultErrorCreating}. Classroom not sent`, 400);
    }
    const { createdClassroom } = await async.auto({
      validateSubject: async () => validateSubject({
        subjectId: classroom.subject,
        defaultErrorMessage: defaultErrorCreating,
      }),
      validateTeacher: async () => validateTeacher({
        teacherId: classroom.teacher,
        defaultErrorMessage: defaultErrorCreating,
      }),
      validateEnrollments: async () => {},
      createdClassroom: ['validateSubject', 'validateTeacher', 'validateEnrollments', async () => {
        const initialFields = [
          'subject',
          'semester',
          'enrollmentsLimit',
          'allowExceedLimit',
          'enrollments',
          'classTimes',
          'teacher',
        ];
        const newClassroom = _.pick(classroom, initialFields);
        const name = await buildClassroomName({ classroom: newClassroom });
        newClassroom.name = name;
        return ClassroomRepository.create(newClassroom);
      }],
      updateSubject: ['createdClassroom', async ({ createdClassroom: { subject, _id } }) => SubjectService.addClassroom({
        subject,
        classroomId: _id,
      })],
      updateTeacher: ['createdClassroom', async ({ createdClassroom: { teacher, _id } }) => PersonService.addClassroom({
        teacher,
        classroomId: _id,
      })],
    });
    return createdClassroom;
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
            || _.isEqual(String(oldClassroom.subject), String(classroom.subject))) {
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
            subject: classroom.subject,
            classroomId: classroom._id,
          })],
        });
      }],
      processingTeacher: ['oldClassroom', async ({ oldClassroom }) => {
        if (!classroom.teacher
            || _.isEqual(String(oldClassroom.teacher), String(classroom.teacher))) {
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
            teacher: classroom.teacher,
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

        await Utils.updateModelWithValidFields({
          oldModel: oldClassroom,
          newModel: classroom,
          updatableFields,
        });
        const name = await buildClassroomName({ classroom: oldClassroom });
        oldClassroom.name = name;
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
      removeEnrollments: ['oldClassroom', async ({ oldClassroom }) => {
        const EnrollmentService = IoC.create('components/enrollment/service');
        return EnrollmentService.removeByClassroom({ classroomId: _.get(oldClassroom, '_id') });
      }],
      removeClassroom: ['removeEnrollments', 'oldClassroom', async ({ oldClassroom: { _id } }) => ClassroomRepository.removeById(_id)],
      updateSubject: ['oldClassroom', 'removeClassroom', async ({ oldClassroom: { subject, _id } }) => SubjectService.removeClassroom({
        subject,
        classroomId: _id,
      })],
      updateTeacher: ['oldClassroom', 'removeClassroom', async ({ oldClassroom: { teacher, _id } }) => PersonService.removeClassroom({
        teacher,
        classroomId: _id,
      })],
    });
  }

  async function validateTeacher({ teacherId, defaultErrorMessage }) {
    return async.auto({
      teacher: async () => {
        if (!teacherId || !mongoose.isValidObjectId(teacherId)) {
          Utils.throwError(`${defaultErrorMessage}. Teacher not sent or not a valid ID`, 400);
        }
        const teacher = await PersonService.findById({ _id: teacherId });
        if (!teacher) {
          Utils.throwError(`${defaultErrorMessage}. Teacher not found`, 404);
        }
        return teacher;
      },
      validatedRole: ['teacher', async ({ teacher: _id }) => {
        const user = await UserService
          .getByPerson(_id);
        if (!user) {
          Utils.throwError(`${defaultErrorMessage}. User not found`, 404);
        }
        if (!_.isEqual(user.role, 'teacher')) {
          Utils.throwError(`${defaultErrorMessage}. Person sent can't be teacher`, 400);
        }
        return user;
      }],
    });
  }

  async function validateSubject({ subjectId, defaultErrorMessage }) {
    if (!subjectId || !mongoose.isValidObjectId(subjectId)) {
      Utils.throwError(`${defaultErrorMessage}. Subject not sent or not a valid ID`, 400);
    }
    const subject = await SubjectService.findById({ _id: subjectId });
    if (!subject) {
      Utils.throwError(`${defaultErrorMessage}. Subject not found`, 404);
    }
    return subject;
  }

  async function addEnrollment({
    classroom,
    enrollmentId,
  }) {
    const defaultErrorMessage = 'Error adding Enrollment to Classroom';
    if (!classroom || !mongoose.isValidObjectId(classroom)) {
      Utils.throwError(`${defaultErrorMessage}. Classroom ID not sent or not a valid ID`, 400);
    }
    if (!enrollmentId || !mongoose.isValidObjectId(enrollmentId)) {
      Utils.throwError(`${defaultErrorMessage}. Enrollment ID not sent or not a valid ID`, 400);
    }
    const { updatedClassroom } = await async.auto({
      oldClassroom: async () => {
        const oldClassroom = await ClassroomRepository
          .findById({
            _id: classroom,
            select: { _id: 1, enrollments: 1 },
          });
        if (!oldClassroom) {
          Utils.throwError(`${defaultErrorMessage}. Classroom not found`, 404);
        }
        return oldClassroom;
      },
      updatedClassroom: ['oldClassroom', async ({ oldClassroom }) => {
        const newEnrollments = oldClassroom.enrollments || [];
        oldClassroom.enrollments = _.uniq([...newEnrollments, enrollmentId]);
        return update(oldClassroom);
      }],
    });
    return updatedClassroom;
  }

  async function removeEnrollment({
    classroom,
    enrollmentId,
  }) {
    const defaultErrorMessage = 'Error removing Enrollment from Classroom';
    if (!classroom || !mongoose.isValidObjectId(classroom)) {
      Utils.throwError(`${defaultErrorMessage}. Classroom ID not sent or not a valid ID`, 400);
    }
    if (!enrollmentId || !mongoose.isValidObjectId(enrollmentId)) {
      Utils.throwError(`${defaultErrorMessage}. Enrollment ID not sent or not a valid ID`, 400);
    }
    const { updatedClassroom } = await async.auto({
      oldClassroom: async () => {
        const oldClassroom = await ClassroomRepository
          .findById({
            _id: classroom,
            select: { _id: 1, enrollments: 1 },
          });
        if (!oldClassroom) {
          Utils.throwError(`${defaultErrorMessage}. Classroom not found`, 404);
        }
        return oldClassroom;
      },
      updatedClassroom: ['oldClassroom', async ({ oldClassroom }) => {
        const newEnrollments = oldClassroom.enrollments || [];
        oldClassroom.enrollments = _.filter(newEnrollments, (_id) => !_.isEqual(_id, enrollmentId));
        return update(oldClassroom);
      }],
    });
    return updatedClassroom;
  }

  async function getClassroomTeacherAndCoordinator({ classroom }) {
    const pipeline = [
      {
        $match: {
          _id: classroom,
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subject',
        },
      },
      {
        $unwind: {
          path: '$subject',
        },
      },
      {
        $lookup: {
          from: 'curriculumgrides',
          localField: 'subject.curriculumGride',
          foreignField: '_id',
          as: 'curriculumGride',
        },
      },
      {
        $unwind: {
          path: '$curriculumGride',
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'curriculumGride.course',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: {
          path: '$course',
        },
      },
      {
        $project: {
          teacher: 1,
          coordinator: '$course.coordinator',
        },
      },
    ];

    const record = await ClassroomRepository.aggregate(pipeline);
    return _.first(record);
  }

  async function buildClassroomName({ classroom }) {
    const subject = await SubjectService.findById({ _id: _.get(classroom, 'subject') });
    const classTimes = _.get(classroom, 'classTimes');
    const classDays = _.map(classTimes, (classTime) => moment().weekday(classTime.day).format('dddd'));
    return `${_.get(subject, 'name')} - ${_.join(classDays, ' - ')}`;
  }

  async function removeBySubject({ subjectId }) {
    const classrooms = await ClassroomRepository.findAll({
      filters: { subject: subjectId },
    });
    return async.eachSeries(classrooms, remove);
  }

  async function getTeacherClassrooms({ filters }) {
    const pipeline = [
      {
        $match: {
          teacher: new ObjectId(filters?.teacher),
          deleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subject',
        },
      },
      {
        $unwind: {
          path: '$subject',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'curriculumgrides',
          localField: 'subject.curriculumGride',
          foreignField: '_id',
          as: 'curriculumGride',
        },
      },
      {
        $unwind: {
          path: '$curriculumGride',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'curriculumGride.course',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: {
          path: '$course',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    return ClassroomRepository.aggregate(pipeline);
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/classroom/repository',
  'components/subject/service',
  'components/person/service',
  'components/user/service',
  'lib/utils',
];
