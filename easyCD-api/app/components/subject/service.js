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
    addClassroom,
    removeClassroom,
    findById,
  };

  async function findById({ _id, select }) {
    return SubjectRepository.findById({ _id, select });
  }
  async function create(subject) {
    if (!subject) {
      Utils.throwError(`${defaultErrorCreating}. Subject not sent`, 400);
    }
    const { createdSubject } = await async.auto({
      validatedCurriculumGride: async () => validateCurriculumGride({
        curriculumGrideId: subject.curriculumGride,
        defaultErrorMessage: defaultErrorCreating,
      }),
      createdSubject: ['validatedCurriculumGride', async () => {
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
      updateCurriculumGride: ['createdSubject', async ({ createdSubject: curriculumGride, _id }) => CurriculumGrideService.addSubject({
        curriculumGride,
        subjectId: _id,
      })],
    });
    return createdSubject;
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
        if (!oldSubject) {
          Utils.throwError(`${defaultErrorUpdating}. Subject not found`, 404);
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
        oldSubject: async () => {
          const oldSubject = await SubjectRepository
            .findById({ _id: subject._id });
          if (!subject) {
            Utils.throwError(`${defaultErrorRemoving}. Subject not found`, 404);
          }
          return oldSubject;
        },
        removeSubject: ['oldSubject', async ({ oldSubject }) => SubjectRepository.removeById(oldSubject._id)],
        updateCurriculumGride: ['oldSubject', 'removeSubject', async ({ oldSubject }) => CurriculumGrideService.removeSubject({
          curriculumGride: subject.curriculumGride,
          subjectId: oldSubject._id,
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

  async function addClassroom({
    subject,
    classroomId,
  }) {
    return async.auto({
      oldSubject: async () => SubjectRepository
        .findById({
          _id: subject,
          select: { _id: 1, classrooms: 1 },
        }),
      updatedSubject: ['oldSubject', async ({ oldSubject }) => {
        const newClassrooms = oldSubject.classrooms || [];
        oldSubject.classrooms = _.uniq([...newClassrooms], classroomId);
        return update(oldSubject);
      }],
    });
  }

  async function removeClassroom({
    subject,
    classroomId,
  }) {
    return async.auto({
      oldSubject: async () => SubjectRepository
        .findById({
          _id: subject,
          select: { _id: 1, classrooms: 1 },
        }),
      updatedSubject: ['oldSubject', async ({ oldSubject }) => {
        const newClassrooms = oldSubject.classrooms || [];
        oldSubject.classrooms = _.filter(newClassrooms, (_id) => !_.isEqual(_id, classroomId));
        return update(oldSubject);
      }],
    });
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/subject/repository',
  'components/curriculum-gride/service',
  'lib/utils',
  'lib/mongo',
];
