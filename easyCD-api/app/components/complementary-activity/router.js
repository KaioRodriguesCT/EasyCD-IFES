const express = require('express');

exports = module.exports = function initRouter(
  ComplementaryActivityController,
  Policies,
) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create a complementary activity
  router.post(
    '/',
    Policies.JWTTeacher,
    ComplementaryActivityController.create,
  );

  // Update a complementary activity
  router.put(
    '/:complementaryActivityId',
    Policies.JWTTeacher,
    ComplementaryActivityController.update,
  );

  // Delete a complementary activity
  router.delete(
    '/:complementaryActivityId',
    Policies.JWTTeacher,
    ComplementaryActivityController.remove,
  );

  router.get(
    '/',
    Policies.JWTAdmin,
    ComplementaryActivityController.list,
  );

  app.use('/api/complementary-activities', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/complementary-activity/controller',
  'lib/policies',
];
