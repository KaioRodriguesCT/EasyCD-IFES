const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(PersonModel, Utils) {
  return {
    create,
    update,
    removeById,
  };

  async function create(person) {
    const requiredFields = ['name', 'email', 'surname', 'phone'];

    _.forEach(requiredFields, (field) => {
      if (_.isNil(person[field])) {
        Utils.throwError(`Error creating person. Required Field: ${field} not sent`, 400);
      }
    });

    // Updating the full name
    person.fullName = `${person.name} ${person.surname}`;

    return PersonModel.create(person);
  }

  async function update(person) {
    const { updatedPerson } = await async.auto({
      oldPerson: async () => {
        const oldPerson = await PersonModel.findById(person._id).exec();
        if (_.isNil(oldPerson)) {
          Utils.throwError('Error updating Person. Person not found', 404);
        }
        return oldPerson;
      },
      updatedPerson: ['oldPerson', async ({ oldPerson }) => {
        const updatableFields = [
          'name',
          'email',
          'surname',
          'phone',
          'city',
          'uf',
          'address',
        ];
        _.forEach(updatableFields, (field) => {
          if (
            _.isNil(
              person[field] && !_.isEqual(person[field], oldPerson[field]),
            )
          ) {
            oldPerson[field] = person[field];
          }
        });

        // Updating the full name
        person.fullName = `${person.name} ${person.surname}`;

        return oldPerson.save();
      },
      ],
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
