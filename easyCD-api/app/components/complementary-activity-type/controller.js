const async = require('async');

exports = module.exports = function initController(
  ComplementaryActivityTypeService,
) {
  return {
    create,
    update,
    remove,
  };

  async function create(req, res, next) {
    try {
      return await async.auto({
        createdType: async () => ComplementaryActivityTypeService.create(req.body),
        sendResponse: ['createdType', async ({ createdType }) => res.json({
          message: 'Complementary Activity Type created successfully',
          complementaryActivityType: createdType,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function update(req, res, next) {
    try {
      const { complementaryActivityTypeId } = req.params;
      const complementaryActivityType = req.body;
      return await async.auto({
        updatedType: async () => ComplementaryActivityTypeService.update({
          ...complementaryActivityType,
          _id: complementaryActivityTypeId,
        }),
        sendResponse: ['updatedType', async ({ updatedType }) => res.json({
          message: 'Complementary Activity Type updated successfully',
          complementaryActivityType: updatedType,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function remove(req, res, next) {
    try {
      const { complementaryActivityTypeId } = req.params;
      return await async.auto({
        deletedType: async () => ComplementaryActivityTypeService.remove({
          _id: complementaryActivityTypeId,
        }),
        sendResponse: ['deletedType', async () => res.json({
          message: 'Complementary Activity Type deleted successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }
};
exports['@singleton'] = true;
exports['@require'] = ['components/complementary-activity-type/service'];
