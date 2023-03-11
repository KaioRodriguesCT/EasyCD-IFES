const async = require('async');

exports = module.exports = function initController(
  PeopleService,
) {
  return {
    list, listSlim, listSlimByRole, update,
  };

  async function update(req, res, next) {
    try {
      const { personId } = req.params;
      const { person } = req.body;
      return await async.auto({
        updatedPerson: async () => PeopleService.update({
          ...person,
          _id: personId,
        }),
        sendResponse: ['updatedPerson', async ({ updatedPerson }) => res.json({
          message: 'Person updated successfully',
          person: updatedPerson,
        })],
      });
    } catch (e) {
      return next(e);
    }
  }

  async function list(req, res, next) {
    try {
      const { query: { filters } } = req;
      const people = await PeopleService.findAll({ filters });
      return res.json({ people });
    } catch (e) {
      return next(e);
    }
  }

  async function listSlim(req, res, next) {
    try {
      const { query: { filters } } = req;
      const peopleSlim = await PeopleService.findAllSlim({ filters });
      return res.json({ peopleSlim });
    } catch (e) {
      return next(e);
    }
  }

  async function listSlimByRole(req, res, next) {
    try {
      const { query: { role } } = req;
      const peopleSlim = await PeopleService.findAllSlimByRole({ role });
      return res.json({ peopleSlim });
    } catch (e) {
      return next(e);
    }
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/person/service',
];
