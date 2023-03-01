const async = require('async');

exports = module.exports = function initController(
  ClassroomService,
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
        createdClassroom: async () => ClassroomService.create(req.body),
        sendResponse: ['createdClassroom', async ({ createdClassroom }) => res.json({
          message: 'Classroom created successfully',
          classroom: createdClassroom,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function update(req, res, next) {
    try {
      const { classroomId } = req.params;
      const { classroom } = req.body;
      return await async.auto({
        updatedClassroom: async () => ClassroomService.update({
          ...classroom,
          _id: classroomId,
        }),
        sendResponse: ['updatedClassroom', async ({ updatedClassroom }) => res.json({
          message: 'Classroom updated successfully',
          classroom: updatedClassroom,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function remove(req, res, next) {
    try {
      const { classroomId } = req.params;
      return await async.auto({
        deletedClassroom: async () => ClassroomService.remove({
          _id: classroomId,
        }),
        sendResponse: ['deletedClassroom', async () => res.json({
          message: 'Classroom deleted successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function list(req, res, next) {
    try {
      const { query: { filters } } = req;
      return res.json({ classrooms: await ClassroomService.findAll({ filters }) });
    } catch (e) {
      return next(e);
    }
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/classroom/service',
];
