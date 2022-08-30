const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(
  SubjectModel,
  Utils,
) {
  return {
    create,
    update,
    removeById,
    findById,
  };

  async function findById({ _id, select }) {
    return SubjectModel
      .findById(_id)
      .select(select)
      .lean()
      .exec();
  }

  async function create(subject) {
    const requiredFields = [
      'name',
      'qtyHours',
      'curriculumGride',
    ];
    _.forEach(requiredFields, (field) => {
      if (_.isNil(subject[field])) {
        Utils.throwError(`Error creating Subject. Required Field: ${field} not sent`, 400);
      }
    });
    const newSubject = await SubjectModel.create(subject);
    return newSubject.toJSON();
  }

  async function update(newSubject) {
    const { updatedSubject } = await async.auto({
      oldSubject: async () => SubjectModel
        .findById(newSubject._id)
        .exec(),
      updatedSubject: ['oldSubject', async ({ oldSubject }) => {
        _.forOwn(newSubject, (value, field) => {
          oldSubject[field] = value;
        });
        return oldSubject.save();
      }],
    });
    return updatedSubject.toJSON();
  }

  async function removeById(subjectId) {
    const subject = await SubjectModel
      .findById(subjectId)
      .exec();
    if (!subject) {
      Utils.throwError('Error removing Subject. Subject not found', 404);
    }
    return subject.delete();
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/subject/model',
  'lib/utils',
];
