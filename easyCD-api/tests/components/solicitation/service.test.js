/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const async = require('async');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const app = require('../../../app');

const Utils = IoC.create('tests/utils');
const SolicitationService = IoC.create('components/solicitation/service');
const SolicitationModel = IoC.create('components/solicitation/model');
const SolicitationTypeModel = IoC.create('components/solicitation-type/model');
const PersonModel = IoC.create('components/person/model');

const { ObjectId } = mongoose.Types;
const context = {};
describe('components/solicitation/service', () => {
  before(async () => async.auto({
    solicitationType: async () => {
      context.solicitationType = await SolicitationTypeModel.create({
        name: 'Test',
        description: 'Test',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: true,
        fieldsStructure: [
          {
            name: 'course',
            type: 'ObjectId',
          },
        ],
      });
      return context.solicitationType;
    },
  }));
  after(async () => {
    await Utils.cleanDatabase();
  });

  describe('fn: create', () => {
    it('Should try create a solicitation without sent data, and throw error', async () => {
      let error = false;
      try {
        await SolicitationService.create();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Solicitation. Solicitation not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a solicitation and succeed, updating student and creating solicitation', async () => {
      const student = await Utils.buildDefaultUser({ role: 'student', props: { username: 'testeStudent', registration: 555 } });
      expect(student).to.be.not.null;

      const newSolicitation = {
        student: _.get(student, 'person'),
        solicitationType: _.get(context, 'solicitationType._id'),
        meta: {
          course: new ObjectId(),
        },
      };

      const createdSolicitation = await SolicitationService.create(newSolicitation);
      expect(createdSolicitation).to.be.not.null;
      const solicitationId = String(_.get(createdSolicitation, '_id'));

      const updatedStudent = await PersonModel
        .findById(_.get(student, 'person'))
        .lean()
        .exec();
      expect(updatedStudent).to.be.not.null;
      expect(updatedStudent).to.have.property('solicitations');
      const { solicitations } = updatedStudent;
      expect(_.map(solicitations, (sol) => String(sol))).to.includes(solicitationId);
    });
  });

  describe('fn: update', () => {
    it('Should try update a solicitation, without solicitation and throw error', async () => {
      let error = false;
      try {
        await SolicitationService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Solicitation. Solicitation not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a solicitation, without solicitation ID and throw error', async () => {
      let error = false;
      try {
        await SolicitationService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Solicitation. Solicitation ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a solictation, with non existent ID and throw error', async () => {
      let error = false;
      try {
        await SolicitationService.update({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Solicitation. Solicitation not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update a solictation, and succeed', async () => {
      const student = await Utils.buildDefaultUser({ role: 'student', props: { username: 'testeStudent2', registration: 555 } });
      expect(student).to.be.not.null;

      const createdSolicitation = await SolicitationService.create({
        student: _.get(student, 'person'),
        solicitationType: _.get(context, 'solicitationType._id'),
        meta: {
          course: new ObjectId(),
        },
      });
      expect(createdSolicitation).to.be.not.null;
      const solicitationId = _.get(createdSolicitation, '_id');

      const shouldBeUpdated = {
        teacherNotes: '',
        teacherApproval: true,

      };

      const shouldntBeUpdated = {
        coordinatorApproval: undefined,
        isProcessed: null,
        status: '',
      };

      const updatedSolicitation = await SolicitationService.update({
        ...shouldBeUpdated,
        ...shouldntBeUpdated,
        _id: solicitationId,
      });

      _.forOwn(shouldBeUpdated, (value, field) => {
        expect(updatedSolicitation).to.have.property(field, value);
      });

      _.forOwn(shouldntBeUpdated, (value, field) => {
        expect(updatedSolicitation).to.not.have.property(field, value);
      });
    });
  });

  describe('fn: remove', () => {
    it('Should try remove a solicitation without solicitation and throw error', async () => {
      let error = false;
      try {
        await SolicitationService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Solicitation. Solicitation not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a solicitation without solicitation ID and throw error', async () => {
      let error = false;
      try {
        await SolicitationService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Solicitation. Solicitation ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a solicitation with non existent ID and throw error', async () => {
      let error = false;
      try {
        await SolicitationService.remove({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Solicitation. Solicitation not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a solicitation and succeed', async () => {
      const student = await Utils.buildDefaultUser({ role: 'student', props: { username: 'testeStudent3', registration: 555 } });
      expect(student).to.be.not.null;

      const createdSolicitation = await SolicitationService.create({
        student: _.get(student, 'person'),
        solicitationType: _.get(context, 'solicitationType._id'),
        meta: {
          course: new ObjectId(),
        },
      });
      expect(createdSolicitation).to.be.not.null;
      const solicitationId = String(_.get(createdSolicitation, '_id'));

      const updatedStudent = await PersonModel
        .findById(_.get(student, 'person'))
        .lean()
        .exec();
      expect(updatedStudent).to.be.not.null;
      expect(updatedStudent).to.have.property('solicitations');
      const { solicitations } = updatedStudent;
      expect(_.map(solicitations, (sol) => String(sol))).to.includes(solicitationId);

      await SolicitationService.remove({ _id: solicitationId });
      const removedSolicitation = await SolicitationModel
        .findById(solicitationId)
        .lean()
        .exec();
      expect(removedSolicitation).to.be.null;

      const updatedStudent_ = await PersonModel
        .findById(_.get(student, 'person'))
        .lean()
        .exec();
      expect(updatedStudent_).to.be.not.null;
      expect(updatedStudent_).to.have.property('solicitations');
      const { solicitations: solicitations_ } = updatedStudent_;
      expect(solicitations_).to.have.length(0);
    });
  });

  describe('fn: validateStudent', () => {
    it('Should check if the student is valid but without person, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await SolicitationService.validateStudent({ defaultErrorMessage });
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
        await SolicitationService.validateStudent({
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
        await SolicitationService.validateStudent({
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
        await SolicitationService.validateStudent({
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
      const result = await SolicitationService.validateStudent({
        studentId: _.get(teacher, 'person'),
      });
      expect(result).to.be.not.null;
      expect(result).to.have.property('student');
      expect(result).to.have.property('validatedRole');
    });
  });

  describe('fn: validateSolicitationType', async () => {
    it('Should try validate solicitation type without id, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default error message';
      try {
        await SolicitationService.validateSolicitationType({
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Default error message. Solicitation Type not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate solicitation type without valid id and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default error message';
      try {
        await SolicitationService.validateSolicitationType({
          defaultErrorMessage,
          solicitationTypeId: 'nonValidId',
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Default error message. Solicitation Type not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate solicitation type with non existent Id and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default error message';
      try {
        await SolicitationService.validateSolicitationType({
          defaultErrorMessage,
          solicitationTypeId: new ObjectId(),
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Default error message. Solicitation Type not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try validate solicitation type and succed', async () => {
      const result = await SolicitationService.validateSolicitationType({
        solicitationTypeId: _.get(context, 'solicitationType._id'),
      });
      expect(result).to.be.not.null;
    });
  });
});
