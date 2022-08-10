const _ = require('lodash');

exports = module.exports = function initService(PersonRepository, Utils) {
  return {
    create,
    update,
    remove,
  };

  async function create(person) {
    const initialFields = [
      'name',
      'email',
      'surname',
      'phone',
      'city',
      'uf',
      'address',
    ];
    const newPerson = _.pick(person, initialFields);
    return PersonRepository.create(newPerson);
  }

  async function update(person) {
    if (_.isNil(person)) {
      Utils.throwError('Error updating person. Person not sent', 400);
    }
    if (_.isNil(person._id)) {
      Utils.throwError('Error updating person. Person ID not sent', 400);
    }
    return PersonRepository.update(person);
  }

  async function remove(personId) {
    if (_.isNil(personId)) {
      Utils.throwError('Error updating person. Person ID not sent', 400);
    }
    return PersonRepository.removeById(personId);
  }
};
exports['@singleton'] = true;
exports['@require'] = ['components/person/repository', 'lib/utils'];
