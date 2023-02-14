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
    create,
    update,
    remove,
    findById,
    findAll,
    validateCoordinator,
    addCurriculumGride,
    removeCurriculumGride,
  };

  async function findAll({ filters }) {
    return CourseRepository.findAll({ filters });
  }

  async function findById({ _id }) {
    return CourseRepository.findById({ _id });
  }

  async function create(course) {
    if (!course) {
      Utils.throwError(`${defaultErrorCreating}. Course not sent`, 400);
    }
    const { createdCourse } = await async.auto({
      validatedCoordinator: async () => validateCoordinator({
        person: course.coordinator,
        defaultErrorMessage: defaultErrorCreating,
      }),
      createdCourse: ['validatedCoordinator', async () => {
        const initialFields = [
          'name',
          'description',
          'coordinator',
          'curriculumGrides',
        ];
        const newCourse = _.pick(course, initialFields);
        return CourseRepository.create(newCourse);
      }],
      updateCoordinator: ['createdCourse', async ({ createdCourse: { coordinator, _id } }) => PersonService.addCourse({
        coordinator,
        courseId: _id,
      })],
    });
    return createdCourse;
  }

  async function update(course) {
    if (_.isNil(course)) {
      Utils.throwError(`${defaultErrorUpdating}. Course not sent`, 400);
    }

    if (_.isNil(course._id)) {
      Utils.throwError(`${defaultErrorUpdating}. Course ID not sent`, 400);
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
            courseId: oldCourse._id,
          })],
          // Adding course to new coordinator
          adding: ['validatedCoordinator', async () => PersonService.addCourse({
            coordinator: course.coordinator,
            courseId: course._id,
          })],
        });
      }],
      updatedCourse: ['processingCoordinator', 'oldCourse', async ({ oldCourse }) => {
        const updatableFields = {
          name: { allowEmpty: false },
          description: { allowEmpty: true },
          coordinator: { allowEmpty: false },
          curriculumGrides: { allowEmpty: true },
        };
        _.forOwn(updatableFields, (value, field) => {
          const currentValue = course[field];
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
          oldCourse[field] = currentValue;
        });
        return CourseRepository.update(oldCourse);
      }],
    });
    return updatedCourse;
  }

  async function remove(course) {
    if (_.isNil(course)) {
      Utils.throwError(`${defaultErrorRemoving}. Course not sent`, 400);
    }

    if (_.isNil(course._id)) {
      Utils.throwError(`${defaultErrorRemoving}. Course ID not sent`, 400);
    }
    return async.auto({
      oldCourse: async () => {
        const oldCourse = await CourseRepository
          .findById({ _id: course._id });
        if (!oldCourse) {
          Utils.throwError(`${defaultErrorRemoving}. Course not found`, 404);
        }
        return oldCourse;
      },
      removeCourse: ['oldCourse', async ({ oldCourse: { _id } }) => CourseRepository.removeById({ _id })],
      updateCoordinator: ['oldCourse', 'removeCourse', async ({ oldCourse: { coordinator, _id } }) => PersonService.removeCourse({
        coordinator,
        courseId: _id,
      })],
    });
  }

  async function validateCoordinator({ person, defaultErrorMessage }) {
    return async.auto({
      coordinator: async () => {
        if (!person || !mongoose.isValidObjectId(person)) {
          Utils.throwError(`${defaultErrorMessage}. Coordinator not sent or not a valid ID`, 400);
        }
        const coordinator = await PersonService
          .findById({ _id: person });
        if (!coordinator) {
          Utils.throwError(`${defaultErrorMessage}. Coordinator not found`, 404);
        }
        return coordinator;
      },
      validatedRole: ['coordinator', async ({ coordinator: _id }) => {
        const user = await UserService
          .getByPerson(_id);
        if (!user) {
          Utils.throwError(`${defaultErrorMessage}. User not found`, 404);
        }
        if (!_.isEqual(user.role, 'teacher')) {
          Utils.throwError(`${defaultErrorMessage}. Person sent can't be coordinator`, 400);
        }
        return user;
      }],
    });
  }

  async function addCurriculumGride({
    course,
    curriculumGrideId,
  }) {
    const defaultErrorMessage = 'Error adding Curriculum Gride to Course';
    if (!course || !mongoose.isValidObjectId(course)) {
      Utils.throwError(`${defaultErrorMessage}. Course ID not sent or not a valid ID`, 400);
    }
    if (!curriculumGrideId || !mongoose.isValidObjectId(curriculumGrideId)) {
      Utils.throwError(`${defaultErrorMessage}. Curriculum Gride ID not sent or not a valid ID`, 400);
    }
    const { updatedCourse } = await async.auto({
      oldCourse: async () => {
        const oldCourse = await CourseRepository.findById({
          _id: course,
          select: { _id: 1, curriculumGrides: 1 },
        });
        if (!oldCourse) {
          Utils.throwError(`${defaultErrorMessage}. Course not found`, 404);
        }
        return oldCourse;
      },
      updatedCourse: ['oldCourse', async ({ oldCourse }) => {
        const newCurriculumGrides = oldCourse.curriculumGrides || [];
        oldCourse.curriculumGrides = _.uniq([...newCurriculumGrides, curriculumGrideId]);
        return update(oldCourse);
      }],
    });
    return updatedCourse;
  }

  async function removeCurriculumGride({
    course,
    curriculumGrideId,
  }) {
    const defaultErrorMessage = 'Error removing Curriculum Gride from Course';
    if (!course || !mongoose.isValidObjectId(course)) {
      Utils.throwError(`${defaultErrorMessage}. Course ID not sent or not a valid ID`, 400);
    }
    if (!curriculumGrideId || !mongoose.isValidObjectId(curriculumGrideId)) {
      Utils.throwError(`${defaultErrorMessage}. Curriculum Gride ID not sent or not a valid ID`, 400);
    }
    const { updatedCourse } = await async.auto({
      oldCourse: async () => {
        const oldCourse = await CourseRepository.findById({
          _id: course,
          select: { _id: 1, curriculumGrides: 1 },
        });
        if (!oldCourse) {
          Utils.throwError(`${defaultErrorMessage}. Course not found`, 404);
        }
        return oldCourse;
      },
      updatedCourse: ['oldCourse', async ({ oldCourse }) => {
        const newCurriculumGrides = oldCourse.curriculumGrides || [];
        oldCourse.curriculumGrides = _.filter(
          newCurriculumGrides,
          (_id) => !_.isEqual(_id, curriculumGrideId),
        );
        return update(oldCourse);
      }],
    });
    return updatedCourse;
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/course/repository',
  'components/person/service',
  'components/user/service',
  'lib/utils',
];
