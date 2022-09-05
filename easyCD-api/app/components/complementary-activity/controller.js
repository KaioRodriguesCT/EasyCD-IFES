const async = require('async');

exports = module.exports = function initController(
  ComplementaryActivityService,
) {
  return {
    create,
    update,
    remove,
  };

  async function create(req, res, next) {
    try {
      return await async.auto({
        createdActivity: async () => ComplementaryActivityService.create(req.body),
        sendRespone: ['createdActivity', async ({ createdActivity }) => res.json({
          message: 'Complementary Activity created successfully',
          complementaryActivity: createdActivity,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function update(req, res, next) {
    try {
      const { complementaryActivityId } = req.params;
      const complementaryActivity = req.body;
      return await async.auto({
        updatedActivity: async () => ComplementaryActivityService.update({
          ...complementaryActivity,
          _id: complementaryActivityId,
        }),
        sendResponse: ['updatedActivity', async ({ updatedActivity }) => res.json({
          message: 'Complementary Activity updated successfully',
          complementaryActivity: updatedActivity,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function remove(req, res, next) {
    try {
      const { complementaryActivityId } = req.params;
      return await async.auto({
        deletedActivity: async () => ComplementaryActivityService.removoe({
          _id: complementaryActivityId,
        }),
        sendRespone: ['deletedActivity', async () => res.json({
          message: 'Complementary Activity deleted successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }
};
exports['@singleton'] = true;
exports['@require'] = ['components/complementary-activity/service'];