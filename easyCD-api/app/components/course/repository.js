const async = require('async');
const _ = require('lodash');

exports = module.exports = function initRepository(
  CourseModel,
  Utils,
) {
  return {
    findById,
    findAll,
    create,
    update,
    removeById,
  };

  async function findAll() {
    return CourseModel
      .find()
      .lean()
      .exec();
  }

  async function findById({ _id, select = {} }) {
    return CourseModel
      .findById(_id)
      .select(select)
      .lean()
      .exec();
  }

  async function create(course) {
    const requiredFields = [
      'name',
      'coordinator',
    ];
    _.forEach(requiredFields, (field) => {
      if (_.isNil(course[field])) {
        Utils.throwError(`Error creating course. Required Field: ${field} not sent`, 400);
      }
    });
    const newCourse = await CourseModel.create(course);
    return newCourse.toJSON();
  }

  async function update(newCourse) {
    const { updatedCourse } = await async.auto({
      oldCourse: async () => CourseModel
        .findById(newCourse._id)
        .exec(),
      updatedCourse: ['oldCourse', async ({ oldCourse }) => {
        _.forOwn(newCourse, (value, field) => {
          oldCourse[field] = value;
        });
        return oldCourse.save();
      }],
    });
    return updatedCourse.toJSON();
  }

  async function removeById(courseId) {
    const course = await CourseModel
      .findById(courseId)
      .exec();
    if (!course) {
      Utils.throwError('Error removing course. Course not found', 404);
    }
    return course.delete();
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/course/model',
  'lib/utils',
];
