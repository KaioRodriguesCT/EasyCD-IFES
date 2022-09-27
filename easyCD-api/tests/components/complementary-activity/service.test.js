/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const async = require('async');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const app = require('../../../app');

const Utils = IoC.create('tests/utils');
const CAService = IoC.create('components/complementary-activity/service');
const CAModel = IoC.create('components/complementary-activity/model');
const CATModel = IoC.create('components/complementary-activity-type/model');
const CourseModel = IoC.create('components/course/model');
const PersonModel = IoC.create('components/person/model');

const { ObjectId } = mongoose.Types;
const context = {};
describe('components/complementary-activity/service', () => {
  beforeEach(async () => async.auto({
    CAType: async () => {
      context.CAType = await CATModel.create({
        name: 'teste',
        score: 2,
        unit: 'Hour',
        axle: 'Teaching',
      });
    },
    course: async () => {
      context.course = await CourseModel.create({
        name: 'Course Test',
        coordinator: new ObjectId(),
      });
    },
    student: async () => {
      context.student = await Utils.buildDefaultUser({
        role: 'student',
        props: { registration: '888', username: 'student' },
      });
    },
    teacher: async () => {
      context.teacher = await Utils.buildDefaultUser({
        role: 'teacher',
        props: { siape: 88, username: 'teacher' },
      });
    },
  }));

  afterEach(async () => {
    await Utils.cleanDatabase();
  });

  describe('fn: findById', () => {
    it('Should try find curriculum gride by id and succeed', async () => {
      const createdCActivity = await CAModel.create({
        complementaryActivityType: new ObjectId(),
        student: new ObjectId(),
        course: new ObjectId(),
        status: 'Accepted',
        evidence: Buffer.from('buffer'),
        quantity: 1,
      });
      const CActivityId = _.get(createdCActivity, '_id');
      const CActivityFound = await CAService.findById({ _id: CActivityId });
      expect(CActivityFound).to.not.be.null;
      expect(String(_.get(CActivityFound, '_id'))).to.be.equal(String(CActivityId));
    });
  });

  describe('fn: create', () => {
    it('Should try create a complementary activity without sent data, and throw error', async () => {
      let error = false;
      try {
        await CAService.create();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Complementary Activity. Activity not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a complementary activity without required field, and throw error', async () => {
      let error = false;
      const newCA = {
        complementaryActivityType: _.get(context, 'CAType._id'),
        student: _.get(context, 'student.person'),
        course: _.get(context, 'course._id'),
        status: 'Accepted',
        evidence: Buffer.from('buffer'),
      };
      try {
        await CAService.create(newCA);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Complementary Activity. Required Field: quantity not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a complementary activity with non valid fields, and ignore then', async () => {
      const validFields = {
        complementaryActivityType: _.get(context, 'CAType._id'),
        student: _.get(context, 'student.person'),
        course: _.get(context, 'course._id'),
        status: 'Accepted',
        evidence: Buffer.from('buffer'),
        quantity: 2,
      };

      const nonValidFields = {
        nonValidField: 'Test',
        testeValidField: '55',
        invalidField: '88',
      };

      const createdCActivity = await CAService.create({
        ...validFields,
        ...nonValidFields,
      });
      expect(createdCActivity).to.be.not.null;
      _.forOwn(validFields, (value, key) => {
        if (mongoose.isValidObjectId(value)) {
          expect(String(createdCActivity[key])).to.be.equal(String(value));
        } else if (_.isBuffer(value)) {
          null;
        } else {
          expect(createdCActivity).to.have.property(key, value);
        }
      });

      _.forOwn(nonValidFields, (value, key) => {
        expect(createdCActivity).to.not.have.property(key, value);
      });
    });

    it('Should try create a complementary activity and succeed, updating student', async () => {
      const studentId = _.get(context, 'student.person');
      const newCA = {
        complementaryActivityType: _.get(context, 'CAType._id'),
        student: studentId,
        course: _.get(context, 'course._id'),
        status: 'Accepted',
        evidence: Buffer.from('buffer'),
        quantity: 2,
      };
      const createdCA = await CAService.create(newCA);
      expect(createdCA).to.be.not.null;
      const caId = String(_.get(createdCA, '_id'));

      const updatedStudent = await PersonModel
        .findById(studentId)
        .lean()
        .exec();
      expect(updatedStudent).to.be.not.null;
      expect(updatedStudent).to.have.property('complementaryActivities');
      const { complementaryActivities: studentCA } = updatedStudent;
      expect(studentCA).to.have.length(1);
      const mappedStudentCA = _.map(studentCA, (ca) => String(ca));
      expect(mappedStudentCA).to.includes(caId);
    });
  });

  describe('fn: update', () => {
    it('Should try update a complementary activity without sent data, and throw error', async () => {
      let error = false;
      try {
        await CAService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Complementary Activity. Activity not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a complementary activity without sent id, and throw error', async () => {
      let error = false;
      try {
        await CAService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Complementary Activity. Activity ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a complementary activity with a non existent ID, and throw error', async () => {
      let error = false;
      try {
        await CAService.update({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Complementary Activity. Activity not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update a complementary activity and succeed, updating only the fields sent and available', async () => {
      const studentId = _.get(context, 'student.person');
      const newCAType = await CATModel.create({
        name: 'teste',
        score: 2,
        unit: 'Hour',
        axle: 'Teaching',
      });
      const newCA = {
        complementaryActivityType: _.get(context, 'CAType._id'),
        student: studentId,
        course: _.get(context, 'course._id'),
        status: 'Accepted',
        evidence: Buffer.from('buffer'),
        quantity: 2,
      };
      const createdCA = await CAService.create(newCA);
      expect(createdCA).to.be.not.null;
      const caId = String(_.get(createdCA, '_id'));

      const shouldntBeUpdated = {
        status: null,
        evidence: '',
        quantity: undefined,
      };

      const shouldBeUpdated = {
        complementaryActivityType: _.get(newCAType, '_id'),
        statusJustification: 'Updated',
      };

      const updatedCA = await CAService.update({
        ...shouldBeUpdated,
        ...shouldntBeUpdated,
        _id: caId,
      });
      expect(updatedCA).to.be.not.null;

      _.forOwn(shouldBeUpdated, (value, key) => {
        if (mongoose.isValidObjectId(value)) {
          expect(String(updatedCA[key])).to.be.equal(String(value));
        } else {
          expect(updatedCA).to.have.property(key, value);
        }
      });

      _.forOwn(shouldntBeUpdated, (value, key) => {
        expect(updatedCA).to.not.have.property(key, value);
      });
    });
  });

  describe('fn: remove', () => {
    it('Should try remove a complementary activity without sent data, and throw error', async () => {
      let error = false;
      try {
        await CAService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Complementary Activity. Activity not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a complementary activity without ID, and throw error', async () => {
      let error = false;
      try {
        await CAService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Complementary Activity. Activity ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a complementary activity with a non existent CA, and throw error', async () => {
      let error = false;
      try {
        await CAService.remove({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Complementary Activity. Activity not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a complementary activity and succeed, updating student properly', async () => {
      const studentId = _.get(context, 'student.person');
      const newCA = {
        complementaryActivityType: _.get(context, 'CAType._id'),
        student: studentId,
        course: _.get(context, 'course._id'),
        status: 'Accepted',
        evidence: Buffer.from('buffer'),
        quantity: 2,
      };
      const createdCA = await CAService.create(newCA);
      expect(createdCA).to.be.not.null;
      const caId = String(_.get(createdCA, '_id'));

      const student = await PersonModel
        .findById(studentId)
        .lean()
        .exec();
      expect(student).to.be.not.null;
      expect(student).to.have.property('complementaryActivities');
      const { complementaryActivities: studentCA } = student;
      expect(studentCA).to.have.length(1);
      const mappedStudentCA = _.map(studentCA, (ca) => String(ca));
      expect(mappedStudentCA).to.includes(caId);

      await CAService.remove({ _id: caId });
      const removedCA = await CAModel
        .findById(caId)
        .lean()
        .exec();
      expect(removedCA).to.be.null;

      const updatedStudent = await PersonModel
        .findById(studentId)
        .lean()
        .exec();
      expect(updatedStudent).to.be.not.null;
      expect(updatedStudent).to.have.property('complementaryActivities');
      const { complementaryActivities: updatedStudentCA } = updatedStudent;
      expect(updatedStudentCA).to.have.length(0);
    });
  });

  describe('fn: validateStudent', () => {
    it('Should check if the student is valid but without person, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CAService.validateStudent({ defaultErrorMessage });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Student not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should check if the student is valid but don\'t exists, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CAService.validateStudent({
          studentId: new ObjectId(),
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Student not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should check if the student is valid, but that person do\'t have a valid user and throw error', async () => {
      const person = await PersonModel.create({
        name: 'name1',
        surname: 'surname1',
        email: 'email@test.com',
        phone: '8888888',
      });

      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CAService.validateStudent({
          studentId: _.get(person, '_id'),
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. User not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should check if the student is valid, but the user role isn\'t valid and throw error', async () => {
      const student = await Utils.buildDefaultUser({ role: 'teacher', props: { username: 'teacher2', siape: '55' } });
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CAService.validateStudent({
          studentId: _.get(student, 'person'),
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Person sent can't be student`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should check if the student is valid and succeed without errors', async () => {
      const teacher = await Utils.buildDefaultUser({ role: 'student', props: { username: 'student2', registration: '55' } });
      const result = await CAService.validateStudent({
        studentId: _.get(teacher, 'person'),
      });
      expect(result).to.be.not.null;
      expect(result).to.have.property('student');
      expect(result).to.have.property('validatedRole');
    });
  });

  describe('fn: validateComplementaryActivityType', () => {
    it('Should try validate a complementary activity type without CA type id and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CAService.validateComplementaryActivityType({ defaultErrorMessage });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Activity Type not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity type with a non valid ID and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CAService.validateComplementaryActivityType({
          complementaryActivityTypeId: 'nonValidObjectId',
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Activity Type not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity type with ha non existent ID, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CAService.validateComplementaryActivityType({
          complementaryActivityTypeId: new ObjectId(),
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Activity Type not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity type and succeed', async () => {
      const result = await CAService.validateComplementaryActivityType({
        complementaryActivityTypeId: _.get(context, 'CAType._id'),
      });
      expect(result).to.be.not.null;
    });
  });
});
