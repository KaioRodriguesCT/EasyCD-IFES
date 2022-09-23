/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const moment = require('moment');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const app = require('../../../app');

const Utils = IoC.create('tests/utils');
const SubjectService = IoC.create('components/subject/service');
const CurriculumGrideModel = IoC.create('components/curriculum-gride/model');
const SubjectModel = IoC.create('components/subject/model');

const { ObjectId } = mongoose.Types;

describe('components/subject/service', () => {
  afterEach(async () => {
    await Utils.cleanDatabase();
  });

  describe('fn: findById', () => {
    it('Should try find subject by id and succeed', async () => {
      const createdSubject = await SubjectModel.create({
        curriculumGride: new ObjectId(),
        name: 'testSubject',
        qtyHours: 60,
      });
      const createdSubjectId = _.get(createdSubject, '_id');
      const subjectFound = await SubjectService.findById({ _id: createdSubjectId });
      expect(subjectFound).to.not.be.null;
      expect(String(_.get(subjectFound, '_id'))).to.be.equal(String(createdSubjectId));
    });
  });

  describe('fn: create', () => {
    it('Should try create a subject without sent a subject, and throw error', async () => {
      let error = false;
      try {
        await SubjectService.create();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Subject. Subject not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a subject without required field, and throw error', async () => {
      let error = false;
      const createdGride = await CurriculumGrideModel.create({
        name: 'grideTest',
        dtStart: moment().format('YYYY-MM-DD'),
        dtEnd: moment().add(6, 'months').format('YYYY-MM-DD'),
        isActive: true,
        course: new ObjectId(),
      });

      const newSubject = {
        name: 'test',
        curriculumGride: _.get(createdGride, '_id'),
      };

      try {
        await SubjectService.create(newSubject);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Subject. Required Field: qtyHours not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a subject and succeed', async () => {
      const createdGride = await CurriculumGrideModel.create({
        name: 'grideTest',
        dtStart: moment().format('YYYY-MM-DD'),
        dtEnd: moment().add(6, 'months').format('YYYY-MM-DD'),
        isActive: true,
        course: new ObjectId(),
      });
      const grideId = _.get(createdGride, '_id');

      const newSubject = {
        name: 'test',
        qtyHours: 60,
        curriculumGride: grideId,
      };

      const createdSubject = await SubjectService.create(newSubject);
      expect(createdSubject).to.be.not.null;

      const gride = await CurriculumGrideModel
        .findById(grideId)
        .lean()
        .exec();
      expect(gride).to.have.property('subjects');
      const { subjects } = gride;
      expect(subjects).to.have.length(1);
      const mappedSubjects = _.map(subjects, (subject) => String(subject));
      expect(mappedSubjects).to.includes(String(_.get(createdSubject, '_id')));
    });

    it('Should try create a subject with non valid fields, and ignore then', async () => {
      const createdGride = await CurriculumGrideModel.create({
        name: 'grideTest',
        dtStart: moment().format('YYYY-MM-DD'),
        dtEnd: moment().add(6, 'months').format('YYYY-MM-DD'),
        isActive: true,
        course: new ObjectId(),
      });
      const grideId = _.get(createdGride, '_id');

      const validFields = {
        name: 'test',
        qtyHours: 60,
        curriculumGride: grideId,
      };

      const nonValidFields = {
        nonValidField: 'Test',
        testeValidField: '55',
        invalidField: '88',
      };

      const createdSubject = await SubjectService.create({ ...validFields, nonValidFields });
      expect(createdSubject).to.be.not.null;

      _.forOwn(validFields, (value, key) => {
        if (mongoose.isValidObjectId(value)) {
          expect(String(createdSubject[key])).to.be.equal(String(value));
        } else {
          expect(createdSubject).to.have.property(key, value);
        }
      });

      _.forOwn(nonValidFields, (value, key) => {
        expect(createdSubject).to.not.have.property(key, value);
      });
    });
  });

  describe('fn: update', async () => {
    it('Should try update a subject without sent subject and throw error', async () => {
      let error = false;
      try {
        await SubjectService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Subject. Subject not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a subject without sent subject ID and throw error', async () => {
      let error = false;
      try {
        await SubjectService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Subject. Subject ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a subject with a non existent subject and throw error', async () => {
      let error = false;
      try {
        await SubjectService.update({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Subject. Subject not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update a subject and succeed, updating only the fields sent and available', async () => {
      const newSubject = {
        name: 'test',
        qtyHours: 60,
        curriculumGride: new ObjectId(),
      };

      const createdSubject = await SubjectModel.create(newSubject);
      expect(createdSubject).to.be.not.null;

      const shouldBeUpdated = {
        description: '',
        externalCod: '',
      };

      const shouldntBeUpdated = {
        name: '',
        qtyHours: null,
        curriculumGride: undefined,
      };

      const updatedSubject = await SubjectService.update({
        ...shouldBeUpdated,
        ...shouldntBeUpdated,
        _id: _.get(createdSubject, '_id'),
      });
      expect(updatedSubject).to.be.not.null;

      _.forOwn(shouldBeUpdated, (value, key) => {
        expect(updatedSubject).to.have.property(key, value);
      });

      _.forOwn(shouldntBeUpdated, (value, key) => {
        expect(updatedSubject).to.not.have.property(key, value);
      });
    });

    it('Should try update a subject and suceeed, updating and processing properly the curriculum gride', async () => {
      const createdOldGride = await CurriculumGrideModel.create({
        name: 'grideTest #1',
        dtStart: moment().format('YYYY-MM-DD'),
        dtEnd: moment().add(6, 'months').format('YYYY-MM-DD'),
        isActive: true,
        course: new ObjectId(),
      });
      expect(createdOldGride).to.be.not.null;
      const oldGrideId = _.get(createdOldGride, '_id');

      const createdNewGride = await CurriculumGrideModel.create({
        name: 'grideTest #1',
        dtStart: moment().format('YYYY-MM-DD'),
        dtEnd: moment().add(6, 'months').format('YYYY-MM-DD'),
        isActive: true,
        course: new ObjectId(),
      });
      expect(createdNewGride).to.be.not.null;
      const newGrideId = _.get(createdNewGride, '_id');
      const newSubject = {
        name: 'test',
        qtyHours: 60,
        curriculumGride: oldGrideId,
      };
      const createdSubject = await SubjectService.create(newSubject);
      expect(createdSubject).to.be.not.null;
      const subjectId = _.get(createdSubject, '_id');

      const oldGride = await CurriculumGrideModel
        .findById(oldGrideId)
        .lean()
        .exec();

      expect(oldGride).to.be.not.null;
      expect(oldGride).to.have.property('subjects');
      const { subjects: oldGrideSubjects } = oldGride;
      expect(oldGrideSubjects).to.have.length(1);
      const mappedOldGrideSubjects = _.map(oldGrideSubjects, (gride) => String(gride));
      expect(mappedOldGrideSubjects).to.includes(String(subjectId));

      const updatedSubject = await SubjectService.update({
        _id: subjectId,
        curriculumGride: newGrideId,
      });

      expect(updatedSubject).to.be.not.null;
      expect(updatedSubject).to.have.property('curriculumGride');
      expect(String(updatedSubject.curriculumGride)).to.be.equal(String(newGrideId));

      const oldGrideUpdated = await CurriculumGrideModel
        .findById(oldGrideId)
        .lean()
        .exec();
      expect(oldGrideUpdated).to.be.not.null;
      expect(oldGrideUpdated).to.have.property('subjects');
      const { subjects: oldUpdatedGrideSubjects } = oldGrideUpdated;
      expect(oldUpdatedGrideSubjects).to.have.length(0);

      const newGride = await CurriculumGrideModel
        .findById(newGrideId)
        .lean()
        .exec();

      expect(newGride).to.be.not.null;
      expect(newGride).to.have.property('subjects');
      const { subjects: newGrideSubjects } = newGride;
      expect(newGrideSubjects).to.have.length(1);
      const mappedNewGrideSubjects = _.map(newGrideSubjects, (gride) => String(gride));
      expect(mappedNewGrideSubjects).to.includes(String(subjectId));
    });
  });

  describe('fn: remove', () => {
    it('Should try remove a subject without sent subject and throw error', async () => {
      let error = false;
      try {
        await SubjectService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Subject. Subject not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a subject without sent subject ID and throw error', async () => {
      let error = false;
      try {
        await SubjectService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Subject. Subject ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a subject with a non existent subject and throw error', async () => {
      let error = false;
      try {
        await SubjectService.remove({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Subject. Subject not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a subject and succeed', async () => {
      const createdGride = await CurriculumGrideModel.create({
        name: 'grideTest #1',
        dtStart: moment().format('YYYY-MM-DD'),
        dtEnd: moment().add(6, 'months').format('YYYY-MM-DD'),
        isActive: true,
        course: new ObjectId(),
      });
      expect(createdGride).to.be.not.null;
      const grideId = _.get(createdGride, '_id');
      const newSubject = {
        name: 'test',
        qtyHours: 60,
        curriculumGride: grideId,
      };
      const createdSubject = await SubjectService.create(newSubject);
      expect(createdSubject).to.be.not.null;
      const subjectId = _.get(createdSubject, '_id');

      const gride = await CurriculumGrideModel
        .findById(grideId)
        .lean()
        .exec();

      expect(gride).to.be.not.null;
      expect(gride).to.have.property('subjects');
      const { subjects } = gride;
      expect(subjects).to.have.length(1);
      const mappedSubjects = _.map(subjects, (subject) => String(subject));
      expect(mappedSubjects).to.includes(String(subjectId));

      await SubjectService.remove({ _id: subjectId });

      const removedSubject = await SubjectModel
        .findById(subjectId)
        .lean()
        .exec();
      expect(removedSubject).to.be.null;

      const updatedGride = await CurriculumGrideModel
        .findById(grideId)
        .lean()
        .exec();

      expect(updatedGride).to.be.not.null;
      expect(updatedGride).to.have.property('subjects');
      const { subjects: updatedGrideSubjects } = updatedGride;
      expect(updatedGrideSubjects).to.have.length(0);
    });
  });

  describe('fn: validateCurriculumGride', () => {
    it('Should try validate a curriculum gride without ID, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await SubjectService.validateCurriculumGride({ defaultErrorMessage: 'Default message' });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Curriculum Gride not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a curriculum gride without a valid ID, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await SubjectService.validateCurriculumGride({
          curriculumGrideId: 'nonValidObjectId',
          defaultErrorMessage: 'Default message',
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Curriculum Gride not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a curriculum gride with a non existent gride and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await SubjectService.validateCurriculumGride({
          curriculumGrideId: new ObjectId(),
          defaultErrorMessage: 'Default message',
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Curriculum Gride not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a curriculum gride and succeed', async () => {
      const createdGride = await CurriculumGrideModel.create({
        name: 'grideTest #1',
        dtStart: moment().format('YYYY-MM-DD'),
        dtEnd: moment().add(6, 'months').format('YYYY-MM-DD'),
        isActive: true,
        course: new ObjectId(),
      });
      expect(createdGride).to.be.not.null;
      const grideId = _.get(createdGride, '_id');

      const validate = await SubjectService.validateCurriculumGride({
        curriculumGrideId: grideId,
        defaultErrorMessage: 'Default Message',
      });
      expect(validate).to.be.not.null;
    });
  });

  describe('fn: addClassroom', () => {
    it('Should try add classroom to a subject without subject and throw error', async () => {
      let error = false;
      const newInfo = {
        subject: null,
        classroomId: new ObjectId(),
      };
      try {
        await SubjectService.addClassroom(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Classroom to Subject. Subject ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add classroom to a subject without classroom and throw error', async () => {
      let error = false;
      const newInfo = {
        subject: new ObjectId(),
        classroomId: null,
      };
      try {
        await SubjectService.addClassroom(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Classroom to Subject. Classroom ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add classroom to a subject with a non existent subject and throw error', async () => {
      let error = false;
      const newInfo = {
        subject: new ObjectId(),
        classroomId: new ObjectId(),
      };
      try {
        await SubjectService.addClassroom(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Classroom to Subject. Subject not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try add classroom to a subject and succeed', async () => {
      const createdSubject = await SubjectModel.create({
        name: 'test',
        qtyHours: 60,
        curriculumGride: new ObjectId(),
      });
      expect(createdSubject).to.be.not.null;
      const subjectId = _.get(createdSubject, '_id');

      const newInfo = {
        subject: subjectId,
        classroomId: new ObjectId(),
      };

      const updatedSubject = await SubjectService.addClassroom(newInfo);
      expect(updatedSubject).to.be.not.null;

      expect(updatedSubject).to.have.property('classrooms');
      const { classrooms } = updatedSubject;
      expect(classrooms).to.have.length(1);
      const mappedClassrooms = _.map(classrooms, (classroom) => String(classroom));
      expect(mappedClassrooms).to.includes(String(newInfo.classroomId));
    });
  });

  describe('fn: removeClassroom', () => {
    it('Should try remove a classroom from subject without subject and throw error', async () => {
      let error = false;
      const newInfo = {
        subject: null,
        classroomId: new ObjectId(),
      };
      try {
        await SubjectService.removeClassroom(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Classroom from Subject. Subject ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a classroom from subject without classroom and throw error', async () => {
      let error = false;
      const newInfo = {
        subject: new ObjectId(),
        classroomId: null,
      };
      try {
        await SubjectService.removeClassroom(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Classroom from Subject. Classroom ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a classroom from subject with a non existent subject and throw error', async () => {
      let error = false;
      const newInfo = {
        subject: new ObjectId(),
        classroomId: new ObjectId(),
      };
      try {
        await SubjectService.removeClassroom(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Classroom from Subject. Subject not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a classroom from subject and succeed', async () => {
      const classroomId = new ObjectId();
      const createdSubject = await SubjectModel.create({
        name: 'test',
        qtyHours: 60,
        curriculumGride: new ObjectId(),
        classrooms: [classroomId],
      });
      expect(createdSubject).to.be.not.null;
      const subjectId = _.get(createdSubject, '_id');

      expect(createdSubject).to.have.property('classrooms');
      const { classrooms } = createdSubject;
      expect(classrooms).to.have.length(1);
      const mappedClassrooms = _.map(classrooms, (classroom) => String(classroom));
      expect(mappedClassrooms).to.includes(String(classroomId));

      const updatedSubject = await SubjectService.removeClassroom({
        subject: subjectId,
        classroomId,
      });

      expect(updatedSubject).to.be.not.null;
      expect(updatedSubject).to.have.property('classrooms');
      const { classrooms: updatedClassrooms } = updatedSubject;
      expect(updatedClassrooms).to.have.length(0);
    });
  });
});
