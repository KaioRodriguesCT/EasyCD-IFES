const async = require('async');

exports = module.exports = function initController(
  SolicitationTypeService,
) {
  return {
    create,
    update,
    remove,
    list,
  };

  async function create(req, res, next) {
    try {
      return await async.auto({
        createdSolicitationType: async () => SolicitationTypeService.create(req.body),
        sendResponse: ['createdSolicitationType', async ({ createdSolicitationType }) => res.json({
          message: 'Solicitation Type created successfully',
          solicitationType: createdSolicitationType,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function update(req, res, next) {
    try {
      const { solicitationTypeId } = req.params;
      const { solicitationType } = req.body;
      return await async.auto({
        updatedSolicitationType: async () => SolicitationTypeService.update({
          ...solicitationType,
          _id: solicitationTypeId,
        }),
        sendResponse: ['updatedSolicitationType', async ({ updatedSolicitationType }) => res.json({
          message: 'Solicitation Type updated successfully',
          solicitationType: updatedSolicitationType,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function remove(req, res, next) {
    try {
      const { solicitationTypeId } = req.params;
      return await async.auto({
        deletedSolicitationType: async () => SolicitationTypeService.remove({
          _id: solicitationTypeId,
        }),
        sendResponse: ['deletedSolicitationType', async () => res.json({
          message: 'Solicitation Type deleted successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function list(req, res, next) {
    try {
      const { query: { filters } } = req;

      return res.json({ solicitationTypes: await SolicitationTypeService.findAll({ filters }) });
    } catch (e) {
      return next(e);
    }
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/solicitation-type/service',
];
