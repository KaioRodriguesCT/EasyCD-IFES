const express = require('express');

exports = module.exports = function initRouter(
  EnrollmentController,
  Policies,
) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create a enrollment
  router.post(
    '/',
    Policies.JWTTeacher,
    EnrollmentController.create,
  );

  // Update a enrollmentenrollment
  router.put(
    '/:enrollmentId',
    Policies.JWTTeacher,
    EnrollmentController.update,
  );

  // Delete a enrollment
  router.delete(
    '/:enrollmentId',
    Policies.JWTTeacher,
    EnrollmentController.remove,
  );

  router.get(
    '/student-enrollments',
    Policies.JWTLogged,
    EnrollmentController.getStudentEnrollments,
  );

  router.get(
    '/',
    Policies.JWTTeacher,
    EnrollmentController.list,
  );

  app.use('/api/enrollments', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/enrollment/controller',
  'lib/policies',
];
