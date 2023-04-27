const async = require('async');

exports = module.exports = function initController(
  SolicitationService,
) {
  return {
    create,
    update,
    remove,
    list,
    getStudentSolicitations,
    getTeacherSolicitations,
  };

  async function create(req, res, next) {
    try {
      return await async.auto({
        createdSolicitation: async () => SolicitationService.create(req.body),
        sendResponse: ['createdSolicitation', async ({ createdSolicitation }) => res.json({
          message: 'Solicitation created successfully',
          solicitation: createdSolicitation,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function update(req, res, next) {
    try {
      const { solicitationId } = req.params;
      const { solicitation } = req.body;
      return await async.auto({
        updatedSolicitation: async () => SolicitationService.update({
          ...solicitation,
          _id: solicitationId,
        }),
        sendResponse: ['updatedSolicitation', async ({ updatedSolicitation }) => res.json({
          message: 'Solicitation updated successfully',
          solicitation: updatedSolicitation,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function remove(req, res, next) {
    try {
      const { solicitationId } = req.params;
      return await async.auto({
        deletedSolicitation: async () => SolicitationService.remove({
          _id: solicitationId,
        }),
        sendResponse: ['deletedSolicitation', async () => res.json({
          message: 'Solicitation delete successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function list(req, res, next) {
    try {
      const { query: { filters } } = req;
      return res.json({ solicitations: await SolicitationService.list({ filters }) });
    } catch (e) {
      return next(e);
    }
  }

  async function getStudentSolicitations(req, res, next) {
    try {
      const { query: { filters } } = req;
      const solicitations = await SolicitationService.getStudentSolicitations({ filters });
      return res.json({ solicitations });
    } catch (e) {
      return next(e);
    }
  }

  async function getTeacherSolicitations(req, res, next) {
    try {
      const { query: { filters } } = req;
      const solicitations = await SolicitationService.getTeacherSolicitations({ filters });
      return res.json({ solicitations });
    } catch (e) {
      return next(e);
    }
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation/service',
];
