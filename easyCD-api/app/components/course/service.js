const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');

const defaultErrorCreating = 'Error creating course';
const defaultErrorUpdating = 'Error updating course';
const defaultErrorRemoving = 'Error removing course';

exports = module.exports = function initService(
  CourseRepository,
  PersonService,
  UserService,
  Utils,
) {
  return {
    findAll,
    create,
    update,
    remove,
    findById,
    addCurriculumGride,
    removeCurriculumGride,
  };

  // Debug purposes
  async function findAll() {
    return CourseRepository.findAll();
  }

  async function findById({ _id }) {
    return CourseRepository.findById({ _id });
  }

  async function create(course) {
    if (!course) {
      Utils.throwError(`${defaultErrorCreating}. Course not sent`, 400);
    }
    const { newCourse } = await async.auto({
      validatedCoordinator: async () => validateCoordinator({
        person: course.coordinator,
        defaultErrorMessage: defaultErrorCreating,
      }),
      newCourse: ['validatedCoordinator', async () => {
        const initialFields = [
          'name',
          'description',
          'coordinator',
        ];
        const newCourse = _.pick(course, initialFields);
        return CourseRepository.create(newCourse);
      }],
      updateCoordinator: ['newCourse', async ({ newCourse: coordinator, _id }) => PersonService.addCourse({
        coordinator,
        courseId: _id,
      })],
    });
    return newCourse;
  }

  async function update(course) {
    if (_.isNil(course)) {
      Utils.throwError(`${defaultErrorUpdating} Course not sent`, 400);
    }

    if (_.isNil(course._id)) {
      Utils.throwError(`${defaultErrorUpdating} Course ID not sent`, 400);
    }
    const { updatedCourse } = await async.auto({
      oldCourse: async () => {
        const oldCourse = await CourseRepository
          .findById({ _id: course._id });
        if (!oldCourse) {
          Utils.throwError(`${defaultErrorUpdating} Course not found`, 404);
        }
        return oldCourse;
      },
      validatedCoordinator: async () => (course.coordinator
        ? validateCoordinator({
          person: course.coordinator,
          defaultErrorMessage: defaultErrorUpdating,
        }) : null),
      processingCoordinator: ['oldCourse', async ({ oldCourse }) => {
        if (!course.coordinator
          || _.isEqual(oldCourse.coordinator, course.coordinator)) {
          return;
        }
        await async.auto({
          // Validating new coordinator
          validatedCoordinator: async () => validateCoordinator({
            person: course.coordinator,
            defaultErrorMessage: defaultErrorUpdating,
          }),
          // Removing course from old coordinator
          removing: ['validatedCoordinator', async () => PersonService.removeCourse({
            coordinator: oldCourse.coordinator,
            coursseId: oldCourse._id,
          })],
          // Adding course to new coordinator
          adding: ['validatedCoordinator', async () => PersonService.addCourse({
            coordinator: course.coordinator,
            coursseId: course._id,
          })],
        });
      }],
      updatedCourse: ['validatedCoordinator', 'oldCourse', async ({ oldCourse }) => {
        const updatableFields = {
          name: { allowEmpty: false },
          description: { allowEmpty: true },
          coordinator: { allowEmpty: false },
          curriculumGrides: { allowEmpty: true },
        };
        _.forOwn(updatableFields, (value, field) => {
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isNil(course[field]) && !allowEmpty) {
            return;
          }
          if (_.isEqual(course[field], oldCourse[field])) {
            return;
          }
          oldCourse[field] = course[field];
        });
        return CourseRepository.update(oldCourse);
      }],
    });
    return updatedCourse;
  }

  async function remove(course) {
    if (_.isNil(course)) {
      Utils.throwError(`${defaultErrorRemoving} Course not sent`, 400);
    }

    if (_.isNil(course._id)) {
      Utils.throwError(`${defaultErrorRemoving} Course ID not sent`, 400);
    }
    return CourseRepository.removeById(course._id);
  }

  async function validateCoordinator({ person, defaultErrorMessage }) {
    return async.auto({
      coordinator: async () => {
        if (!person || !mongoose.isValidObjectId(person)) {
          Utils.throwError(`${defaultErrorMessage} Coordinator not sent or not a valid ID`, 400);
        }
        const coordinator = await PersonService
          .findById(person);
        if (!coordinator) {
          Utils.throwError(`${defaultErrorMessage} Coordinator not found`, 404);
        }
        return coordinator;
      },
      validatedRole: ['coordinator', async ({ coordinator }) => {
        const user = await UserService
          .findByPerson(coordinator._id);
        if (!user) {
          Utils.throwError(`${defaultErrorMessage} User not found`, 404);
        }
        if (!_.isEqual(user.role, 'teacher')) {
          Utils.throwError(`${defaultErrorMessage} Person sent can't be coordinator`, 400);
        }
        return user;
      }],
    });
  }

  async function addCurriculumGride({ course, curriculumGrideId }) {
    return async.auto({
      course: async () => CourseRepository.findById({
        _id: course,
        select: { _id: 1, curriculumGrides: 1 },
      }),
      updatedCourse: ['course', async ({ course }) => {
        const newCurriculumGrides = course.curriculumGrides || [];
        course.curriculumGrides = _.uniq([...newCurriculumGrides], curriculumGrideId);
        return update(course);
      }],
    });
  }

  async function removeCurriculumGride({ course, curriculumGrideId }) {
    return async.auto({
      course: async () => CourseRepository.findById({
        _id: course,
        select: { _id: 1, curriculumGrides: 1 },
      }),
      updatedCourse: ['course', async ({ course }) => {
        const newCurriculumGrides = course.curriculumGrides || [];
        course.curriculumGrides = _.filters(
          newCurriculumGrides,
          (_id) => !_.isEqual(_id, curriculumGrideId),
        );
        return update(course);
      }],
    });
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/course/repository',
  'components/person/service',
  'components/user/service',
  'lib/utils',
];
