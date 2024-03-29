const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(
  CurriculumGrideModel,
  Utils,
) {
  return {
    create,
    update,
    removeById,
    findById,
    findAll,
    aggregate,
  };

  async function findAll({ filters, select }) {
    return CurriculumGrideModel
      .find(filters)
      .select(select)
      .lean()
      .exec();
  }

  async function findById({ _id, select }) {
    return CurriculumGrideModel
      .findById(_id)
      .select(select)
      .lean()
      .exec();
  }

  async function create(curriculumGride) {
    const requiredFields = [
      'name',
      'dtStart',
      'dtEnd',
      'isActive',
      'course',
    ];
    _.forEach(requiredFields, (field) => {
      if (_.isNil(curriculumGride[field])) {
        Utils.throwError(`Error creating Curriculum Gride. Required Field: ${field} not sent`, 400);
      }
    });
    const newCurriculumGride = await CurriculumGrideModel.create(curriculumGride);
    return newCurriculumGride.toJSON();
  }

  async function update(newCurriculumGride) {
    const { updatedCurriculumGride } = await async.auto({
      oldCurriculumGride: async () => CurriculumGrideModel
        .findById(newCurriculumGride._id)
        .exec(),
      updatedCurriculumGride: ['oldCurriculumGride', async ({ oldCurriculumGride }) => {
        _.forOwn(newCurriculumGride, (value, field) => {
          oldCurriculumGride[field] = value;
        });
        return oldCurriculumGride.save();
      }],
    });
    return updatedCurriculumGride.toJSON();
  }

  async function removeById(curriculumGrideId) {
    const curriculumGride = await CurriculumGrideModel
      .findById(curriculumGrideId)
      .exec();
    return curriculumGride.delete();
  }

  async function aggregate(pipeline) {
    return CurriculumGrideModel.aggregate(pipeline).exec();
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/curriculum-gride/model',
  'lib/utils',
];
