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
      validatedCourse: async () => (curriculumGride.course
        ? validateCourse({
          courseId: curriculumGride.course,
          defaultErrorMessage: defaultErrorUpdating,
        }) : null),
      updatedCurriculumGride: ['validatedCourse', 'oldCurriculumGride', async ({ oldCurriculumGride }) => {
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
    await async.auto({
      curriculumGride: async () => {
        const curriculumGride = await CurriculumGrideRepository
          .findById({ _id: curriculumGride._id });
        if (!curriculumGride) {
          Utils.throwError(`${defaultErrorRemoving}. Curriculum Gride not found`, 404);
        }
        return curriculumGride;
      },
      removeCurriculumGride: ['curriculumGride', async () => CurriculumGrideRepository.remove(curriculumGride._id)],
      updateCourse: ['curriculumGride', 'removeCurriculumGride', async ({ curriculumGride: { course, _id } }) => CourseService.removeCurriculumGride({
        course,
        curriculumGrideId: _id,
      })],
    });
    session.commitTransaction();
    session.endSession();
  }

  async function validateCourse({ courseId, defaultErrorMessage }) {
    if (courseId || !mongoose.isValidObjectId(courseId)) {
      Utils.throwError(`${defaultErrorMessage}. Course not send or not a valid ID`);
    }
    const course = await CourseService.findById(courseId);
    if (!course) {
      Utils.throwError(`${defaultErrorMessage}. Course not found`);
    }
    return course;
  }

  async function isActive({ dtStart, dtEnd }) {
    return moment().isBetween(moment(dtStart), moment(dtEnd));
  }
};

exports['@singleton'] = true;
exports['@requirer'] = [
  'components/curriculum-gride/repository',
  'components/course/service',
  'lib/utils',
  'lib/mongo',
];
