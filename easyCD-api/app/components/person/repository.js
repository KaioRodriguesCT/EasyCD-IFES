const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(PersonModel, Utils) {
  return {
    create,
    update,
    removeById,
  };

  async function create(person) {
    const requiredFields = [
      'name',
      'email',
      'surname',
      'phone'];

    _.forEach(requiredFields, (field) => {
      if (_.isNil(person[field])) {
        Utils.throwError(`Error creating person. Required Field: ${field} not sent`, 400);
      }
    });

    // Updating the full name
    person.fullName = `${person.name} ${person.surname}`;

    return PersonModel.create(person);
  }

  async function update(newPerson) {
    const { updatedPerson } = await async.auto({
      oldPerson: async () => PersonModel
        .findById(newPerson._id)
        .exec(),
      updatedPerson: ['oldPerson', async ({ oldPerson }) => {
        _.forOwn(newPerson, (value, field) => {
          oldPerson[field] = value;
        });

        // Updating the full name
        oldPerson.fullName = `${oldPerson.name} ${oldPerson.surname}`;
        return oldPerson.save();
      }],
    });
    return updatedPerson;
  }

  async function removeById(personId) {
    return async.auto({
      person: async () => {
        const person = await PersonModel
          .findById(personId)
          .exec();
        if (!person) {
          Utils.throwError('Error removing person. Person not found', 404);
        }
        return person;
      },
      removedPerson: ['person', async ({ person }) => person.delete()],
    });
  }
};
exports['@singleton'] = true;
exports['@require'] = ['components/person/model', 'lib/utils'];
