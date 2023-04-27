const async = require('async');

exports = module.exports = function initController(CourseService) {
  return {
    list,
    create,
    update,
    remove,
    getCoordinatorCourses,
  };

  async function list(req, res, next) {
    try {
      const { query: { filters } } = req;
      return res.json({ courses: await CourseService.list({ filters }) });
    } catch (e) {
      return next(e);
    }
  }

  async function create(req, res, next) {
    try {
      return await async.auto({
        createdCourse: async () => CourseService.create(req.body),
        sendResponse: ['createdCourse', async ({ createdCourse }) => res.json({
          message: 'Course created successfully',
          course: createdCourse,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function update(req, res, next) {
    try {
      const { courseId } = req.params;
      const { course } = req.body;
      return await async.auto({
        updatedCourse: async () => CourseService.update({ ...course, _id: courseId }),
        sendResponse: ['updatedCourse', async ({ updatedCourse }) => res.json({
          message: 'Course updated successfully',
          course: updatedCourse,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function remove(req, res, next) {
    try {
      const { courseId } = req.params;
      return await async.auto({
        removedCourse: async () => CourseService.remove({ _id: courseId }),
        sendResponse: ['removedCourse', async () => res.json({
          message: 'Course deleted successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function getCoordinatorCourses(req, res, next) {
    try {
      const { query: { filters } } = req;
      return res.json({ courses: await CourseService.getCoordinatorCourses({ filters }) });
    } catch (e) {
      return next(e);
    }
  }
};
exports['@singleton'] = true;
exports['@require'] = ['components/course/service'];
