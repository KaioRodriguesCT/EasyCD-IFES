const _ = require('lodash');
const async = require('async');
const moment = require('moment');
const mongoose = require('mongoose');

const defaultErrorCreating = 'Error creating Curriculum Gride';
const defaultErrorUpdating = 'Error updating Curriculum Gride';
const defaultErrorRemoving = 'Error removing Curriculum Gride';
exports = module.exports = function initService(
  CurriculumGrideRepository,
  CourseService,
  Utils,
  Mongo,
) {
  return {
    create,
    update,
    remove,
    findById,
    addSubject,
    removeSubject,
  };

  async function create(curriculumGride) {
    if (!curriculumGride) {
      Utils.throwError(`${defaultErrorCreating}. Curriculum Gride not sent`, 400);
    }
    const { newCurriculumGride } = await async.auto({
      validatedCourse: async () => validateCourse({
        courseId: curriculumGride.course,
        defaultErrorMessage: defaultErrorCreating,
      }),
      newCurriculumGride: ['validatedCourse', async () => {
        const initialFields = [
          'name',
          'dtStart',
          'dtEnd',
          'course',
        ];
        const newCurriculumGride = _.pick(curriculumGride, initialFields);
        // Setting the isActive based on the dates
        newCurriculumGride.isActive = isActive(newCurriculumGride);
        return CurriculumGrideRepository.create(newCurriculumGride);
      }],
      updateCourse: ['newCurriculumGride', async ({ newCurriculumGride: { course, _id } }) => CourseService.addCurriculumGride({
        course,
        curriculumGrideId: _id,
      })],
    });
    return newCurriculumGride;
  }

  async function update(curriculumGride) {
    if (_.isNil(curriculumGride)) {
      Utils.throwError(`${defaultErrorUpdating}. Curriculum Gride not sent`, 400);
    }
    if (_.isNil(curriculumGride._id)) {
      Utils.throwError(`${defaultErrorUpdating}. Curriculum Gride ID not sent`, 400);
    }
    const { updatedCurriculumGride } = await async.auto({
      oldCurriculumGride: async () => {
        const oldCurriculumGride = await CurriculumGrideRepository
          .findById({ _id: curriculumGride._id });
        if (!oldCurriculumGride) {
          Utils.throwError(`${defaultErrorUpdating}. Curriculum Gride not found`, 404);
        }
        return oldCurriculumGride;
      },
      processingCourse: ['oldCurriculumGride', async ({ oldCurriculumGride }) => {
        if (!curriculumGride.course
          || _.isEqual(oldCurriculumGride.course, curriculumGride.course)) {
          return;
        }
        await async.auto({
          // Validating new course
          validatedCourse: async () => validateCourse({
            courseId: curriculumGride.course,
            defaultErrorMessage: defaultErrorUpdating,
          }),
          // Removing curriculum gride from old course
          removing: ['validatedCourse', async () => CourseService.removeCurriculumGride({
            course: oldCurriculumGride.course,
            curriculumGrideId: oldCurriculumGride._id,
          })],
          // Adding curriculum gride to new course
          adding: ['validatedCourse', async () => CourseService.addCurriculumGride({
            course: curriculumGride.course,
            curriculumGrideId: curriculumGride._id,
          })],
        });
      }],
      updatedCurriculumGride: ['processingCourse', 'oldCurriculumGride', async ({ oldCurriculumGride }) => {
        const updatableFields = {
          name: { allowEmpty: false },
          dtStart: { allowEmpty: false },
          dtEnd: { allowEmpty: false },
          course: { allowEmpty: false },
        };
        _.forOwn(updatableFields, (value, field) => {
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isNil(curriculumGride[field]) && !allowEmpty) {
            return;
          }
          if (_.isEqual(curriculumGride[field], oldCurriculumGride[field])) {
            return;
          }
          oldCurriculumGride[field] = curriculumGride[field];
        });
        return CurriculumGrideRepository.update((oldCurriculumGride));
      }],
    });
    return updatedCurriculumGride;
  }

  async function remove(curriculumGride) {
    if (_.isNil(curriculumGride)) {
      Utils.throwError(`${defaultErrorRemoving}. Curriculum Gride not sent`, 400);
    }
    if (_.isNil(curriculumGride._id)) {
      Utils.throwError(`${defaultErrorRemoving}. Curriculum Gride ID not sent`, 400);
    }
    const session = await Mongo.startSession();
    session.startTransaction();
    try {
      await async.auto({
        curriculumGride: async () => {
          const curriculumGride = await CurriculumGrideRepository
            .findById({ _id: curriculumGride._id });
          if (!curriculumGride) {
            Utils.throwError(`${defaultErrorRemoving}. Curriculum Gride not found`, 404);
          }
          return curriculumGride;
        },
        removeCurriculumGride: ['curriculumGride', async () => CurriculumGrideRepository.removeById(curriculumGride._id)],
        updateCourse: ['curriculumGride', 'removeCurriculumGride', async ({ curriculumGride }) => CourseService.removeCurriculumGride({
          course: curriculumGride.course,
          curriculumGrideId: curriculumGride._id,
        })],
      });
      await session.commitTransaction();
    } catch (e) {
      console.error(e);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }

  async function validateCourse({ courseId, defaultErrorMessage }) {
    if (courseId || !mongoose.isValidObjectId(courseId)) {
      Utils.throwError(`${defaultErrorMessage}. Course not send or not a valid ID`);
    }
    const course = await CourseService.findById({ _id: courseId });
    if (!course) {
      Utils.throwError(`${defaultErrorMessage}. Course not found`);
    }
    return course;
  }

  async function isActive({ dtStart, dtEnd }) {
    return moment().isBetween(moment(dtStart), moment(dtEnd));
  }

  async function findById({ _id }) {
    return CurriculumGrideRepository.findById({ _id });
  }

  async function addSubject({
    curriculumGride,
    subjectId,
  }) {
    return async.auto({
      curriculumGride: async () => CurriculumGrideRepository
        .findById({
          _id: curriculumGride,
          select: { _id: 1, subjects: 1 },
        }),
      updatedCurriculumGride: ['curriculumGride', async ({ curriculumGride }) => {
        const newSubjects = curriculumGride.subjects || [];
        curriculumGride.subjects = _.uniq([...newSubjects], subjectId);
        return update(curriculumGride);
      }],
    });
  }

  async function removeSubject({
    curriculumGride,
    subjectId,
  }) {
    return async.auto({
      curriculumGride: async () => CurriculumGrideRepository
        .findById({
          _id: curriculumGride,
          select: { _id: 1, subjects: 1 },
        }),
      updatedCurriculumGride: ['curriculumGride', async ({ curriculumGride }) => {
        const newSubjects = curriculumGride.subjects || [];
        curriculumGride.subjects = _.filter(newSubjects, (_id) => !_.isEqual(_id, subjectId));
        return update(curriculumGride);
      }],
    });
  }
};

exports['@singleton'] = true;
exports['@requirer'] = [
  'components/curriculum-gride/repository',
  'components/course/service',
  'lib/utils',
  'lib/mongo',
];
