const express = require('express');

exports = module.exports = function initRouter(
  SolicitationTypeController,
  Policies,
) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create a solicitation type
  router.post(
    '/',
    Policies.JWTTeacher,
    SolicitationTypeController.create,
  );

  // Update a solicitation type
  router.put(
    '/:solicitationTypeId',
    Policies.JWTTeacher,
    SolicitationTypeController.update,
  );

  // Delete a solicitation type
  router.delete(
    '/:solicitationTypeId',
    Policies.JWTTeacher,
    SolicitationTypeController.remove,
  );

  app.use('/api/solicitation-type', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation-type/controller',
  'lib/policies',
];
