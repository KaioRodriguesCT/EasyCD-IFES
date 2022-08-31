const async = require('async');
const _ = require('lodash');

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
  };

  async function findById({ _id }) {
    return PersonRepository.findById({ _id });
  }

  async function create(person) {
    const initialFields = [
      'name',
      'email',
      'surname',
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
        const oldPerson = PersonRepository.findById({ _id: person._id });
        if (!oldPerson) {
          Utils.throwError('Error updating person. Person not Found', 404);
        }
        return oldPerson;
      },
      updatedPerson: ['oldPerson', async ({ oldPerson }) => {
        const updatableFields = {
          name: { allowEmpty: false },
          email: { allowEmpty: false },
          surname: { allowEmpty: false },
          phone: { allowEmpty: false },
          city: { allowEmpty: true },
          uf: { allowEmpty: true },
          address: { allowEmpty: true },
        };

        _.forOwn(updatableFields, (value, field) => {
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isNil(person[field]) && !allowEmpty) {
            return;
          }
          if (_.isEqual(person[field], oldPerson[field])) {
            return;
          }
          oldPerson[field] = person[field];
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
    return async.auto({
      oldCoordinator: async () => PersonRepository
        .findById({
          _id: coordinator,
          select: { _id: 1, courses: 1 },
        }),
      updatedCoordinator: ['oldCoordinator', async ({ oldCoordinator }) => {
        const newCourses = oldCoordinator.courses || [];
        oldCoordinator.courses = _.uniq([...newCourses], courseId);
        return update(oldCoordinator);
      }],
    });
  }

  async function removeCourse({
    coordinator,
    courseId,
  }) {
    return async.auto({
      oldCoordinator: async () => PersonRepository
        .findById({
          _id: coordinator,
          select: { _id: 1, courses: 1 },
        }),
      updatedCoordinator: ['oldCoordinator', async ({ oldCoordinator }) => {
        const newCourses = oldCoordinator.courses || [];
        oldCoordinator.courses = _.filter(newCourses, (_id) => !_.isEqual(_id, courseId));
        return update(oldCoordinator);
      }],
    });
  }

  async function addClassroom({
    teacher,
    classroomId,
  }) {
    return async.auto({
      oldTeacher: async () => PersonRepository
        .findById({
          _id: teacher,
          select: { _id: 1, classrooms: 1 },
        }),
      updatedTeacher: ['oldTeacher', async ({ oldTeacher }) => {
        const newClassrooms = oldTeacher.classrooms || [];
        oldTeacher.classrooms = _.uniq([...newClassrooms], classroomId);
        return update(oldTeacher);
      }],
    });
  }

  async function removeClassroom({
    teacher,
    classroomId,
  }) {
    return async.auto({
      oldTeacher: async () => PersonRepository
        .findById({
          _id: teacher,
          select: { _id: 1, classrooms: 1 },
        }),
      updatedTeacher: ['oldTeacher', async ({ oldTeacher }) => {
        const newClassrooms = oldTeacher.classrooms || [];
        oldTeacher.classrooms = _.filter(newClassrooms, (_id) => !_.isEqual(_id, classroomId));
        return update(oldTeacher);
      }],
    });
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/person/repository',
  'lib/utils',
];
