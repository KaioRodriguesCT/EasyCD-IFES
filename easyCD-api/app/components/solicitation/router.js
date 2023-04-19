const express = require('express');

exports = module.exports = function initRouter(
  SolicitationController,
  Policies,
) {
  const app = this;
  const router = express.Router();

  // Routes

  // Create a solicitation
  router.post(
    '/',
    Policies.JWTStudent,
    SolicitationController.create,
  );

  // Update a solicitation
  router.put(
    '/:solicitationId',
    Policies.JWTLogged, // TODO improve this security
    SolicitationController.update,
  );

  // Delete a solicitation
  router.delete(
    '/:solicitationId',
    Policies.JWTLogged,
    SolicitationController.remove,
  );

  router.get(
    '/student-solicitations',
    Policies.JWTLogged,
    SolicitationController.getStudentSolicitations,
  );

  router.get(
    '/',
    Policies.JWTAdmin,
    SolicitationController.list,
  );

  app.use('/api/solicitations', router);
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation/controller',
  'lib/policies',
];
