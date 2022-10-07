const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(
  ComplementaryActivityModel,
  Utils,
) {
  return {
    create,
    update,
    removeById,
    findById,
  };

  async function findById({ _id }) {
    return ComplementaryActivityModel
      .findById(_id)
      .lean()
      .exec();
  }

  async function create(complementaryActivity) {
    const requiredFields = [
      'complementaryActivityType',
      'student',
      'course',
      'status',
      'evidence',
      'quantity',
    ];
    _.forEach(requiredFields, (field) => {
      if (_.isNil(complementaryActivity[field])) {
        Utils.throwError(`Error creating Complementary Activity. Required Field: ${field} not sent`, 400);
      }
    });
    const newComplementaryActivity = await ComplementaryActivityModel.create(complementaryActivity);
    return newComplementaryActivity.toJSON();
  }

  async function update(complementaryActivity) {
    const { updatedActivity } = await async.auto({
      oldActivity: async () => ComplementaryActivityModel
        .findById(complementaryActivity._id)
        .exec(),
      updatedActivity: ['oldActivity', async ({ oldActivity }) => {
        _.forOwn(complementaryActivity, (value, field) => {
          oldActivity[field] = value;
        });
        return oldActivity.save();
      }],
    });
    return updatedActivity.toJSON();
  }

  async function removeById(complementaryActivityId) {
    const activity = await ComplementaryActivityModel
      .findById(complementaryActivityId)
      .exec();
    return activity.delete();
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/complementary-activity/model',
  'lib/utils',
];
