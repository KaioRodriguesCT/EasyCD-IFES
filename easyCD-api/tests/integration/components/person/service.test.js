const _ = require('lodash');
const { expect } = require('chai');
const IoC = require('electrolyte');
// eslint-disable-next-line no-unused-vars
const app = require('../../../../app');

// Service
const Utils = IoC.create('tests/utils');
const PersonService = IoC.create('components/person/service');
const PersonModel = IoC.create('components/person/model');

describe('component/person/service', () => {
  afterEach(async () => {
    await Utils.cleanDatabase();
  });
  describe('fn: create', () => {
    it('Should try insert a person without required fields and throw error', async () => {
      const newPerson = {
        name: 'Person',
        surname: '#1',
        email: 'person1@email.com',
      };
      let error = false;
      try {
        await PersonService.create(newPerson);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating person. Required Field: phone not sent');
        expect(e).to.have.property('status', 400);
      }
      // eslint-disable-next-line no-unused-expressions
      expect(error).to.be.true;
    });

    it('Should try insert a person with all the fields and succeed', async () => {
      const newPerson = {
        name: 'Person',
        surname: '#1',
        email: 'person1@email.com',
        phone: '27 998984171',
        uf: 'UF test',
        address: 'Address Test',
      };
      const createdPerson = await PersonService.create(newPerson);
      _.forOwn(newPerson, (value, key) => {
        expect(createdPerson).to.have.property(key, value);
      });
    });

    it('Should try insert a person but send not valid fields and ignore then', async () => {
      const newPerson = {
        name: 'Person',
        surname: '#1',
        email: 'person1@email.com',
        phone: '27 998984171',
        uf: 'UF test',
        address: 'Address Test',
      };

      const nonValidFields = {
        shoulder: 'Shoulder test',
        license: 'License test',
      };

      const createdPerson = await PersonService.create({ ...newPerson, ...nonValidFields });
      _.forOwn(newPerson, (value, key) => {
        expect(createdPerson).to.have.property(key, value);
      });

      _.forOwn(nonValidFields, (value, key) => {
        expect(createdPerson).to.not.have.property(key, value);
      });
    });
  });
});
