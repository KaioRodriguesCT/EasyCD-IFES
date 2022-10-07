const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(
  EnrollmentModel,
  Utils,
) {
  return {
    create,
    update,
    removeById,
    findById,
    findOne,
  };

  async function findById({ _id }) {
    return EnrollmentModel
      .findById(_id)
      .lean()
      .exec();
  }

  async function findOne({
    filters,
    select,
    populate,
    sort,
  }) {
    return EnrollmentModel
      .findOne(filters)
      .select(select)
      .populate(populate)
      .sort(sort)
      .lean()
      .exec();
  }

  async function create(enrollment) {
    const newEnrollment = await EnrollmentModel.create(enrollment);
    return newEnrollment.toJSON();
  }

  async function update(newEnrollment) {
    const { updatedEnrollment } = await async.auto({
      oldEnrollment: async () => EnrollmentModel
        .findById(newEnrollment._id)
        .exec(),
      updatedEnrollment: ['oldEnrollment', async ({ oldEnrollment }) => {
        _.forOwn(newEnrollment, (value, field) => {
          oldEnrollment[field] = value;
        });
        return oldEnrollment.save();
      }],
    });
    return updatedEnrollment.toJSON();
  }

  async function removeById(enrollmentId) {
    const enrollment = await EnrollmentModel
      .findById(enrollmentId)
      .exec();
    return enrollment.delete();
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/enrollment/model',
  'lib/utils',
];
