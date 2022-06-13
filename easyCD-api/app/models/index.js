exports = module.exports = function initModels(IoC) {
  return {
    user: IoC.create('user'),
  };
};

exports['@singleton'] = true;
exports['@require'] = ['!container'];
