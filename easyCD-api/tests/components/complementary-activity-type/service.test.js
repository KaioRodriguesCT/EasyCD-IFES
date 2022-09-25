/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const app = require('../../../app');

const Utils = IoC.create('tests/utils');
const CATypeService = IoC.create('components/complementary-activity-type/service');
const CATypeModel = IoC.create('components/complementary-activity-type/model');

const { ObjectId } = mongoose.Types;
describe('components/complementary-activity-type/service', () => {
  afterEach(async () => {
    await Utils.cleanDatabase();
  });

  const defaultCAType = {
    name: 'CAType Test #1',
    score: 10,
    unit: 'Hour',
    axle: 'Teaching',
  };

  describe('fn: findById', () => {
    it('Should try search by id and succeed', async () => {
      const createdCAType = await CATypeModel.create(defaultCAType);
      const caTypeFound = await CATypeService.findById({ _id: _.get(createdCAType, '_id') });
      expect(caTypeFound).to.not.be.null;
      expect(String(_.get(caTypeFound, '_id'))).to.be.equal(String(_.get(createdCAType, '_id')));
    });
  });

  describe('fn: create', () => {
    it('Should try create complementary activity type, without the complementary activity type, and throw error', async () => {
      let error = false;
      try {
        await CATypeService.create();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Complementary Activity Type. Type not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create complementary activity type, without required field and throw error', async () => {
      const newCAType = {
        name: 'CAType Test #1',
        score: 10,
        unit: 'Hour',
      };
      let error = false;
      try {
        await CATypeService.create(newCAType);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Complementary Activity Type. Required Field: axle not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a enrollment with non valid fields, and ignore then', async () => {
      const validFields = {
        name: 'CAType Test #1',
        score: 10,
        unit: 'Hour',
        axle: 'Teaching',
      };

      const nonValidFields = {
        nonValidField: 'Test',
        testeValidField: '55',
        invalidField: '88',
      };

      const createdCAType = await CATypeService.create({
        ...validFields,
        ...nonValidFields,
      });
      expect(createdCAType).to.be.not.null;

      _.forOwn(validFields, (value, key) => {
        if (mongoose.isValidObjectId(value)) {
          expect(String(createdCAType[key])).to.be.equal(String(value));
        } else {
          expect(createdCAType).to.have.property(key, value);
        }
      });

      _.forOwn(nonValidFields, (value, key) => {
        expect(createdCAType).to.not.have.property(key, value);
      });
    });
  });

  describe('fn: update', () => {
    it('Should try update a CA Type without sent CA Type and throw error', async () => {
      let error = false;
      try {
        await CATypeService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Complementary Activity Type. Type not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a CA Type without sent a CA Type id and throw error', async () => {
      let error = false;
      try {
        await CATypeService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Complementary Activity Type. Type ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a CA type with a non existent CA Type and throw error', async () => {
      let error = false;
      try {
        await CATypeService.update({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Complementary Activity Type. Type not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update a CA Type and succeed, updating only the fields sent and available', async () => {
      const createdCAType = await CATypeService.create(defaultCAType);
      expect(createdCAType).to.be.not.null;
      const CATypeId = _.get(createdCAType, '_id');

      const shouldBeUpdated = {
        description: 'UpdatedDescription',
      };

      const shouldntBeUpdated = {
        name: null,
        score: null,
        unit: '',
        axle: undefined,
      };

      const updatedCAType = await CATypeService.update({
        ...shouldBeUpdated,
        ...shouldntBeUpdated,
        _id: CATypeId,
      });
      expect(updatedCAType).to.be.not.null;

      _.forOwn(shouldBeUpdated, (value, key) => {
        expect(updatedCAType).to.have.property(key, value);
      });

      _.forOwn(shouldntBeUpdated, (value, key) => {
        expect(updatedCAType).to.not.have.property(key, value);
      });
    });
  });

  describe('fn: remove', () => {
    it('Should try remove a CA Type without CA Type and throw error', async () => {
      let error = false;
      try {
        await CATypeService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Complementary Activity Type. Type not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a CA Type without CA Type ID and throw error', async () => {
      let error = false;
      try {
        await CATypeService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Complementary Activity Type. Type ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a CA Type with non existent CA Type and throw error', async () => {
      let error = false;
      try {
        await CATypeService.remove({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Complementary Activity Type. Type not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a CA Type and succeed', async () => {
      const createdCAType = await CATypeService.create(defaultCAType);
      expect(createdCAType).to.be.not.null;
      const CATypeId = _.get(createdCAType, '_id');

      await CATypeService.remove({ _id: CATypeId });
      const removedCAType = await CATypeModel
        .findById(CATypeId)
        .lean()
        .exec();
      expect(removedCAType).to.be.null;
    });
  });
});
