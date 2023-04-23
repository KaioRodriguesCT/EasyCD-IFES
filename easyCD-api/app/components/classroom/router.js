const express = require('express');

exports = module.exports = function initRouter(
  ClassroomController,
  Policies,
) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create a classroom
  router.post(
    '/',
    Policies.JWTTeacher,
    ClassroomController.create,
  );

  // Update a classroom
  router.put(
    '/:classroomId',
    Policies.JWTTeacher,
    ClassroomController.update,
  );

  // Delete a classroom
  router.delete(
    '/:classroomId',
    Policies.JWTTeacher,
    ClassroomController.remove,
  );

  router.get(
    '/',
    Policies.JWTLogged,
    ClassroomController.list,
  );

  router.get(
    '/teacher-classrooms',
    Policies.JWTTeacher,
    ClassroomController.getTeacherClassrooms,
  );

  app.use('/api/classrooms', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/classroom/controller',
  'lib/policies',
];
