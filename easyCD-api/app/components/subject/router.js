const express = require('express');

exports = module.exports = function initRouter(
  SubjectController,
  Policies,
) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create a subject
  router.post(
    '/',
    Policies.JWTTeacher,
    SubjectController.create,
  );

  // Update a subject
  router.put(
    '/:subjectId',
    Policies.JWTTeacher,
    SubjectController.update,
  );

  // Delete a subject
  router.delete(
    '/:subjectId',
    Policies.JWTTeacher,
    SubjectController.remove,
  );

  app.use('/api/subject', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/subject/controller',
  'lib/policies',
];
