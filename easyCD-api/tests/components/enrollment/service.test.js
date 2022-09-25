/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const async = require('async');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const app = require('../../../app');

const Utils = IoC.create('tests/utils');
const EnrollmentService = IoC.create('components/enrollment/service');
const EnrollmentModel = IoC.create('components/enrollment/model');
const ClassroomModel = IoC.create('components/classroom/model');
const PersonModel = IoC.create('components/person/model');

const { ObjectId } = mongoose.Types;
const context = {};
describe('components/enrollment/service', () => {
  beforeEach(async () => async.auto({
    student: async () => {
      const createdStudent = await Utils.buildDefaultUser({
        role: 'student',
        props: { registration: '888' },
      });
      context.student = createdStudent;
    },
    classroom: async () => {
      const createdClassroom = await ClassroomModel.create({
        semester: '2022/2',
        allowExceedLimit: true,
        teacher: new ObjectId(),
        subject: new ObjectId(),
      });
      context.classroom = createdClassroom;
    },
  }));
  afterEach(async () => {
    await Utils.cleanDatabase();
  });

  describe('fn: create', () => {
    it('Should try create a enrollment without sent a enrollment and throw error', async () => {
      let error = false;
      try {
        await EnrollmentService.create();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Enrollment. Enrollment not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a enrollment and succeed. Updating student and classroom', async () => {
      const studentId = _.get(context, 'student.person');
      const classroomId = _.get(context, 'classroom._id');
      const newEnrollment = {
        student: studentId,
        classroom: classroomId,
      };
      const createdEnrollment = await EnrollmentService.create(newEnrollment);
      expect(createdEnrollment).to.be.not.null;
      const enrollmentId = String(_.get(createdEnrollment, '_id'));

      const updatedStudent = await PersonModel
        .findById(studentId)
        .lean()
        .exec();
      expect(updatedStudent).to.be.not.null;
      expect(updatedStudent).to.have.property('enrollments');
      const { enrollments: studentEnrollments } = updatedStudent;
      expect(studentEnrollments).to.have.length(1);
      const mappedStudentEnrollments = _.map(
        studentEnrollments,
        (enrollment) => String(enrollment),
      );
      expect(mappedStudentEnrollments).to.includes(enrollmentId);

      const updatedClassroom = await ClassroomModel
        .findById(classroomId)
        .lean()
        .exec();
      expect(updatedClassroom).to.be.not.null;
      expect(updatedClassroom).to.have.property('enrollments');
      const { enrollments: classroomEnrollments } = updatedClassroom;
      expect(classroomEnrollments).to.have.length(1);
      const mappedClassroomEnrollments = _.map(
        classroomEnrollments,
        (enrollment) => String(enrollment),
      );
      expect(mappedClassroomEnrollments).to.includes(enrollmentId);
    });

    it('Should try create a enrollment with non valid fields, and ignore then', async () => {
      const studentId = _.get(context, 'student.person');
      const classroomId = _.get(context, 'classroom._id');
      const validFields = {
        student: studentId,
        classroom: classroomId,
        status: 'Approved',
        observation: 'observation test',
      };

      const nonValidFields = {
        nonValidField: 'Test',
        testeValidField: '55',
        invalidField: '88',
      };

      const createdEnrollment = await EnrollmentService.create({
        ...validFields,
        ...nonValidFields,
      });
      expect(createdEnrollment).to.be.not.null;

      _.forOwn(validFields, (value, key) => {
        if (mongoose.isValidObjectId(value)) {
          expect(String(createdEnrollment[key])).to.be.equal(String(value));
        } else {
          expect(createdEnrollment).to.have.property(key, value);
        }
      });

      _.forOwn(nonValidFields, (value, key) => {
        expect(createdEnrollment).to.not.have.property(key, value);
      });
    });
  });

  describe('fn: update', () => {
    it('Should try update a enrollment without sent a enrollment and throw error', async () => {
      let error = false;
      try {
        await EnrollmentService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Enrollment. Enrollment not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a enrollment without sent a enrollment ID and throw error', async () => {
      let error = false;
      try {
        await EnrollmentService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Enrollment. Enrollment ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a enrollment with a non existent enrollment and throw error', async () => {
      let error = false;
      try {
        await EnrollmentService.update({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Enrollment. Enrollment not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update a enrollment and succeed, updating only the fields sent and available', async () => {
      const studentId = _.get(context, 'student.person');
      const classroomId = _.get(context, 'classroom._id');
      const newEnrollment = {
        student: studentId,
        classroom: classroomId,
      };
      const createdEnrollment = await EnrollmentModel.create(newEnrollment);
      expect(createdEnrollment).to.be.not.null;
      const enrollmentId = String(_.get(createdEnrollment, '_id'));

      const shouldBeUpdated = {
        observation: 'UpdatedDescription',
      };

      const shouldntBeUpdated = {
        status: null,
      };

      const updatedEnrollment = await EnrollmentService.update({
        ...shouldBeUpdated,
        ...shouldntBeUpdated,
        _id: enrollmentId,
      });
      expect(updatedEnrollment).to.be.not.null;

      _.forOwn(shouldBeUpdated, (value, key) => {
        expect(updatedEnrollment).to.have.property(key, value);
      });

      _.forOwn(shouldntBeUpdated, (value, key) => {
        expect(updatedEnrollment).to.not.have.property(key, value);
      });
    });

    it('Should try update a enrollment and succeed, updating and processing properly student and classroom', async () => {
      const oldStudentId = _.get(context, 'student.person');

      const newStudent = await Utils.buildDefaultUser({ role: 'student', props: { username: 'teste', registration: '99' } });
      const newStudentId = _.get(newStudent, 'person');

      const oldClassroomId = _.get(context, 'classroom._id');

      const newClassroom = await ClassroomModel.create({
        semester: '2021/2',
        allowExceedLimit: true,
        teacher: new ObjectId(),
        subject: new ObjectId(),
      });
      const newClassroomId = _.get(newClassroom, '_id');

      const newEnrollment = {
        student: oldStudentId,
        classroom: oldClassroomId,
      };

      const createdEnrollment = await EnrollmentService.create(newEnrollment);
      expect(createdEnrollment).to.be.not.null;
      const enrollmentId = String(_.get(createdEnrollment, '_id'));

      const oldStudent = await PersonModel
        .findById(oldStudentId)
        .lean()
        .exec();
      expect(oldStudent).to.be.not.null;
      expect(oldStudent).to.have.property('enrollments');
      const { enrollments: oldStudentEnrollments } = oldStudent;
      expect(oldStudentEnrollments).to.have.length(1);
      const mappedOldStudentEnrollments = _.map(
        oldStudentEnrollments,
        (enrollment) => String(enrollment),
      );
      expect(mappedOldStudentEnrollments).to.includes(enrollmentId);

      const oldClassroom = await ClassroomModel
        .findById(oldClassroomId)
        .lean()
        .exec();
      expect(oldClassroom).to.be.not.null;
      expect(oldClassroom).to.have.property('enrollments');
      const { enrollments: oldClassroomEnrollments } = oldClassroom;
      expect(oldClassroomEnrollments).to.have.length(1);
      const mappedOldClassroomEnrollments = _.map(
        oldClassroomEnrollments,
        (enrollment) => String(enrollment),
      );
      expect(mappedOldClassroomEnrollments).to.includes(enrollmentId);

      const updatedEnrollment = await EnrollmentService.update({
        student: newStudentId,
        classroom: newClassroomId,
        _id: enrollmentId,
      });
      expect(updatedEnrollment).to.be.not.null;
      expect(updatedEnrollment).to.have.property('student');
      expect(String(updatedEnrollment.student)).to.be.equal(String(newStudentId));
      expect(updatedEnrollment).to.have.property('classroom');
      expect(String(updatedEnrollment.classroom)).to.be.equal(String(newClassroomId));

      const oldStudentUpdated = await PersonModel
        .findById(oldStudentId)
        .lean()
        .exec();
      expect(oldStudentUpdated).to.be.not.null;
      expect(oldStudentUpdated).to.have.property('enrollments');
      const { enrollments: oldStudentpdatedEnrollments } = oldStudentUpdated;
      expect(oldStudentpdatedEnrollments).to.have.length(0);

      const newStudentUpdated = await PersonModel
        .findById(newStudentId)
        .lean()
        .exec();
      expect(newStudentUpdated).to.be.not.null;
      expect(newStudentUpdated).to.have.property('enrollments');
      const { enrollments: newStudentUpdatedEnrollments } = newStudentUpdated;
      expect(newStudentUpdatedEnrollments).to.have.length(1);
      const mappedNewStudentUpdatedEnrollments = _.map(
        newStudentUpdatedEnrollments,
        (enrollment) => String(enrollment),
      );
      expect(mappedNewStudentUpdatedEnrollments).to.includes(enrollmentId);

      const oldClassroomUpdated = await ClassroomModel
        .findById(oldClassroomId)
        .lean()
        .exec();
      expect(oldClassroomUpdated).to.be.not.null;
      expect(oldClassroomUpdated).to.have.property('enrollments');
      const { enrollments: oldClassroomUpdatedEnrollments } = oldClassroomUpdated;
      expect(oldClassroomUpdatedEnrollments).to.have.length(0);

      const newClassroomUpdated = await ClassroomModel
        .findById(newClassroomId)
        .lean()
        .exec();
      expect(newClassroomUpdated).to.be.not.null;
      expect(newClassroomUpdated).to.have.property('enrollments');
      const { enrollments: newClassroomUpdatedEnrollments } = newClassroomUpdated;
      expect(newClassroomUpdatedEnrollments).to.have.length(1);
      const mappedNewClassroomUpdatedEnrollments = _.map(
        newClassroomUpdatedEnrollments,
        (enrollment) => String(enrollment),
      );
      expect(mappedNewClassroomUpdatedEnrollments).to.includes(enrollmentId);
    });
  });

  describe('fn: remove', () => {
    it('Should try remove a enrollment without sent enrollment, and throw error', async () => {
      let error = false;
      try {
        await EnrollmentService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Enrollment. Enrollment not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a enrollment without sent enrollment ID, and throw error', async () => {
      let error = false;
      try {
        await EnrollmentService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Enrollment. Enrollment ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a enrollment with a non existent enrollment and throw error', async () => {
      let error = false;
      try {
        await EnrollmentService.remove({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Enrollment. Enrollment not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a enrollment and succeed', async () => {
      const studentId = _.get(context, 'student.person');
      const classroomId = _.get(context, 'classroom._id');
      const newEnrollment = {
        student: studentId,
        classroom: classroomId,
      };
      const createdEnrollment = await EnrollmentService.create(newEnrollment);
      expect(createdEnrollment).to.be.not.null;
      const enrollmentId = String(_.get(createdEnrollment, '_id'));

      const student = await PersonModel
        .findById(studentId)
        .lean()
        .exec();
      expect(student).to.be.not.null;
      expect(student).to.have.property('enrollments');
      const { enrollments: studentEnrollments } = student;
      expect(studentEnrollments).to.have.length(1);
      const mappedStudentEnrollments = _.map(
        studentEnrollments,
        (enrollment) => String(enrollment),
      );
      expect(mappedStudentEnrollments).to.includes(enrollmentId);

      const classroom = await ClassroomModel
        .findById(classroomId)
        .lean()
        .exec();
      expect(classroom).to.be.not.null;
      expect(classroom).to.have.property('enrollments');
      const { enrollments: classroomEnrollments } = classroom;
      expect(classroomEnrollments).to.have.length(1);
      const mappedClassroomEnrollments = _.map(
        classroomEnrollments,
        (enrollment) => String(enrollment),
      );
      expect(mappedClassroomEnrollments).to.includes(enrollmentId);

      await EnrollmentService.remove({ _id: enrollmentId });
      const removedEnrollment = await EnrollmentModel
        .findById(enrollmentId)
        .lean()
        .exec();
      expect(removedEnrollment).to.be.null;

      const updatedStudent = await PersonModel
        .findById(studentId)
        .lean()
        .exec();
      expect(updatedStudent).to.be.not.null;
      expect(updatedStudent).to.have.property('enrollments');
      const { enrollments: updatedStudentEnrollments } = updatedStudent;
      expect(updatedStudentEnrollments).to.have.length(0);

      const updatedClassroom = await ClassroomModel
        .findById(classroomId)
        .lean()
        .exec();
      expect(updatedClassroom).to.be.not.null;
      expect(updatedClassroom).to.have.property('enrollments');
      const { enrollments: updatedClassroomEnrollments } = updatedClassroom;
      expect(updatedClassroomEnrollments).to.have.length(0);
    });
  });

  describe('fn: validateClassroom', () => {
    it('Should try validate classroom without sent classroom and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await EnrollmentService.validateClassroom({ defaultErrorMessage });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Classroom not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate classroom sending non valid ID and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await EnrollmentService.validateClassroom({
          classroomId: 'nonValidObjectId',
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Classroom not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate classroom with a non existent classroom and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await EnrollmentService.validateClassroom({
          classroomId: new ObjectId(),
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Classroom not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a classroom and succeed', async () => {
      const validate = EnrollmentService.validateClassroom({
        classroomId: _.get(context, 'classroom._id'),
        defaultErrorMessage: 'Default message',
      });
      expect(validate).to.be.not.null;
    });
  });

  describe('fn: validateStudent', () => {
    it('Should check if the student is valid but without person, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await EnrollmentService.validateStudent({ defaultErrorMessage });
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
        await EnrollmentService.validateStudent({
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
        await EnrollmentService.validateStudent({
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
      const student = await Utils.buildDefaultUser({ role: 'teacher', props: { username: 'teacher', siape: '55' } });
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await EnrollmentService.validateStudent({
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
      const teacher = await Utils.buildDefaultUser({ role: 'student', props: { username: 'student', registration: '55' } });
      const result = await EnrollmentService.validateStudent({
        studentId: _.get(teacher, 'person'),
      });
      expect(result).to.be.not.null;
      expect(result).to.have.property('student');
      expect(result).to.have.property('validatedRole');
    });
  });
});
