const express = require('express');

exports = module.exports = function initRouter(
  CourseController,
  Policies,
) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create a Course
  router.post(
    '/',
    Policies.JWTTeacher,
    CourseController.create,
  );

  // Update a Course
  router.put(
    '/:courseId',
    Policies.JWTTeacher,
    CourseController.update,
  );

  // Remove a Course
  router.delete(
    '/:courseId',
    Policies.JWTTeacher,
    CourseController.remove,
  );

  router.get(
    '/',
    Policies.JWTLogged,
    CourseController.list,
  );

  router.get(
    '/coordinator-courses',
    Policies.JWTTeacher,
    CourseController.getCoordinatorCourses,
  );

  app.use('/api/courses', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/course/controller',
  'lib/policies',
];
