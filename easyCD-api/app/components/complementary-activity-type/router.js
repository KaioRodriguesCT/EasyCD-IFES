const express = require('express');

exports = module.exports = function initRouter(
  ComplementaryActivityTypeController,
  Policies,
) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create a classroom
  router.post(
    '/',
    Policies.JWTTeacher,
    ComplementaryActivityTypeController.create,
  );

  // Update a classroom
  router.put(
    '/:complementaryActivityTypeId',
    Policies.JWTTeacher,
    ComplementaryActivityTypeController.update,
  );

  // Delete a classroom
  router.delete(
    '/:complementaryActivityTypeId',
    Policies.JWTTeacher,
    ComplementaryActivityTypeController.remove,
  );

  app.use('/api/complementaryActivityType', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/complementary-activity-type/controller',
  'lib/policies',
];
