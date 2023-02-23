const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');

const defaultErrorCreating = 'Error creating Subject';
const defaultErrorUpdating = 'Error updating Subject';
const defaultErrorRemoving = 'Error removing Subject';

exports = module.exports = function initService(
  SubjectRepository,
  CurriculumGrideService,
  Utils,
) {
  return {
    create,
    update,
    remove,
    addClassroom,
    removeClassroom,
    findById,
    findAll,
    validateCurriculumGride,
  };

  async function findAll({ filters }) {
    return SubjectRepository.findAll({ filters });
  }

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
      updateCurriculumGride: ['createdSubject', async ({ createdSubject: { curriculumGride, _id } }) => CurriculumGrideService.addSubject({
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
            || _.isEqual(String(oldSubject.curriculumGride), subject.curriculumGride)) {
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
          classrooms: { allowEmpty: true },
        };
        _.forOwn(updatableFields, (value, field) => {
          const currentValue = subject[field];
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
          oldSubject[field] = currentValue;
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
    await async.auto({
      oldSubject: async () => {
        const oldSubject = await SubjectRepository
          .findById({ _id: subject._id });
        if (!oldSubject) {
          Utils.throwError(`${defaultErrorRemoving}. Subject not found`, 404);
        }
        return oldSubject;
      },
      removeSubject: ['oldSubject', async ({ oldSubject: { _id } }) => SubjectRepository.removeById(_id)],
      updateCurriculumGride: ['oldSubject', 'removeSubject', async ({ oldSubject: { curriculumGride, _id } }) => CurriculumGrideService.removeSubject({
        curriculumGride,
        subjectId: _id,
      })],
    });
  }

  async function validateCurriculumGride({
    curriculumGrideId,
    defaultErrorMessage,
  }) {
    if (!curriculumGrideId || !mongoose.isValidObjectId(curriculumGrideId)) {
      Utils.throwError(`${defaultErrorMessage}. Curriculum Gride not sent or not a valid ID`, 400);
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
    const defaultErrorMessage = 'Error adding Classroom to Subject';
    if (!subject || !mongoose.isValidObjectId(subject)) {
      Utils.throwError(`${defaultErrorMessage}. Subject ID not sent or not a valid ID`, 400);
    }
    if (!classroomId || !mongoose.isValidObjectId(classroomId)) {
      Utils.throwError(`${defaultErrorMessage}. Classroom ID not sent or not a valid ID`, 400);
    }
    const { updatedSubject } = await async.auto({
      oldSubject: async () => {
        const oldSubject = await SubjectRepository
          .findById({
            _id: subject,
            select: { _id: 1, classrooms: 1 },
          });
        if (!oldSubject) {
          Utils.throwError(`${defaultErrorMessage}. Subject not found`, 404);
        }
        return oldSubject;
      },
      updatedSubject: ['oldSubject', async ({ oldSubject }) => {
        const newClassrooms = oldSubject.classrooms || [];
        oldSubject.classrooms = _.uniq([...newClassrooms, classroomId]);
        return update(oldSubject);
      }],
    });
    return updatedSubject;
  }

  async function removeClassroom({
    subject,
    classroomId,
  }) {
    const defaultErrorMessage = 'Error removing Classroom from Subject';
    if (!subject || !mongoose.isValidObjectId(subject)) {
      Utils.throwError(`${defaultErrorMessage}. Subject ID not sent or not a valid ID`, 400);
    }
    if (!classroomId || !mongoose.isValidObjectId(classroomId)) {
      Utils.throwError(`${defaultErrorMessage}. Classroom ID not sent or not a valid ID`, 400);
    }
    const { updatedSubject } = await async.auto({
      oldSubject: async () => {
        const oldSubject = await SubjectRepository
          .findById({
            _id: subject,
            select: { _id: 1, classrooms: 1 },
          });
        if (!oldSubject) {
          Utils.throwError(`${defaultErrorMessage}. Subject not found`, 404);
        }
        return oldSubject;
      },
      updatedSubject: ['oldSubject', async ({ oldSubject }) => {
        const newClassrooms = oldSubject.classrooms || [];
        oldSubject.classrooms = _.filter(newClassrooms, (_id) => !_.isEqual(_id, classroomId));
        return update(oldSubject);
      }],
    });
    return updatedSubject;
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/subject/repository',
  'components/curriculum-gride/service',
  'lib/utils',
];
