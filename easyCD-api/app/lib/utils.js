const _ = require('lodash');
const mongoose = require('mongoose');

exports = module.exports = function initUtils() {
  return {
    throwError,
    updateModelWithValidFields,
  };

  function throwError(message, code) {
    const error = new Error(message);
    error.status = code;
    throw error;
  }

  function updateModelWithValidFields({ oldModel, newModel, updatableFields }) {
    _.forOwn(updatableFields, (value, field) => {
      const currentValue = newModel[field];
      const allowEmpty = _.get(value, 'allowEmpty');
      const type = _.get(value, 'type');

      if (_.isUndefined(currentValue)) {
        return;
      }

      if (
        (_.isNull(currentValue)
          || (!mongoose.isValidObjectId(currentValue)
            && _.isObject(currentValue)
            && _.isEmpty(currentValue))
          || (_.isString(currentValue) && !_.size(currentValue)))
        && !allowEmpty
        && !_.isBoolean(currentValue)
      ) {
        return;
      }
      // If there is any validation fn, pass it to the value
      const fnValidation = _.get(value, 'fnValidation');
      if (_.isFunction(fnValidation)) {
        fnValidation(currentValue);
      }

      oldModel[field] = type ? convertType(currentValue, type) : currentValue;
    });
  }

  function convertType(value, type) {
    switch (type) {
      case 'Integer':
        return _.toInteger(value);
      case 'Number':
        return _.toNumber(value);
      default:
        return value;
    }
  }
};
exports['@singleton'] = true;
