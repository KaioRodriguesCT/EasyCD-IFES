exports = module.exports = function initUtils() {
  return {
    throwError,
  };

  function throwError(message, code) {
    const error = new Error(message);
    error.status = code;
    throw error;
  }
};
exports['@singleton'] = true;
