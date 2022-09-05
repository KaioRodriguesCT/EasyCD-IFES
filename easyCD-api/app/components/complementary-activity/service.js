const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');

const defaultErrorCreating = 'Error creating Complementary Activity';
const defaultErrorUpdating = 'Error updating Complementary Activity';
const defaultErrorRemoving = 'Error removing Complementary Activity';

exports = module.exports = function initService(
  ComplementaryActivityRepository,
  ComplementaryActivityTypeService,
  PersonService,
  UserService,
  Utils,
) {
  return {
    create,
    update,
    remove,
    findById,
  };

  async function findById({ _id }) {
    return ComplementaryActivityRepository.findById({ _id });
  }

  async function create(complementaryActivity) {
    if (!complementaryActivity) {
      Utils.throwError(`${defaultErrorCreating}. Complementary Activity not sent`, 400);
    }
    const { createdComplementaryActivity } = await async.auto({
      validateStudent: async () => validateStudent({
        studentId: complementaryActivity.student,
        defaultErrorMessage: defaultErrorCreating,
      }),
      validateComplementaryActivityType: async () => validateComplementaryActivityType({
        complementaryActivityTypeId: complementaryActivity.complementaryActivityType,
        defaultErrorMessage: defaultErrorCreating,
      }),
      createdComplementaryActivity: ['validateStudent', 'validateComplementaryActivityType', async () => {
        const initialFields = [
          'complementaryActivityType',
          'student',
          'evidence',
          'quantity',
        ];
        const newComplementaryActivity = _.pick(complementaryActivity, initialFields);
        return ComplementaryActivityRepository.create(newComplementaryActivity);
      }],
      updateStudent: ['createdComplementaryActivity', async ({ createdComplementaryActivity: student, _id }) => PersonService.addComplementaryActivity({
        student,
        complementaryActivityId: _id,
      })],
    });
    return createdComplementaryActivity;
  }

  async function update(complementaryActivity) {
    if (_.isNil(complementaryActivity)) {
      Utils.throwError(`${defaultErrorUpdating}. Complementary Activity not sent`, 400);
    }
    if (_.isNil(complementaryActivity._id)) {
      Utils.throwError(`${defaultErrorUpdating}. Complementary Activity ID not sent`, 400);
    }
    const { updatedComplementaryActivity } = await async.auto({
      oldComplementaryActivity: async () => {
        const oldActivity = await ComplementaryActivityRepository
          .findById({ _id: complementaryActivity._id });
        if (!oldActivity) {
          Utils.throwError(`${defaultErrorUpdating}. Complementary Activity not found`, 404);
        }
        return oldActivity;
      },
      validateComplementaryActivityType: ['oldComplementaryActivity', async () => (complementaryActivity.complementaryActivityType
        ? validateComplementaryActivityType({
          complementaryActivityTypeId: complementaryActivity.complementaryActivityType,
          defaultErrorMessage: defaultErrorUpdating,
        }) : null)],
      updatedComplementaryActivity: ['oldComplementaryActivity', async ({ oldComplementaryActivity }) => {
        const updatableFields = {
          complementaryActivityType: { allowEmpty: false },
          status: { allowEmpty: false },
          statusJustification: { allowEmpty: true },
          evidence: { allowEmpty: false },
          quantity: { allowEmpty: false },
        };
        _.forOwn(updatableFields, (value, field) => {
          const allowEmpty = _.get(value, 'allowEmpty');
          if (_.isUndefined(complementaryActivity[field])) {
            return;
          }
          if ((_.isNull(complementaryActivity[field])
          || _.isEmpty(complementaryActivity[field])) && !allowEmpty) {
            return;
          }
          if (_.isEqual(oldComplementaryActivity[field], complementaryActivity[field])) {
            return;
          }
          oldComplementaryActivity[field] = complementaryActivity[field];
        });
        return ComplementaryActivityRepository.update(oldComplementaryActivity);
      }],
    });
    return updatedComplementaryActivity;
  }

  async function remove(complementaryActivity) {
    if (_.isNil(complementaryActivity)) {
      Utils.throwError(`${defaultErrorRemoving}. Complementary Activity not sent`, 400);
    }
    if (_.isNil(complementaryActivity._id)) {
      Utils.throwError(`${defaultErrorRemoving}. Complementary Activity ID not sent`, 400);
    }

    await async.auto({
      oldComplementaryActivity: async () => {
        const oldActivity = await ComplementaryActivityRepository
          .findById({ _id: complementaryActivity._id });
        if (!oldActivity) {
          Utils.throwError(`${defaultErrorRemoving}. Complementary Activity not found`, 404);
        }
        return oldActivity;
      },
      removeComplementaryActivity: ['oldComplementaryActivity', async ({ oldComplementaryActivity: _id }) => ComplementaryActivityRepository.removeById(_id)],
      updateStudent: ['oldComplementaryActivity', 'removeComplementaryActivity', async ({ oldComplementaryActivity: student, _id }) => PersonService.removeComplementaryActivity({
        student,
        complementaryActivityId: _id,
      })],
    });
  }

  async function validateStudent({ studentId, defaultErrorMessage }) {
    return async.auto({
      student: async () => {
        if (!studentId || !mongoose.isValidObjectId(studentId)) {
          Utils.throwError(`${defaultErrorMessage}. Student not sent or not a valid ID`, 400);
        }
        const student = await PersonService.findById({ _id: studentId });
        if (!student) {
          Utils.throwError(`${defaultErrorMessage}. Student not found`, 404);
        }
        return student;
      },
      validatedRole: ['student', async ({ student: _id }) => {
        const user = await UserService
          .findByPerson(_id);
        if (!user) {
          Utils.throwError(`${defaultErrorMessage}. User not found`, 404);
        }
        if (!_.isEqual(user.role, 'student')) {
          Utils.throwError(`${defaultErrorMessage}. Person sent can't be student`, 400);
        }
        return user;
      }],
    });
  }

  async function validateComplementaryActivityType({
    complementaryActivityTypeId,
    defaultErrorMessage,
  }) {
    if (!complementaryActivityTypeId || !mongoose.isValidObjectId(complementaryActivityTypeId)) {
      Utils.throwError(`${defaultErrorMessage}. Complementary Activity Type not sent`, 400);
    }
    const complementaryActivityType = await ComplementaryActivityTypeService
      .findById({ _id: complementaryActivityTypeId });
    if (!complementaryActivityType) {
      Utils.throwError(`${defaultErrorMessage}. Complementary Activity Type not found`, 404);
    }
    return complementaryActivityType;
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/complementary-activity/repository',
  'components/person/service',
  'components/user/service',
  'lib/utils',
];
