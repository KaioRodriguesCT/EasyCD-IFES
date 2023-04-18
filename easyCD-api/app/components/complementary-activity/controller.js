const async = require('async');

exports = module.exports = function initController(
  ComplementaryActivityService,
) {
  return {
    create,
    update,
    remove,
    list,
    getStudentCActivities,
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
        deletedActivity: async () => ComplementaryActivityService.remove({
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

  async function list(req, res, next) {
    try {
      const { query: { filters } } = req;

      return res.json({
        complementaryActivities: await ComplementaryActivityService.findAll({ filters }),
      });
    } catch (e) {
      return next(e);
    }
  }

  async function getStudentCActivities(req, res, next) {
    try {
      const { query: { filters } } = req;
      const complementaryActivities = await ComplementaryActivityService.getStudentCActivities({
        filters,
      });
      return res.json({ complementaryActivities });
    } catch (e) {
      return next(e);
    }
  }
};
exports['@singleton'] = true;
exports['@require'] = ['components/complementary-activity/service'];
