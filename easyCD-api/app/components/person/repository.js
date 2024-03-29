const _ = require('lodash');
const async = require('async');

exports = module.exports = function initRepository(
  PersonModel,
  Utils,
) {
  return {
    create,
    update,
    removeById,
    findById,
    findAll,
    aggregate,
  };

  async function findAll({ filters, select }) {
    return PersonModel
      .find(filters)
      .select(select)
      .lean()
      .exec();
  }

  async function findById({ _id, select }) {
    return PersonModel
      .findById(_id)
      .select(select)
      .lean()
      .exec();
  }

  async function aggregate(pipeline) {
    return PersonModel.aggregate(pipeline);
  }

  async function create(person) {
    const requiredFields = [
      'firstname',
      'surname',
      'email',
      'phone',
    ];
    _.forEach(requiredFields, (field) => {
      if (_.isNil(person[field])) {
        Utils.throwError(`Error creating person. Required Field: ${field} not sent`, 400);
      }
    });
    // Updating the full name
    person.name = `${person.firstname} ${person.surname}`;
    const newPerson = await PersonModel.create(person);
    return newPerson.toJSON();
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
        oldPerson.name = `${oldPerson.firstname} ${oldPerson.surname}`;
        return oldPerson.save();
      }],
    });
    return updatedPerson.toJSON();
  }

  async function removeById(personId) {
    const person = await PersonModel
      .findById(personId)
      .exec();
    if (!person) {
      Utils.throwError('Error removing person. Person not found', 404);
    }
    return person.delete();
  }
};
exports['@singleton'] = true;
exports['@require'] = [
  'components/person/model',
  'lib/utils',
];
