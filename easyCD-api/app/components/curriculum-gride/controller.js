const async = require('async');

exports = module.exports = function initController(CurriculumGrideService) {
  return {
    create,
    update,
    remove,
  };

  async function create(req, res, next) {
    try {
      return await async.auto({
        createdCurriculumGride: async () => CurriculumGrideService.create(req.body),
        sendResponse: ['createdCurriculumGride', async ({ createdCurriculumGride }) => res.json({
          message: 'Curriculum Gide created successfully',
          curriculumGride: createdCurriculumGride,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function update(req, res, next) {
    try {
      const { curriculumGrideId } = req.params;
      const curriculumGride = req.body;
      return await async.auto({
        updatedCurriculumGride: async () => CurriculumGrideService.update({
          ...curriculumGride,
          _id: curriculumGrideId,
        }),
        sendResponse: ['updatedCurriculumGride', async ({ updatedCurriculumGride }) => res.json({
          message: 'Curriculum Gride updated successfully',
          curriculumGride: updatedCurriculumGride,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function remove(req, res, next) {
    try {
      const { curriculumGrideId } = req.params;
      return await async.auto({
        removedCurriculumGride: async () => CurriculumGrideService.remove({
          _id: curriculumGrideId,
        }),
        sendResponse: ['removedCurriculumGride', async () => res.json({
          message: 'Curriculum Gride deleted successfully',
        })],
      });
    } catch (e) {
      return next(e);
    }
  }
};

exports['@singleton'] = true;
exports['@require'] = [
  'components/curriculum-gride/service',
];
