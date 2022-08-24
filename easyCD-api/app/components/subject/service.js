const _ = require('lodash');
const async = require('async');

const defaultErrorCreating = 'Error creating Subject';
const defaultErrorUpdating = 'Error updating Subject';
const defaultErrorRemoving = 'Error removing Subject';

exports = module.exports = function initService(
  SubjectRepository,
  CurriculumGrideService,
  Utils,
  Mongo,
) {
  return {
    create,
    update,
    remove,
  };

  async function create(subject) {
    if (!subject) {
      Utils.throwError(`${defaultErrorCreating}. Subject not sent`, 404);
    }
    const { newSubject } = await async.auto({
      validatedCurriculumGride: async () => validateCurriculumGride({
        curriculumGrideId: subject.curriculumGride,
        defaultErrorMessage: defaultErrorCreating,
      }),
      newSubject: ['validatedCurriculumGride', async () => {
        const initialFields = [
          'name',
          'description',
          'qtyHours',
          'externalCod',
          'curriculumGride',
        ];
        const newSubject = _.pick(subject, initialFields);
        return SubjectRepository.create(newSubject);
      }],
      updateCurriculumGride: ['newSubject', async ({ newSubject: curriculumGride, _id }) => CurriculumGrideService.addSubject({
        curriculumGride,
        subjectId: _id,
      })],
    });
    return newSubject;
  }

  async function update(subject) {
    if (_.isNil(subject)) {
      Utils.throwError(`${defaultErrorUpdating}. Subject not sent`, 400);
    }
    if (_.isNil(subject._id)) {
      Utils.throwError(`${defaultErrorUpdating}. Subject ID not sent`, 400);
    }
    const { updatedSubject } = await async.auto({
      oldSubject: async () => {
        const oldSubject = await SubjectRepository
          .findById({ _id: subject._id });
        if (oldSubject) {
          Utils.throwError(`${defaultErrorUpdating}. Subject not found`, 400);
        }
        return oldSubject;
      },
      processingCurriculumGride: ['oldSubject', async ({ oldSubject }) => {
        if (!subject.curriculumGride
            || _.isEqual(oldSubject.curriculumGride, subject.curriculumGride)) {
          return;
        }
        await async.auto({
          // Validating new curriculum gride
          validatedCurriculumGride: async () => validateCurriculumGride({
            curriculumGrideId: subject.curriculumGride,
            defaultErrorMessage: defaultErrorUpdating,
          }),
          // Removing subject from old curriculum gride
          removing: ['validatedCurriculumGride', async () => CurriculumGrideService.removeSubject({
            curriculumGride: oldSubject.curriculumGride,
            subjectId: oldSubject._id,
          })],
          // Adding subject to new curriculum gride
          adding: ['validatedCurriculumGride', async () => CurriculumGrideService.addSubject({
            curriculumGride: subject.curriculumGride,
            subjectId: subject._id,
          })],
        });
      }],
      updatedSubject: ['processingCurriculumGride', 'oldSubject', async ({ oldSubject }) => {
        const updatableFields = {
          name: { allowEmpty: false },
          description: { allowEmpty: true },
          qtyHours: { allowEmpty: false },
          externalCod: { allowEmpty: true },
          curriculumGride: { allowEmpty: false },
        };
        _.forOwn(updatableFields, (value, field) => {
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isNil(subject[field]) && !allowEmpty) {
            return;
          }
          if (_.isEqual(subject[field], oldSubject[field])) {
            return;
          }
          oldSubject[field] = subject[field];
        });
        return SubjectRepository.update(oldSubject);
      }],
    });
    return updatedSubject;
  }

  async function remove(subject) {
    if (_.isNil(subject)) {
      Utils.throwError(`${defaultErrorRemoving}. Subject not sent`, 400);
    }
    if (_.isNil(subject._id)) {
      Utils.throwError(`${defaultErrorRemoving}. Subject ID not sent`, 400);
    }
    const session = await Mongo.startSession();
    session.startTransaction();
    try {
      await async.auto({
        subject: async () => {
          const subject = await SubjectRepository
            .findById({ _id: subject._id });
          if (!subject) {
            Utils.throwError(`${defaultErrorRemoving}. Subject not found`, 404);
          }
          return subject;
        },
        removeSubject: ['subject', async () => SubjectRepository.removeById(subject._id)],
        updateCurriculumGride: ['subject', 'removeSubject', async ({ subject }) => CurriculumGrideService.removeSubject({
          curriculumGride: subject.curriculumGride,
          subjectId: subject._id,
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

  async function validateCurriculumGride({
    curriculumGrideId,
    defaultErrorMessage,
  }) {
    if (!curriculumGrideId) {
      Utils.throwError(`${defaultErrorMessage}. Curriculum Gride not sent`, 400);
    }
    const curriculumGride = await CurriculumGrideService.findById({ _id: curriculumGrideId });
    if (!curriculumGride) {
      Utils.throwError(`${defaultErrorMessage}. Curriculum Gride not found`, 404);
    }
    return curriculumGride;
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/subject/repository',
  'components/curriculum-gride/service',
  'lib/utils',
  'lib/mongo',
];
