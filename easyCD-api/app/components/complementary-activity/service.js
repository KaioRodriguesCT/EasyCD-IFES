const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');

const defaultErrorCreating = 'Error creating Complementary Activity';
const defaultErrorUpdating = 'Error updating Complementary Activity';
const defaultErrorRemoving = 'Error removing Complementary Activity';

const { ObjectId } = mongoose.Types;

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
    validateStudent,
    validateComplementaryActivityType,
    findAll,
    removeByType,
    getStudentCActivities,
  };

  async function findAll({ filters }) {
    return ComplementaryActivityRepository.findAll({ filters });
  }

  async function findById({ _id }) {
    return ComplementaryActivityRepository.findById({ _id });
  }

  async function create(complementaryActivity) {
    if (!complementaryActivity) {
      Utils.throwError(`${defaultErrorCreating}. Activity not sent`, 400);
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
      // TODO
      validateCourse: async () => {},
      createdComplementaryActivity: ['validateStudent', 'validateComplementaryActivityType', 'validateCourse', async () => {
        const initialFields = [
          'complementaryActivityType',
          'student',
          'evidence',
          'quantity',
          'course',
          'status',
        ];
        const newComplementaryActivity = _.pick(complementaryActivity, initialFields);
        return ComplementaryActivityRepository.create(newComplementaryActivity);
      }],
      updateStudent: ['createdComplementaryActivity', async ({ createdComplementaryActivity: { student, _id } }) => PersonService.addComplementaryActivity({
        student,
        complementaryActivityId: _id,
      })],
    });
    return createdComplementaryActivity;
  }

  async function update(complementaryActivity) {
    if (_.isNil(complementaryActivity)) {
      Utils.throwError(`${defaultErrorUpdating}. Activity not sent`, 400);
    }
    if (_.isNil(complementaryActivity._id)) {
      Utils.throwError(`${defaultErrorUpdating}. Activity ID not sent`, 400);
    }
    const { updatedComplementaryActivity } = await async.auto({
      oldComplementaryActivity: async () => {
        const oldActivity = await ComplementaryActivityRepository
          .findById({ _id: complementaryActivity._id });
        if (!oldActivity) {
          Utils.throwError(`${defaultErrorUpdating}. Activity not found`, 404);
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
          const currentValue = complementaryActivity[field];
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
          oldComplementaryActivity[field] = currentValue;
        });
        return ComplementaryActivityRepository.update(oldComplementaryActivity);
      }],
    });
    return updatedComplementaryActivity;
  }

  async function remove(complementaryActivity) {
    if (_.isNil(complementaryActivity)) {
      Utils.throwError(`${defaultErrorRemoving}. Activity not sent`, 400);
    }
    if (_.isNil(complementaryActivity._id)) {
      Utils.throwError(`${defaultErrorRemoving}. Activity ID not sent`, 400);
    }

    await async.auto({
      oldComplementaryActivity: async () => {
        const oldActivity = await ComplementaryActivityRepository
          .findById({ _id: complementaryActivity._id });
        if (!oldActivity) {
          Utils.throwError(`${defaultErrorRemoving}. Activity not found`, 404);
        }
        return oldActivity;
      },
      removeComplementaryActivity: ['oldComplementaryActivity', async ({ oldComplementaryActivity: _id }) => ComplementaryActivityRepository.removeById(_id)],
      updateStudent: ['oldComplementaryActivity', 'removeComplementaryActivity', async ({ oldComplementaryActivity: { student, _id } }) => PersonService.removeComplementaryActivity({
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
          .getByPerson(_id);
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
      Utils.throwError(`${defaultErrorMessage}. Activity Type not sent or not a valid ID`, 400);
    }
    const complementaryActivityType = await ComplementaryActivityTypeService
      .findById({ _id: complementaryActivityTypeId });
    if (!complementaryActivityType) {
      Utils.throwError(`${defaultErrorMessage}. Activity Type not found`, 404);
    }
    return complementaryActivityType;
  }

  async function removeByType({ typeId }) {
    const activities = await ComplementaryActivityRepository.findAll({
      filters: { complementaryActivityType: typeId },
    });
    return async.eachSeries(activities, remove);
  }

  async function getStudentCActivities({ filters }) {
    const pipeline = [
      {
        $match: {
          student: new ObjectId(filters?.student),
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: {
          path: '$course',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'complementaryactivitytypes',
          localField: 'complementaryActivityType',
          foreignField: '_id',
          as: 'type',
        },
      },
      {
        $unwind: {
          path: '$type',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    return ComplementaryActivityRepository.aggregate(pipeline);
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/complementary-activity/repository',
  'components/complementary-activity-type/service',
  'components/person/service',
  'components/user/service',
  'lib/utils',
];
