const async = require('async');
const _ = require('lodash');
const mongoose = require('mongoose');

exports = module.exports = function initService(
  PersonRepository,
  Utils,
) {
  return {
    findById,
    create,
    update,
    remove,
    addCourse,
    removeCourse,
    addClassroom,
    removeClassroom,
    addEnrollment,
    removeEnrollment,
    addComplementaryActivity,
    removeComplementaryActivity,
    addSolicitation,
    removeSolicitation,
  };

  async function findById({ _id }) {
    return PersonRepository.findById({ _id });
  }

  async function create(person) {
    const initialFields = [
      'name',
      'surname',
      'email',
      'phone',
      'city',
      'uf',
      'address',
    ];
    const newPerson = _.pick(person, initialFields);
    return PersonRepository.create(newPerson);
  }

  async function update(person) {
    if (_.isNil(person)) {
      Utils.throwError('Error updating person. Person not sent', 400);
    }
    if (_.isNil(person._id)) {
      Utils.throwError('Error updating person. Person ID not sent', 400);
    }
    const { updatedPerson } = await async.auto({
      oldPerson: async () => {
        const oldPerson = await PersonRepository.findById({ _id: person._id });
        if (!oldPerson) {
          Utils.throwError('Error updating person. Person not Found', 404);
        }
        return oldPerson;
      },
      updatedPerson: ['oldPerson', async ({ oldPerson }) => {
        const updatableFields = {
          name: { allowEmpty: false },
          surname: { allowEmpty: false },
          email: { allowEmpty: false },
          phone: { allowEmpty: false },
          city: { allowEmpty: true },
          uf: { allowEmpty: true },
          address: { allowEmpty: true },
          courses: { allowEmpty: true },
          classrooms: { allowEmpty: true },
          enrollments: { allowEmpty: true },
          complementaryActivities: { allowEmpty: true },
          solicitations: { allowEmpty: true },
        };
        _.forOwn(updatableFields, (value, field) => {
          const currentValue = person[field];
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
          oldPerson[field] = currentValue;
        });
        return PersonRepository.update(oldPerson);
      }],
    });
    return updatedPerson;
  }

  async function remove(person) {
    if (_.isNil(person)) {
      Utils.throwError('Error removing person. Person not sent', 400);
    }
    if (_.isNil(person._id)) {
      Utils.throwError('Error removing person. Person ID not sent', 400);
    }
    return PersonRepository.removeById(person._id);
  }

  async function addCourse({
    coordinator,
    courseId,
  }) {
    const defaultErrorMessage = 'Error adding course to Coordinator';
    if (!coordinator || !mongoose.isValidObjectId(coordinator)) {
      Utils.throwError(`${defaultErrorMessage}. Coordinator ID not sent or not a valid ID`, 400);
    }
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      Utils.throwError(`${defaultErrorMessage}. Course ID not sent or not a valid ID`, 400);
    }
    const { updatedCoordinator } = await async.auto({
      oldCoordinator: async () => {
        const oldCoordinator = await PersonRepository
          .findById({
            _id: coordinator,
            select: { _id: 1, courses: 1 },
          });
        if (!oldCoordinator) {
          Utils.throwError(`${defaultErrorMessage}. Coordinator not found`, 404);
        }
        return oldCoordinator;
      },
      updatedCoordinator: ['oldCoordinator', async ({ oldCoordinator }) => {
        const newCourses = oldCoordinator.courses || [];
        oldCoordinator.courses = _.uniq([...newCourses, courseId]);
        return update(oldCoordinator);
      }],
    });
    return updatedCoordinator;
  }

  async function removeCourse({
    coordinator,
    courseId,
  }) {
    const defaultErrorMessage = 'Error removing course from Coordinator';
    if (!coordinator || !mongoose.isValidObjectId(coordinator)) {
      Utils.throwError(`${defaultErrorMessage}. Coordinator ID not sent or not a valid ID`, 400);
    }
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      Utils.throwError(`${defaultErrorMessage}. Course ID not sent or not a valid ID`, 400);
    }
    const { updatedCoordinator } = await async.auto({
      oldCoordinator: async () => {
        const oldCoordinator = await PersonRepository
          .findById({
            _id: coordinator,
            select: { _id: 1, courses: 1 },
          });
        if (!oldCoordinator) {
          Utils.throwError(`${defaultErrorMessage}. Coordinator not found`, 404);
        }
        return oldCoordinator;
      },
      updatedCoordinator: ['oldCoordinator', async ({ oldCoordinator }) => {
        const newCourses = oldCoordinator.courses || [];
        oldCoordinator.courses = _.filter(newCourses, (_id) => !_.isEqual(_id, courseId));
        return update(oldCoordinator);
      }],
    });
    return updatedCoordinator;
  }

  async function addClassroom({
    teacher,
    classroomId,
  }) {
    const defaultErrorMessage = 'Error adding classroom to Teacher';
    if (!teacher || !mongoose.isValidObjectId(teacher)) {
      Utils.throwError(`${defaultErrorMessage}. Teacher ID not sent or not a valid ID`, 400);
    }
    if (!classroomId || !mongoose.isValidObjectId(classroomId)) {
      Utils.throwError(`${defaultErrorMessage}. Classroom ID not sent or not a valid ID`, 400);
    }
    const { updatedTeacher } = await async.auto({
      oldTeacher: async () => {
        const oldTeacher = await PersonRepository
          .findById({
            _id: teacher,
            select: { _id: 1, classrooms: 1 },
          });
        if (!oldTeacher) {
          Utils.throwError(`${defaultErrorMessage}. Teacher not found`, 404);
        }
        return oldTeacher;
      },
      updatedTeacher: ['oldTeacher', async ({ oldTeacher }) => {
        const newClassrooms = oldTeacher.classrooms || [];
        oldTeacher.classrooms = _.uniq([...newClassrooms, classroomId]);
        return update(oldTeacher);
      }],
    });
    return updatedTeacher;
  }

  async function removeClassroom({
    teacher,
    classroomId,
  }) {
    const defaultErrorMessage = 'Error removing classroom from Teacher';
    if (!teacher || !mongoose.isValidObjectId(teacher)) {
      Utils.throwError(`${defaultErrorMessage}. Teacher ID not sent or not a valid ID`, 400);
    }
    if (!classroomId || !mongoose.isValidObjectId(classroomId)) {
      Utils.throwError(`${defaultErrorMessage}. Classroom ID not sent or not a valid ID`, 400);
    }
    const { updatedTeacher } = await async.auto({
      oldTeacher: async () => {
        const oldTeacher = await PersonRepository
          .findById({
            _id: teacher,
            select: { _id: 1, classrooms: 1 },
          });
        if (!oldTeacher) {
          Utils.throwError(`${defaultErrorMessage}. Teacher not found`, 404);
        }
        return oldTeacher;
      },
      updatedTeacher: ['oldTeacher', async ({ oldTeacher }) => {
        const newClassrooms = oldTeacher.classrooms || [];
        oldTeacher.classrooms = _.filter(newClassrooms, (_id) => !_.isEqual(_id, classroomId));
        return update(oldTeacher);
      }],
    });
    return updatedTeacher;
  }

  async function addEnrollment({
    student,
    enrollmentId,
  }) {
    const defaultErrorMessage = 'Error adding enrollment to Student';
    if (!student || !mongoose.isValidObjectId(student)) {
      Utils.throwError(`${defaultErrorMessage}. Student ID not sent or not a valid ID`, 400);
    }
    if (!enrollmentId || !mongoose.isValidObjectId(enrollmentId)) {
      Utils.throwError(`${defaultErrorMessage}. Enrollment ID not sent or not a valid ID`, 400);
    }
    const { updatedStudent } = await async.auto({
      oldStudent: async () => {
        const oldStudent = await PersonRepository
          .findById({
            _id: student,
            select: { _id: 1, enrollments: 1 },
          });
        if (!oldStudent) {
          Utils.throwError(`${defaultErrorMessage}. Student not found`, 404);
        }
        return oldStudent;
      },
      updatedStudent: ['oldStudent', async ({ oldStudent }) => {
        const newEnrollments = oldStudent.enrollments || [];
        oldStudent.enrollments = _.uniq([...newEnrollments, enrollmentId]);
        return update(oldStudent);
      }],
    });
    return updatedStudent;
  }

  async function removeEnrollment({
    student,
    enrollmentId,
  }) {
    const defaultErrorMessage = 'Error removing enrollment from Student';
    if (!student || !mongoose.isValidObjectId(student)) {
      Utils.throwError(`${defaultErrorMessage}. Student ID not sent or not a valid ID`, 400);
    }
    if (!enrollmentId || !mongoose.isValidObjectId(enrollmentId)) {
      Utils.throwError(`${defaultErrorMessage}. Enrollment ID not sent or not a valid ID`, 400);
    }
    const { updatedStudent } = await async.auto({
      oldStudent: async () => {
        const oldStudent = await PersonRepository
          .findById({
            _id: student,
            select: { _id: 1, enrollments: 1 },
          });
        if (!oldStudent) {
          Utils.throwError(`${defaultErrorMessage}. Student not found`, 404);
        }
        return oldStudent;
      },
      updatedStudent: ['oldStudent', async ({ oldStudent }) => {
        const newEnrollments = oldStudent.enrollments || [];
        oldStudent.enrollments = _.filter(newEnrollments, (_id) => !_.isEqual(_id, enrollmentId));
        return update(oldStudent);
      }],
    });
    return updatedStudent;
  }

  async function addComplementaryActivity({
    student,
    complementaryActivityId,
  }) {
    const defaultErrorMessage = 'Error adding complementary activity to Student';
    if (!student || !mongoose.isValidObjectId(student)) {
      Utils.throwError(`${defaultErrorMessage}. Student ID not sent or not a valid ID`, 400);
    }
    if (!complementaryActivityId || !mongoose.isValidObjectId(complementaryActivityId)) {
      Utils.throwError(`${defaultErrorMessage}. Complementary Activity ID not sent or not a valid ID`, 400);
    }
    const { updatedStudent } = await async.auto({
      oldStudent: async () => {
        const oldStudent = await PersonRepository
          .findById({
            _id: student,
            select: { _id: 1, complementaryActivities: 1 },
          });
        if (!oldStudent) {
          Utils.throwError(`${defaultErrorMessage}. Student not found`, 404);
        }
        return oldStudent;
      },
      updatedStudent: ['oldStudent', async ({ oldStudent }) => {
        const newComplementaryActivities = oldStudent.complementaryActivities || [];
        oldStudent.complementaryActivities = _.uniq(
          [...newComplementaryActivities, complementaryActivityId],
        );
        return update(oldStudent);
      }],
    });
    return updatedStudent;
  }

  async function removeComplementaryActivity({
    student,
    complementaryActivityId,
  }) {
    const defaultErrorMessage = 'Error removing complementary activity from Student';
    if (!student || !mongoose.isValidObjectId(student)) {
      Utils.throwError(`${defaultErrorMessage}. Student ID not sent or not a valid ID`, 400);
    }
    if (!complementaryActivityId || !mongoose.isValidObjectId(complementaryActivityId)) {
      Utils.throwError(`${defaultErrorMessage}. Complementary Activity ID not sent or not a valid ID`, 400);
    }
    const { updatedStudent } = await async.auto({
      oldStudent: async () => {
        const oldStudent = await PersonRepository
          .findById({
            _id: student,
            select: { _id: 1, complementaryActivities: 1 },
          });
        if (!oldStudent) {
          Utils.throwError(`${defaultErrorMessage}. Student not found`, 404);
        }
        return oldStudent;
      },
      updatedStudent: ['oldStudent', async ({ oldStudent }) => {
        const newComplementaryActivities = oldStudent.complementaryActivities || [];
        oldStudent.complementaryActivities = _.filter(
          newComplementaryActivities,
          (_id) => !_.isEqual(_id, complementaryActivityId),
        );
        return update(oldStudent);
      }],
    });
    return updatedStudent;
  }

  async function addSolicitation({
    person,
    solicitationId,
  }) {
    const defaultErrorMessage = 'Error adding solicitation to Person';
    if (!person || !mongoose.isValidObjectId(person)) {
      Utils.throwError(`${defaultErrorMessage}. Person ID not sent or not a valid ID`, 400);
    }
    if (!solicitationId || !mongoose.isValidObjectId(solicitationId)) {
      Utils.throwError(`${defaultErrorMessage}. Solicitation ID not sent or not a valid ID`, 400);
    }
    const { updatedPerson } = await async.auto({
      oldPerson: async () => {
        const oldPerson = await PersonRepository
          .findById({
            _id: person,
            select: { _id: 1, solicitations: 1 },
          });
        if (!oldPerson) {
          Utils.throwError(`${defaultErrorMessage}. Person not found`, 404);
        }
        return oldPerson;
      },
      updatedPerson: ['oldPerson', async ({ oldPerson }) => {
        const newSolicitations = oldPerson.solicitations || [];
        oldPerson.solicitations = _.uniq([...newSolicitations, solicitationId]);
        return update(oldPerson);
      }],
    });
    return updatedPerson;
  }

  async function removeSolicitation({
    person,
    solicitationId,
  }) {
    const defaultErrorMessage = 'Error removing solicitation from Person';
    if (!person || !mongoose.isValidObjectId(person)) {
      Utils.throwError(`${defaultErrorMessage}. Person ID not sent or not a valid ID`, 400);
    }
    if (!solicitationId || !mongoose.isValidObjectId(solicitationId)) {
      Utils.throwError(`${defaultErrorMessage}. Solicitation ID not sent or not a valid ID`, 400);
    }
    const { updatedPerson } = await async.auto({
      oldPerson: async () => {
        const oldPerson = await PersonRepository
          .findById({
            _id: person,
            select: { _id: 1, solicitations: 1 },
          });
        if (!oldPerson) {
          Utils.throwError(`${defaultErrorMessage}. Person not found`, 404);
        }
        return oldPerson;
      },
      updatedPerson: ['oldPerson', async ({ oldPerson }) => {
        const newSolicitations = oldPerson.solicitations || [];
        oldPerson.solicitations = _.filter(
          newSolicitations,
          (_id) => !_.isEqual(_id, solicitationId),
        );
        return update(oldPerson);
      }],
    });
    return updatedPerson;
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/person/repository',
  'lib/utils',
];
