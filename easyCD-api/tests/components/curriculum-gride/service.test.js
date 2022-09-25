/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const moment = require('moment');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const app = require('../../../app');

const Utils = IoC.create('tests/utils');
const CurriculumGrideService = IoC.create('components/curriculum-gride/service');
const CurriculumGrideModel = IoC.create('components/curriculum-gride/model');
const CourseModel = IoC.create('components/course/model');

const { ObjectId } = mongoose.Types;

describe('components/curriculum-gride/service', () => {
  afterEach(async () => {
    await Utils.cleanDatabase();
  });

  describe('fn: findById', () => {
    it('Should try find curriculum gride by id and succeed', async () => {
      const createdGride = await CurriculumGrideModel.create({
        course: new ObjectId(),
        dtStart: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        dtEnd: moment().add(2, 'years').format('YYYY-MM-DD'),
        name: 'testGride',
      });
      const createdGrideId = _.get(createdGride, '_id');
      const grideFound = await CurriculumGrideService.findById({ _id: createdGrideId });
      expect(grideFound).to.not.be.null;
      expect(String(_.get(grideFound, '_id'))).to.be.equal(String(createdGrideId));
    });
  });

  describe('fn: create', () => {
    it('Should try create a curriculum gride without sent curriculum gride, and throw error', async () => {
      let error = false;
      try {
        await CurriculumGrideService.create();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Curriculum Gride. Curriculum Gride not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a curriculum gride without required fields, and throw error', async () => {
      const createdCourse = await CourseModel.create({ name: 'teste', coordinator: new ObjectId() });
      let error = false;
      const newCurriculumGride = {
        course: _.get(createdCourse, '_id'),
        dtStart: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        dtEnd: moment().add(2, 'years').format('YYYY-MM-DD'),
      };
      try {
        await CurriculumGrideService.create(newCurriculumGride);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Curriculum Gride. Required Field: name not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a curriculum gride and succeed', async () => {
      const createdCourse = await CourseModel.create({ name: 'teste', coordinator: new ObjectId() });
      const courseId = String(_.get(createdCourse, '_id'));
      const newCurriculumGride = {
        course: courseId,
        dtStart: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        dtEnd: moment().add(2, 'years').format('YYYY-MM-DD'),
        name: 'testGride',
      };
      const createdGride = await CurriculumGrideService.create(newCurriculumGride);
      expect(createdGride).to.be.not.null;

      const course = await CourseModel
        .findById(courseId)
        .lean()
        .exec();

      expect(course).to.have.property('curriculumGrides');
      const { curriculumGrides } = course;
      expect(curriculumGrides).to.have.length(1);
      const mappedGrides = _.map(curriculumGrides, (gride) => String(gride));
      expect(mappedGrides).to.includes(String(_.get(createdGride, '_id')));
    });

    it('Should try create a curriculum gride with non valid fields, and ignore then', async () => {
      const createdCourse = await CourseModel.create({ name: 'teste', coordinator: new ObjectId() });
      const courseId = String(_.get(createdCourse, '_id'));
      const validFields = {
        course: courseId,
        dtStart: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        dtEnd: moment().add(2, 'years').format('YYYY-MM-DD'),
        name: 'testGride',
      };

      const nonValidFields = {
        nonValidField: 'Test',
        testeValidField: '55',
        invalidField: '88',
      };

      const createdGride = await CurriculumGrideService.create({ ...validFields, nonValidFields });

      _.forOwn(nonValidFields, (value, key) => {
        expect(createdGride).to.not.have.property(key, value);
      });

      _.forOwn(validFields, (value, key) => {
        if (mongoose.isValidObjectId(value)) {
          expect(String(createdGride[key])).to.be.equal(String(validFields[key]));
        } else {
          expect(createdGride).to.have.property(key, value);
        }
      });
    });
  });

  describe('fn: update', () => {
    it('Should try update gride without sent gride and throw error', async () => {
      let error = false;
      try {
        await CurriculumGrideService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Curriculum Gride. Curriculum Gride not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update gride without sent the ID and throw error', async () => {
      let error = false;
      try {
        await CurriculumGrideService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Curriculum Gride. Curriculum Gride ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update gride with non existent grid and throw error', async () => {
      let error = false;
      try {
        await CurriculumGrideService.update({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Curriculum Gride. Curriculum Gride not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update gride and succeed, updating only the fields sent and available', async () => {
      const newGride = {
        course: new ObjectId(),
        name: 'test',
        dtStart: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        dtEnd: moment().add(2, 'years').format('YYYY-MM-DD'),
        isActive: true,
      };

      const createdGride = await CurriculumGrideModel.create(newGride);
      expect(createdGride).to.be.not.null;

      const shouldntBeEmpty = {
        name: '',
        dtEnd: null,
        course: undefined,
      };

      const shouldBeUpdated = {
        dtStart: moment().format(),
      };

      const updatedGride = await CurriculumGrideService.update({
        ...shouldntBeEmpty,
        ...shouldBeUpdated,
        _id: _.get(createdGride, '_id'),
      });
      expect(updatedGride).to.be.not.null;

      _.forOwn(shouldntBeEmpty, (value, key) => {
        expect(updatedGride).to.not.have.property(key, value);
      });

      _.forOwn(shouldBeUpdated, (value, key) => {
        expect(updatedGride).to.have.property(key, value);
      });
    });

    it('Should try update gride and succeed, updating and processing properly the courses', async () => {
      const createdOldCourse = await CourseModel.create({
        name: 'CourseTeste',
        coordinator: new ObjectId(),
      });
      expect(createdOldCourse).to.be.not.null;
      const oldCourseId = _.get(createdOldCourse, '_id');

      const createdNewCourse = await CourseModel.create({
        name: 'CourseTeste',
        coordinator: new ObjectId(),
      });
      expect(createdNewCourse).to.be.not.null;
      const newCourseId = _.get(createdNewCourse, '_id');

      const newGride = {
        course: oldCourseId,
        name: 'test',
        dtStart: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        dtEnd: moment().add(2, 'years').format('YYYY-MM-DD'),
        isActive: true,
      };

      const createdGride = await CurriculumGrideService.create(newGride);
      expect(createdGride).to.be.not.null;
      const grideId = _.get(createdGride, '_id');

      const oldCourse = await CourseModel
        .findById(oldCourseId)
        .lean()
        .exec();

      expect(oldCourse).to.be.not.null;
      expect(oldCourse).to.have.property('curriculumGrides');
      const { curriculumGrides: oldCourseGrides } = oldCourse;
      expect(oldCourseGrides).to.have.length(1);
      const mappedOldCourseGrides = _.map(oldCourseGrides, (gride) => String(gride));
      expect(mappedOldCourseGrides).to.includes(String(grideId));

      const updatedGride = await CurriculumGrideService.update({
        _id: grideId,
        course: newCourseId,
      });
      expect(updatedGride).to.be.not.null;
      expect(updatedGride).to.have.property('course');
      expect(String(updatedGride.course)).to.be.equal(String(newCourseId));

      const oldCourseUpdated = await CourseModel
        .findById(oldCourseId)
        .lean()
        .exec();

      expect(oldCourseUpdated).to.be.not.null;
      expect(oldCourseUpdated).to.have.property('curriculumGrides');
      const { curriculumGrides: oldCOurseGridesUpdated } = oldCourseUpdated;
      expect(oldCOurseGridesUpdated).to.have.length(0);

      const newCourse = await CourseModel
        .findById(newCourseId)
        .lean()
        .exec();

      expect(newCourse).to.be.not.null;
      expect(newCourse).to.have.property('curriculumGrides');
      const { curriculumGrides: newCourseGrides } = oldCourse;
      expect(newCourseGrides).to.have.length(1);
      const mappedNewCourseGrides = _.map(newCourseGrides, (gride) => String(gride));
      expect(mappedNewCourseGrides).to.includes(String(grideId));
    });
  });

  describe('fn: remove', () => {
    it('Should try remove gride without gride, and throw error', async () => {
      let error = false;
      try {
        await CurriculumGrideService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Curriculum Gride. Curriculum Gride not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove gride without gride ID, and throw error', async () => {
      let error = false;
      try {
        await CurriculumGrideService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Curriculum Gride. Curriculum Gride ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove gride with a non existent gride, and throw error', async () => {
      let error = false;
      try {
        await CurriculumGrideService.remove({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Curriculum Gride. Curriculum Gride not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove gride and succeed', async () => {
      const createdCourse = await CourseModel.create({
        name: 'teste',
        coordinator: new ObjectId(),
      });
      expect(createdCourse).to.be.not.null;
      const courseId = _.get(createdCourse, '_id');

      const newGride = {
        course: courseId,
        name: 'test',
        dtStart: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        dtEnd: moment().add(2, 'years').format('YYYY-MM-DD'),
        isActive: true,
      };

      const createdGride = await CurriculumGrideService.create(newGride);
      expect(createdGride).to.be.not.null;
      const grideId = _.get(createdGride, '_id');

      const course = await CourseModel
        .findById(courseId)
        .lean()
        .exec();
      expect(course).to.be.not.null;
      expect(course).to.have.property('curriculumGrides');
      const { curriculumGrides } = course;
      expect(curriculumGrides).to.have.length(1);
      const mappedGrides = _.map(curriculumGrides, (gride) => String(gride));
      expect(mappedGrides).to.includes(String(grideId));

      await CurriculumGrideService.remove({ _id: grideId });

      const removedGride = await CurriculumGrideModel
        .findById(grideId)
        .lean()
        .exec();
      expect(removedGride).to.be.null;

      const updatedCourse = await CourseModel
        .findById(courseId)
        .lean()
        .exec();
      expect(updatedCourse).to.be.not.null;
      expect(updatedCourse).to.have.property('curriculumGrides');
      const { curriculumGrides: updatedCourseGrides } = updatedCourse;
      expect(updatedCourseGrides).to.have.length(0);
    });
  });

  describe('fn: validateCourse', () => {
    it('Should try validate a course without course id, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CurriculumGrideService.validateCourse({ defaultErrorMessage: 'Default message' });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Course not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a course without a valid ID, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CurriculumGrideService.validateCourse({
          courseId: 'nonValidObjectId',
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Course not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a course with a non existent course and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CurriculumGrideService.validateCourse({
          courseId: new ObjectId(),
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Course not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a course and succeed', async () => {
      const createdCourse = await CourseModel.create({
        name: 'Teste',
        coordinator: new ObjectId(),
      });
      const validate = await CurriculumGrideService.validateCourse({
        courseId: _.get(createdCourse, '_id'),
        defaultErrorMessage: 'Default message',
      });
      expect(validate).to.be.not.null;
    });
  });

  describe('fn: addSubject', () => {
    it('Should try add a subject to a curriculum gride without curriculum gride, and throw error', async () => {
      let error = false;
      const newInfo = {
        curriculumGride: null,
        subjectId: new ObjectId(),
      };
      try {
        await CurriculumGrideService.addSubject(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Subject to Curriculum Gride. Curriculum gride ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a subject to a curriculum gride without subject, and throw error', async () => {
      let error = false;
      const newInfo = {
        curriculumGride: new ObjectId(),
        subjectId: null,
      };
      try {
        await CurriculumGrideService.addSubject(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Subject to Curriculum Gride. Subject ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a subject to a curriculum gride with a non existent gride and throw error', async () => {
      let error = false;
      const newInfo = {
        curriculumGride: new ObjectId(),
        subjectId: new ObjectId(),
      };
      try {
        await CurriculumGrideService.addSubject(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Subject to Curriculum Gride. Curriculum Gride not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try add a subject to a curriculum gride and succed', async () => {
      const createdGride = await CurriculumGrideModel.create({
        course: new ObjectId(),
        dtStart: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        dtEnd: moment().add(2, 'years').format('YYYY-MM-DD'),
        name: 'testGride',
      });
      expect(createdGride).to.be.not.null;
      const grideId = _.get(createdGride, '_id');

      const newInfo = {
        curriculumGride: grideId,
        subjectId: new ObjectId(),
      };

      const updatedGride = await CurriculumGrideService.addSubject(newInfo);
      expect(updatedGride).to.be.not.null;

      expect(updatedGride).to.have.property('subjects');
      const { subjects } = updatedGride;
      expect(subjects).to.have.length(1);
      const mappedSubjects = _.map(subjects, (subject) => String(subject));
      expect(mappedSubjects).to.includes(String(newInfo.subjectId));
    });
  });

  describe('fn: removeSubject', () => {
    it('Should try remove a subject from curriculum gride without curriculum gride and throw error', async () => {
      let error = false;
      const newInfo = {
        curriculumGride: null,
        subjectId: new ObjectId(),
      };
      try {
        await CurriculumGrideService.removeSubject(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Subject from Curriculum Gride. Curriculum gride ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a subject from curriculum gride without subject and throw error', async () => {
      let error = false;
      const newInfo = {
        curriculumGride: new ObjectId(),
        subjectId: null,
      };
      try {
        await CurriculumGrideService.removeSubject(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Subject from Curriculum Gride. Subject ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a subject from curriculum gride with a non existent curriculum gride and throw error', async () => {
      let error = false;
      const newInfo = {
        curriculumGride: new ObjectId(),
        subjectId: new ObjectId(),
      };
      try {
        await CurriculumGrideService.removeSubject(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Subject from Curriculum Gride. Curriculum Gride not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a subject from curriculum gride and succeed', async () => {
      const subjectId = new ObjectId();
      const createdCurriculumGride = await CurriculumGrideModel.create({
        course: new ObjectId(),
        dtStart: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        dtEnd: moment().add(2, 'years').format('YYYY-MM-DD'),
        name: 'testGride',
        subjects: [subjectId],
      });
      expect(createdCurriculumGride).to.be.not.null;
      const grideId = _.get(createdCurriculumGride, '_id');

      expect(createdCurriculumGride).to.have.property('subjects');
      const { subjects } = createdCurriculumGride;
      expect(subjects).to.have.length(1);
      const mappedSubjects = _.map(subjects, (subject) => String(subject));
      expect(mappedSubjects).to.includes(String(subjectId));

      const updatedGride = await CurriculumGrideService.removeSubject({
        curriculumGride: grideId,
        subjectId,
      });

      expect(updatedGride).to.be.not.null;
      expect(updatedGride).to.have.property('subjects');
      const { subjects: updatedSubjects } = updatedGride;
      expect(updatedSubjects).to.have.length(0);
    });
  });
});
