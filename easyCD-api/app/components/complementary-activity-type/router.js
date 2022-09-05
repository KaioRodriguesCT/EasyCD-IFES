const express = require('express');

exports = module.exports = function initRouter(
  ComplementaryActivityTypeController,
  Policies,
) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create a complementary activity type
  router.post(
    '/',
    Policies.JWTTeacher,
    ComplementaryActivityTypeController.create,
  );

  // Update a complementary activity type
  router.put(
    '/:complementaryActivityTypeId',
    Policies.JWTTeacher,
    ComplementaryActivityTypeController.update,
  );

  // Delete a complementary activity type
  router.delete(
    '/:complementaryActivityTypeId',
    Policies.JWTTeacher,
    ComplementaryActivityTypeController.remove,
  );

  app.use('/api/complementary-activity-type', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/complementary-activity-type/controller',
  'lib/policies',
];
