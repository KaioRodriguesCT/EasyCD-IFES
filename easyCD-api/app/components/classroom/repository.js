const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(
  ClassroomModel,
  Utils,
) {
  return {
    create,
    update,
    aggregate,
    removeById,
    findById,
    findAll,
  };

  async function findAll({ filters, select }) {
    return ClassroomModel
      .find(filters)
      .select(select)
      .lean()
      .exec();
  }
  async function aggregate(pipeline) {
    return ClassroomModel
      .aggregate(pipeline)
      .exec();
  }

  async function findById({ _id }) {
    return ClassroomModel
      .findById(_id)
      .lean()
      .exec();
  }

  async function create(classroom) {
    const requiredFields = [
      'semester',
      'teacher',
      'subject',
    ];
    _.forEach(requiredFields, (field) => {
      if (_.isNil(classroom[field])) {
        Utils.throwError(`Error creating Classroom. Required Field: ${field} not sent`, 400);
      }
    });
    const newClassroom = await ClassroomModel.create(classroom);
    return newClassroom.toJSON();
  }

  async function update(newClassroom) {
    const { updatedClassroom } = await async.auto({
      oldClassroom: async () => ClassroomModel
        .findById(newClassroom._id)
        .exec(),
      updatedClassroom: ['oldClassroom', async ({ oldClassroom }) => {
        _.forOwn(newClassroom, (value, field) => {
          oldClassroom[field] = value;
        });
        return oldClassroom.save();
      }],
    });
    return updatedClassroom.toJSON();
  }

  async function removeById(classroomId) {
    const classroom = await ClassroomModel
      .findById(classroomId)
      .exec();
    return classroom.delete();
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/classroom/model',
  'lib/utils',
];
