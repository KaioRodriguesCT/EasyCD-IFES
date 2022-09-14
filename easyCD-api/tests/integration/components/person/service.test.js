const { expect } = require('chai');
const async = require('async');
const IoC = require('electrolyte');
const app = require('../../../../app');

// Service
const Utils = IoC.create('test/utils');
const PersonService = IoC.create('components/person/service');
const PersonModel = IoC.create('components/person/model');

describe('component/user/person', () => {
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

    it('Should try insert a person with all the fields and success', async () => {});
  });
});
