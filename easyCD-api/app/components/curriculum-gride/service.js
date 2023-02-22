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
) {
  return {
    create,
    update,
    remove,
    findById,
    findAll,
    addSubject,
    removeSubject,
    validateCourse,
  };

  async function findAll({ filters }) {
    return CurriculumGrideRepository.findAll({ filters });
  }

  async function findById({ _id }) {
    return CurriculumGrideRepository.findById({ _id });
  }

  async function create(curriculumGride) {
    if (!curriculumGride) {
      Utils.throwError(`${defaultErrorCreating}. Curriculum Gride not sent`, 400);
    }
    const { createdCurriculumGride } = await async.auto({
      validatedCourse: async () => validateCourse({
        courseId: curriculumGride.course,
        defaultErrorMessage: defaultErrorCreating,
      }),
      createdCurriculumGride: ['validatedCourse', async () => {
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
      updateCourse: ['createdCurriculumGride', async ({ createdCurriculumGride: { course, _id } }) => CourseService.addCurriculumGride({
        course,
        curriculumGrideId: _id,
      })],
    });
    return createdCurriculumGride;
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
          || _.isEqual(String(oldCurriculumGride.course), curriculumGride.course)) {
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
          subjects: { allowEmpty: true },
        };
        _.forOwn(updatableFields, (value, field) => {
          const currentValue = curriculumGride[field];
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
          oldCurriculumGride[field] = currentValue;
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
    await async.auto({
      oldCurriculumGride: async () => {
        const oldCurriculumGride = await CurriculumGrideRepository
          .findById({ _id: curriculumGride._id });
        if (!oldCurriculumGride) {
          Utils.throwError(`${defaultErrorRemoving}. Curriculum Gride not found`, 404);
        }
        return oldCurriculumGride;
      },
      removeCurriculumGride: ['oldCurriculumGride', async ({ oldCurriculumGride: { _id } }) => CurriculumGrideRepository.removeById(_id)],
      updateCourse: ['oldCurriculumGride', 'removeCurriculumGride', async ({ oldCurriculumGride: { course, _id } }) => CourseService.removeCurriculumGride({
        course,
        curriculumGrideId: _id,
      })],
    });
  }

  async function validateCourse({ courseId, defaultErrorMessage }) {
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      Utils.throwError(`${defaultErrorMessage}. Course not sent or not a valid ID`, 400);
    }
    const course = await CourseService.findById({ _id: courseId });
    if (!course) {
      Utils.throwError(`${defaultErrorMessage}. Course not found`, 404);
    }
    return course;
  }

  function isActive({ dtStart, dtEnd }) {
    return moment().isBetween(moment(dtStart), moment(dtEnd));
  }

  async function addSubject({
    curriculumGride,
    subjectId,
  }) {
    const defaultErrorMessage = 'Error adding Subject to Curriculum Gride';
    if (!curriculumGride || !mongoose.isValidObjectId(curriculumGride)) {
      Utils.throwError(`${defaultErrorMessage}. Curriculum gride ID not sent or not a valid ID`, 400);
    }
    if (!subjectId || !mongoose.isValidObjectId(subjectId)) {
      Utils.throwError(`${defaultErrorMessage}. Subject ID not sent or not a valid ID`, 400);
    }
    const { updatedCurriculumGride } = await async.auto({
      oldGride: async () => {
        const oldGride = await CurriculumGrideRepository
          .findById({
            _id: curriculumGride,
            select: { _id: 1, subjects: 1 },
          });
        if (!oldGride) {
          Utils.throwError(`${defaultErrorMessage}. Curriculum Gride not found`, 404);
        }
        return oldGride;
      },
      updatedCurriculumGride: ['oldGride', async ({ oldGride }) => {
        const newSubjects = oldGride.subjects || [];
        oldGride.subjects = _.uniq([...newSubjects, subjectId]);
        return update(oldGride);
      }],
    });
    return updatedCurriculumGride;
  }

  async function removeSubject({
    curriculumGride,
    subjectId,
  }) {
    const defaultErrorMessage = 'Error removing Subject from Curriculum Gride';
    if (!curriculumGride || !mongoose.isValidObjectId(curriculumGride)) {
      Utils.throwError(`${defaultErrorMessage}. Curriculum gride ID not sent or not a valid ID`, 400);
    }
    if (!subjectId || !mongoose.isValidObjectId(subjectId)) {
      Utils.throwError(`${defaultErrorMessage}. Subject ID not sent or not a valid ID`, 400);
    }
    const { updatedCurriculumGride } = await async.auto({
      oldGride: async () => {
        const oldGride = await CurriculumGrideRepository
          .findById({
            _id: curriculumGride,
            select: { _id: 1, subjects: 1 },
          });
        if (!oldGride) {
          Utils.throwError(`${defaultErrorMessage}. Curriculum Gride not found`, 404);
        }
        return oldGride;
      },
      updatedCurriculumGride: ['oldGride', async ({ oldGride }) => {
        const newSubjects = oldGride.subjects || [];
        oldGride.subjects = _.filter(newSubjects, (_id) => !_.isEqual(_id, subjectId));
        return update(oldGride);
      }],
    });
    return updatedCurriculumGride;
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/curriculum-gride/repository',
  'components/course/service',
  'lib/utils',
];
