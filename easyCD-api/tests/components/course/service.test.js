/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
const async = require(('async'));
// eslint-disable-next-line no-unused-vars
const app = require('../../../app');

const Utils = IoC.create('tests/utils');
const CourseService = IoC.create('components/course/service');
const CourseModel = IoC.create('components/course/model');
const PersonModel = IoC.create('components/person/model');

const { ObjectId } = mongoose.Types;

const context = {};
describe('components/course/service', async () => {
  beforeEach(async () => async.auto({
    teacher: async () => {
      const createdUser = await Utils.buildDefaultUser({ role: 'teacher', props: { username: 'teacher', siape: 55 } });
      context.teacher = createdUser;
    },
    student: async () => {
      const createdUser = await Utils.buildDefaultUser({ role: 'student', props: { username: 'student', registration: 55 } });
      context.student = createdUser;
    },
  }));

  afterEach(async () => {
    await Utils.cleanDatabase();
  });

  describe('fn: findById', () => {
    it('Should try find course by id and succeed', async () => {
      const createdCourse = await CourseModel.create({
        name: 'test',
        coordinator: _.get(context, 'student.person'),
      });
      const courseFound = await CourseService.findById({ _id: _.get(createdCourse, '_id') });
      expect(courseFound).to.not.be.null;
      expect(String(_.get(courseFound, '_id'))).to.be.equal(String(_.get(createdCourse, '_id')));
    });
  });

  describe('fn: create', () => {
    it('Should try create a course without sending a course, and throw error', async () => {
      let error = false;
      try {
        await CourseService.create();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating course. Course not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a course without required fields and throw error', async () => {
      let error = false;
      const course = {
        coordinator: _.get(context, 'teacher.person'),
      };
      try {
        await CourseService.create(course);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating course. Required Field: name not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a course and succeed', async () => {
      const userPerson = _.get(context, 'teacher.person');
      const newCourse = {
        coordinator: String(userPerson),
        name: 'Test',
      };
      const createdCourse = await CourseService.create(newCourse);
      expect(createdCourse).to.be.not.null;

      const coordinator = await PersonModel
        .findById(userPerson)
        .lean()
        .exec();

      expect(coordinator).to.have.property('courses');
      const { courses } = coordinator;
      expect(courses).to.have.length(1);
      const mappedCourses = _.map(courses, (course) => String(course));
      expect(mappedCourses).to.includes(String(_.get(createdCourse, '_id')));
    });

    it('Should try create a course with non valid fields, and ignore then', async () => {
      const userPerson = _.get(context, 'teacher.person');
      const validFields = {
        coordinator: String(userPerson),
        name: 'Test',
      };

      const nonValidFields = {
        test: 1,
        nonValid2: 55,
        stepway: 'Teste',
      };

      const createdCourse = await CourseService.create({ ...validFields, ...nonValidFields });
      expect(createdCourse).to.be.not.null;

      _.forOwn(validFields, (value, key) => {
        if (mongoose.isValidObjectId(value)) {
          expect(String(createdCourse[key])).to.be.equal(String(value));
        } else {
          expect(createdCourse).to.have.property(key, value);
        }
      });

      _.forOwn(nonValidFields, (value, key) => {
        expect(createdCourse).to.not.have.property(key, value);
      });
    });
  });

  describe('fn: update', () => {
    it('Should try update a cours without sending the course, and throw error', async () => {
      let error = false;
      try {
        await CourseService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating course. Course not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a course without course ID and throw error', async () => {
      let error = false;
      try {
        await CourseService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating course. Course ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a course with a non existent course and throw error', async () => {
      let error = false;
      try {
        await CourseService.update({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating course Course not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update a course and succedd, updating only the fields sent and available', async () => {
      const newCourse = {
        name: 'name',
        coordinator: new ObjectId(),
        description: 'description',
      };

      const shouldntBeEmpty = {
        name: '',
      };

      const shouldBeEmpty = {
        description: null,
        curriculumGrides: [],
      };
      const createdCourse = await CourseModel.create(newCourse);
      expect(createdCourse).to.be.not.null;
      const courseId = _.get(createdCourse, '_id');

      const updatedCourse = await CourseService.update({
        ...shouldBeEmpty,
        ...shouldntBeEmpty,
        _id: courseId,
      });
      expect(updatedCourse).to.be.not.null;
      _.forOwn(shouldntBeEmpty, (value, key) => {
        expect(updatedCourse).to.not.have.property(key, value);
      });

      _.forOwn(shouldBeEmpty, (value, key) => {
        if (_.isArray(value)) {
          expect(updatedCourse[key]).to.have.length(_.size(shouldBeEmpty[key]));
        } else {
          expect(updatedCourse).to.have.property(key, value);
        }
      });
    });

    it('Should try update a course and succeed, updating and processing properly the coordinator change', async () => {
      const newCoordinator = await Utils.buildDefaultUser({ role: 'teacher', props: { username: 'secondTeacher', siape: 66 } });
      const newCoordinatorPerson = _.get(newCoordinator, 'person');
      const oldCoordinatorPerson = _.get(context, 'teacher.person');
      const newCourse = {
        name: 'test',
        coordinator: oldCoordinatorPerson,
      };
      const createdCourse = await CourseService.create(newCourse);
      expect(createdCourse).to.be.not.null;
      const courseId = _.get(createdCourse, '_id');

      const oldCoord = await PersonModel
        .findById(oldCoordinatorPerson)
        .lean()
        .exec();
      expect(oldCoord).to.have.property('courses');
      const { courses: oldCoordCourses } = oldCoord;
      expect(oldCoordCourses).to.have.length(1);
      const oldCoordMappedCourses = _.map(
        oldCoordCourses,
        (course) => String(course),
      );
      expect(oldCoordMappedCourses).to.includes(String(courseId));

      const updatedCourse = await CourseService.update({
        coordinator: newCoordinatorPerson,
        _id: courseId,
      });
      expect(updatedCourse).to.be.not.null;

      const updatedOldCoord = await PersonModel
        .findById(oldCoordinatorPerson)
        .lean()
        .exec();

      expect(updatedOldCoord).to.have.property('courses');
      const { courses: updatedOldCoordCourses } = updatedOldCoord;
      expect(updatedOldCoordCourses).to.have.length(0);

      const newCoord = await PersonModel
        .findById(newCoordinatorPerson)
        .lean()
        .exec();
      expect(newCoord).to.have.property('courses');
      const { courses: newCoordCourses } = newCoord;
      expect(newCoordCourses).to.have.length(1);
      const mappedNewCoordCourses = _.map(newCoordCourses, (course) => String(course));
      expect(mappedNewCoordCourses).to.includes(String(courseId));
    });
  });

  describe('fn: remove', () => {
    it('Should try remove a course without course, and throw error', async () => {
      let error = false;
      try {
        await CourseService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing course. Course not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a course without Id and throw error', async () => {
      let error = false;
      try {
        await CourseService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing course. Course ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a non existent course and thrrow error', async () => {
      let error = false;
      try {
        await CourseService.remove({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing course. Course not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a course and succeed', async () => {
      const coordinatorId = _.get(context, 'teacher.person');
      const newCourse = {
        name: 'test',
        coordinator: coordinatorId,
      };
      const createdCourse = await CourseService.create(newCourse);
      const courseId = _.get(createdCourse, '_id');
      expect(createdCourse).to.be.not.null;

      const coordinator = await PersonModel
        .findById(coordinatorId)
        .lean()
        .exec();
      expect(coordinator).to.have.property('courses');
      const { courses } = coordinator;
      expect(courses).to.have.length(1);
      expect(_.map(courses, (course) => String(course))).to.includes(String(courseId));

      await CourseService.remove({ _id: courseId });

      const removedCourse = await CourseModel
        .findById(courseId)
        .lean()
        .exec();
      expect(removedCourse).to.be.null;

      const updatedCoordinator = await PersonModel
        .findById(coordinatorId)
        .lean()
        .exec();
      expect(updatedCoordinator).to.have.property('courses');
      const { courses: updatedCourses } = updatedCoordinator;
      expect(updatedCourses).to.have.length(0);
    });
  });

  describe('fn: validateCoordinator', () => {
    it('Should check if the coordinator is valid but without person, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CourseService.validateCoordinator({ defaultErrorMessage: 'Default message' });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Coordinator not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should check if the coordinator is valid but don\'t exists, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CourseService.validateCoordinator({
          person: new ObjectId(),
          defaultErrorMessage: 'Default message',
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Coordinator not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should check if the coordinator is valid, but that person do\'t have a valid user and throw error', async () => {
      const person = await PersonModel.create({
        name: 'name1',
        surname: 'surname1',
        email: 'email@test.com',
        phone: '8888888',
      });

      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CourseService.validateCoordinator({
          person: _.get(person, '_id'),
          defaultErrorMessage: 'Default message',
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. User not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should check if the coordinator is valid, but the user role isn\'t valid and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await CourseService.validateCoordinator({
          person: _.get(context, 'student.person'),
          defaultErrorMessage: 'Default message',
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Person sent can't be coordinator`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should check if the coordinator is valid and succeed without errors', async () => {
      const result = await CourseService.validateCoordinator({
        person: _.get(context, 'teacher.person'),
      });
      expect(result).to.be.not.null;
      expect(result).to.have.property('coordinator');
      expect(result).to.have.property('validatedRole');
    });
  });

  describe('fn: addCurriculumGride', () => {
    it('Should try add Curriculum gride to course, without course and throw error', async () => {
      let error = false;
      const newInfo = {
        course: null,
        curriculumGrideId: new ObjectId(),
      };
      try {
        await CourseService.addCurriculumGride(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Curriculum Gride to Course. Course ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add curriclum gride to course, without curriculum gride id and throw error', async () => {
      let error = false;
      const newInfo = {
        course: new ObjectId(),
        curriculumGrideId: null,
      };
      try {
        await CourseService.addCurriculumGride(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Curriculum Gride to Course. Curriculum Gride ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add curriclum gride to course, without curriculum gride id and throw error', async () => {
      let error = false;
      const newInfo = {
        course: new ObjectId(),
        curriculumGrideId: new ObjectId(),
      };
      try {
        await CourseService.addCurriculumGride(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Curriculum Gride to Course. Course not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try add curriculum gride to course, and succeed', async () => {
      const createdCourse = await CourseModel.create({
        name: 'teste',
        coordinator: new ObjectId(),
      });

      const courseId = _.get(createdCourse, '_id');
      const newInfo = {
        course: courseId,
        curriculumGrideId: new ObjectId(),
      };

      const updatedCourse = await CourseService.addCurriculumGride(newInfo);
      expect(updatedCourse).to.be.not.null;

      expect(updatedCourse).to.have.property('curriculumGrides');
      const { curriculumGrides } = updatedCourse;
      const mappedGrides = _.map(curriculumGrides, (gride) => String(gride));
      expect(mappedGrides).to.includes(String(newInfo.curriculumGrideId));
    });
  });

  describe('fn: removeCurriculumGriide', () => {
    it('Should try remove curriculum gride without course and throw error', async () => {
      let error = false;
      const newInfo = {
        course: null,
        curriculumGrideId: new ObjectId(),
      };
      try {
        await CourseService.removeCurriculumGride(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Curriculum Gride from Course. Course ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove curriculum gride without curriculum gride ID and throw error', async () => {
      let error = false;
      const newInfo = {
        course: new ObjectId(),
        curriculumGrideId: null,
      };
      try {
        await CourseService.removeCurriculumGride(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Curriculum Gride from Course. Curriculum Gride ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a curriculum gride with a non existent course and throw error', async () => {
      let error = false;
      const newInfo = {
        course: new ObjectId(),
        curriculumGrideId: new ObjectId(),
      };
      try {
        await CourseService.removeCurriculumGride(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Curriculum Gride from Course. Course not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a curriculum gride and succeed', async () => {
      const curriculumGrideId = new ObjectId();
      const createdCourse = await CourseModel.create({
        name: 'test',
        coordinator: new ObjectId(),
        curriculumGrides: [curriculumGrideId],
      });
      expect(createdCourse).to.be.not.null;
      const courseId = _.get(createdCourse, '_id');

      expect(createdCourse).to.have.property('curriculumGrides');
      const { curriculumGrides } = createdCourse;
      expect(curriculumGrides).to.have.length(1);
      const mappedGrides = _.map(curriculumGrides, (gride) => String(gride));
      expect(mappedGrides).to.includes(String(curriculumGrideId));

      const updatedCourse = await CourseService.removeCurriculumGride({
        course: courseId,
        curriculumGrideId,
      });

      expect(updatedCourse).to.have.property('curriculumGrides');
      const { curriculumGrides: updatedCG } = updatedCourse;
      expect(updatedCG).to.have.length(0);
    });
  });
});
