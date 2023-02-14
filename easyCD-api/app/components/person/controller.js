exports = module.exports = function initController(
  PeopleService,
) {
  return { list, listSlim };

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
      const peopleSlim = await PeopleService.findAllSlim();
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
