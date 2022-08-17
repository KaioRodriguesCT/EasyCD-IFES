const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');

const defaultErrorCreating = 'Error creating course.';
const defaultErrorUpdating = 'Error updating course.';
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
  };

  // Debug purposes
  async function findAll() {
    return CourseRepository.findAll();
  }

  async function create(course) {
    if (!course) {
      Utils.throwError(`${defaultErrorCreating} Course not sent`, 400);
    }
    const { newCourse } = await async.auto({
      validatedCoordinator: async () => validateCoordinator(
        course.coordinator,
        defaultErrorCreating,
      ),
      newCourse: ['validatedCoordinator', async () => {
        const initialFields = [
          'name',
          'description',
          'coordinator',
        ];
        const newCourse = _.pick(course, initialFields);
        return CourseRepository.create(newCourse);
      }],
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
        const oldCourse = await CourseRepository.findById(course._id);
        if (!oldCourse) {
          Utils.throwError(`${defaultErrorUpdating} Course not found`, 404);
        }
        return oldCourse;
      },
      validatedCoordinator: async () => (course.coordinator
        ? validateCoordinator(course.coordinator, defaultErrorUpdating) : null),
      updatedCourse: ['validatedCoordinator', 'oldCourse', async ({ oldCourse }) => {
        const updatableFields = {
          name: { allowEmpty: false },
          description: { allowEmpty: true },
          coordinator: { allowEmpty: false },
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

  async function validateCoordinator(person, defaultErrorMessage) {
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
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/course/repository',
  'components/person/service',
  'components/user/service',
  'lib/utils',
];
