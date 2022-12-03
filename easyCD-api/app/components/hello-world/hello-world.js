exports = module.exports = function helloWorld() {
  return {
    helloWorld: _helloWorld,
  };

  async function _helloWorld(req, res, next) {
    try {
      res.json({ message: 'Hello World' });
      return null;
    } catch (e) {
      return next(e);
    }
  }
};
