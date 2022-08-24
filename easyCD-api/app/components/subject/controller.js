const async = require('async');

exports = module.exports = function initController(
  SubjectService,
) {
  return {
    create,
    update,
    remove,
  };

  async function create(req, res, next) {
    try {
      return await async.auto({
        createdSubject: async () => SubjectService.create(req.body),
        sendResponde: ['createdSubject', async ({ createdSubject }) => res.json({
          message: 'Subject created successfully',
          subject: createdSubject,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function update(req, res, next) {
    try {
      const { subjectId } = req.params;
      const subject = req.body;
      return await async.auto({
        updatedSubject: async () => SubjectService.update({
          ...subject,
          _id: subjectId,
        }),
        sendResponde: ['updatedSubject', async ({ updatedSubject }) => res.json({
          message: 'Subject updated successfully',
          subject: updatedSubject,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function remove(req, res, next) {
    try {
      const { subjectId } = req.params;
      return await async.auto({
        removedSubject: async () => SubjectService.remove({
          _id: subjectId,
        }),
        sendResponde: ['removedSubject', async () => res.json({
          message: 'Subject deleted successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }
};
exports['@singleton'] = true;
exports['@require'] = ['components/subject/service'];
