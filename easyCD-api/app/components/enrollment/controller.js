const async = require('async');

exports = module.exports = function initController(
  EnrollmentService,
) {
  return {
    create,
    update,
    remove,
    list,
    getStudentEnrollments,
  };

  async function create(req, res, next) {
    try {
      return await async.auto({
        createdEnrollment: async () => EnrollmentService.create(req.body),
        sendResponse: ['createdEnrollment', async ({ createdEnrollment }) => res.json({
          message: 'Enrollment created successfully',
          enrollment: createdEnrollment,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function update(req, res, next) {
    try {
      const { enrollmentId } = req.params;
      const { enrollment } = req.body;
      return await async.auto({
        updatedEnrollment: async () => EnrollmentService.update({
          ...enrollment,
          _id: enrollmentId,
        }),
        sendResponse: ['updatedEnrollment', async ({ updatedEnrollment }) => res.json({
          message: 'Enrollment updated successfully',
          enrollment: updatedEnrollment,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function remove(req, res, next) {
    try {
      const { enrollmentId } = req.params;
      return await async.auto({
        deletedEnrollment: async () => EnrollmentService.remove({
          _id: enrollmentId,
        }),
        sendResponse: ['deletedEnrollment', async () => res.json({
          message: 'Enrollment deleted successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function list(req, res, next) {
    try {
      const { query: { filters } } = req;

      return res.json({ enrollments: await EnrollmentService.list({ filters }) });
    } catch (e) {
      return next(e);
    }
  }

  async function getStudentEnrollments(req, res, next) {
    try {
      const { query: { filters } } = req;
      const studentEnrollments = await EnrollmentService.getStudentEnrollments({ filters });
      return res.json({ enrollments: studentEnrollments });
    } catch (e) {
      return next(e);
    }
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/enrollment/service',
];
