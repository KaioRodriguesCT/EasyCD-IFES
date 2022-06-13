exports = module.exports = function initLib(IoC) {
  return {
    utils: IoC.create('utils'),
  };
};
exports['@singleton'] = true;
exports['@require'] = ['!container'];
