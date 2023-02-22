const express = require('express');

exports = module.exports = function initRouter(
  CurriculumGrideController,
  Policies,
) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create a curriculum gride
  router.post(
    '/',
    Policies.JWTTeacher,
    CurriculumGrideController.create,
  );

  // Update a curriculum gride
  router.put(
    '/:curriculumGrideId',
    Policies.JWTTeacher,
    CurriculumGrideController.update,
  );

  // Delete a curriculum gride
  router.delete(
    '/:curriculumGrideId',
    Policies.JWTTeacher,
    CurriculumGrideController.remove,
  );

  router.get(
    '/',
    Policies.JWTTeacher,
    CurriculumGrideController.list,
  );

  app.use('/api/curriculum-grides', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/curriculum-gride/controller',
  'lib/policies',
];
