/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const async = require('async');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const app = require('../../../app');

const Utils = IoC.create('tests/utils');
const ClassroomService = IoC.create('components/classroom/service');
const ClassroomModel = IoC.create('components/classroom/model');
const SubjectModel = IoC.create('components/subject/model');
const PersonModel = IoC.create('components/person/model');

const { ObjectId } = mongoose.Types;
const context = {};
describe('components/classroom/service', () => {
  afterEach(async () => {
    await Utils.cleanDatabase();
  });

  describe('fn: findById', () => {
    it('Should try find subject by id and succeed', async () => {
      const createdClassroom = await ClassroomModel.create({
        semester: '2022/2',
        allowExceedLimit: true,
        teacher: new ObjectId(),
        subject: new ObjectId(),
      });
      expect(createdClassroom).to.be.not.null;
      const classroomId = _.get(createdClassroom, '_id');

      const classroomFound = await ClassroomService.findById({ _id: classroomId });
      expect(classroomFound).to.not.be.null;
      expect(String(_.get(classroomFound, '_id'))).to.be.equal(String(classroomId));
    });
  });

  describe('fn: create', () => {
    beforeEach(async () => async.auto({
      teacher: async () => {
        const createdTeacher = await Utils.buildDefaultUser({
          role: 'teacher',
          props: { siape: '888' },
        });
        context.teacher = createdTeacher;
      },
      subject: async () => {
        const createdSubject = await SubjectModel.create({
          curriculumGride: new ObjectId(),
          name: 'testSubject',
          qtyHours: 60,
        });
        context.subject = createdSubject;
      },
    }));

    it('Should try create a classroom without sent a classroom and throw error', async () => {
      let error = false;
      try {
        await ClassroomService.create();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Classroom. Classroom not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a classroom without required fields, and throw error', async () => {
      const subjectId = _.get(context, 'subject._id');
      const teacherId = _.get(context, 'teacher.person');

      const newClassroom = {
        subject: subjectId,
        teacher: teacherId,
        semester: '2022/2',
      };

      let error = false;
      try {
        await ClassroomService.create(newClassroom);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Classroom. Required Field: allowExceedLimit not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a classroom and succeed. Updating subject and teacher with the new classroom', async () => {
      const subjectId = _.get(context, 'subject._id');
      const teacherId = _.get(context, 'teacher.person');

      const newClassroom = {
        subject: subjectId,
        teacher: teacherId,
        semester: '2022/2',
        allowExceedLimit: false,
      };
      const createdClassroom = await ClassroomService.create(newClassroom);
      expect(createdClassroom).to.be.not.null;
      const classroomId = String(_.get(createdClassroom, '_id'));

      const updatedTeacher = await PersonModel
        .findById(teacherId)
        .lean()
        .exec();
      expect(updatedTeacher).to.be.not.null;
      expect(updatedTeacher).to.have.property('classrooms');
      const { classrooms: teacherClassrooms } = updatedTeacher;
      expect(teacherClassrooms).to.have.length(1);
      expect(_.map(teacherClassrooms, (classroom) => String(classroom))).to.includes(classroomId);

      const updatedSubject = await SubjectModel
        .findById(subjectId)
        .lean()
        .exec();
      expect(updatedSubject).to.be.not.null;
      expect(updatedSubject).to.have.property('classrooms');
      const { classrooms: subjectClassrooms } = updatedTeacher;
      expect(subjectClassrooms).to.have.length(1);
      expect(_.map(subjectClassrooms, (classroom) => String(classroom))).to.includes(classroomId);
    });

    it('Should try create a classrroom with non valid fields, and ignore then', async () => {
      const subjectId = _.get(context, 'subject._id');
      const teacherId = _.get(context, 'teacher.person');

      const validFields = {
        subject: subjectId,
        teacher: teacherId,
        semester: '2022/2',
        allowExceedLimit: false,
      };

      const nonValidFields = {
        nonValidField: 'Test',
        testeValidField: '55',
        invalidField: '88',
      };
      const createdClassroom = await ClassroomService.create({ ...validFields, ...nonValidFields });
      expect(createdClassroom).to.be.not.null;

      _.forOwn(validFields, (value, key) => {
        if (mongoose.isValidObjectId(value)) {
          expect(String(createdClassroom[key])).to.be.equal(String(value));
        } else {
          expect(createdClassroom).to.have.property(key, value);
        }
      });

      _.forOwn(nonValidFields, (value, key) => {
        expect(createdClassroom).to.not.have.property(key, value);
      });
    });
  });

  describe('fn: update', () => {
    beforeEach(async () => async.auto({
      teacher: async () => {
        const createdTeacher = await Utils.buildDefaultUser({
          role: 'teacher',
          props: { siape: '888' },
        });
        context.teacher = createdTeacher;
      },
      subject: async () => {
        const createdSubject = await SubjectModel.create({
          curriculumGride: new ObjectId(),
          name: 'testSubject',
          qtyHours: 60,
        });
        context.subject = createdSubject;
      },
    }));

    it('Should try update a classroom without sent a classroom and throw error', async () => {
      let error = false;
      try {
        await ClassroomService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Classroom. Classroom not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a classroom without sent a ID and throw error', async () => {
      let error = false;
      try {
        await ClassroomService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Classroom. Classroom ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a classroom with a non existent classroom and throw error', async () => {
      let error = false;
      try {
        await ClassroomService.update({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Classroom. Classroom not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update a classroom and succeed, updating only the fields sent and available', async () => {
      const subjectId = _.get(context, 'subject._id');
      const teacherId = _.get(context, 'teacher.person');

      const newClassroom = {
        subject: subjectId,
        teacher: teacherId,
        semester: '2022/2',
        allowExceedLimit: false,
      };
      const createdClassroom = await ClassroomModel.create(newClassroom);
      expect(createdClassroom).to.be.not.null;

      const shouldBeUpdated = {
        semester: '2021/1',
        enrollmentsLimit: null,
        classDays: null,
        classTimes: null,
        enrollments: null,
      };

      const shouldntBeUpdated = {
        allowExceedLimit: null,
        subject: undefined,
      };

      const updatedClassroom = await ClassroomService.update({
        ...shouldBeUpdated,
        ...shouldntBeUpdated,
        _id: _.get(createdClassroom, '_id'),
      });
      expect(updatedClassroom).to.be.not.null;
      _.forOwn(shouldBeUpdated, (value, key) => {
        expect(updatedClassroom).to.have.property(key, value);
      });

      _.forOwn(shouldntBeUpdated, (value, key) => {
        expect(updatedClassroom).to.not.have.property(key, value);
      });
    });

    it('Should try update a classroom and succeed, updating and processing properly teacher and subject', async () => {
      const oldSubjectId = _.get(context, 'subject._id');

      const newSubject = await SubjectModel.create({
        curriculumGride: new ObjectId(),
        name: 'testSubject',
        qtyHours: 60,
      });
      expect(newSubject).to.be.not.null;
      const newSubjectId = _.get(newSubject, '_id');

      const oldTeacherId = _.get(context, 'teacher.person');
      const newTeacher = await Utils.buildDefaultUser({
        role: 'teacher',
        props: { siape: '888', username: 'Second' },
      });
      expect(newTeacher).to.be.not.null;
      const newTeacherId = _.get(newTeacher, 'person');

      const newClassroom = {
        subject: oldSubjectId,
        teacher: oldTeacherId,
        semester: '2022/2',
        allowExceedLimit: false,
      };
      const createdClassroom = await ClassroomService.create(newClassroom);
      expect(createdClassroom).to.be.not.null;
      const classroomId = String(_.get(createdClassroom, '_id'));

      const oldSubject = await SubjectModel
        .findById(oldSubjectId)
        .lean()
        .exec();
      expect(oldSubject).to.be.not.null;
      expect(oldSubject).to.have.property('classrooms');
      const { classrooms: oldSubjectClassrooms } = oldSubject;
      expect(oldSubjectClassrooms).to.have.length(1);
      const mappedOldSubjectClassrooms = _.map(
        oldSubjectClassrooms,
        (classroom) => String(classroom),
      );
      expect(mappedOldSubjectClassrooms).to.includes(classroomId);

      const oldTeacher = await PersonModel
        .findById(oldTeacherId)
        .lean()
        .exec();

      expect(oldTeacher).to.be.not.null;
      expect(oldTeacher).to.have.property('classrooms');
      const { classrooms: oldTeacherClassrooms } = oldTeacher;
      expect(oldTeacherClassrooms).to.have.length(1);
      const mappedOldTeacherClassrooms = _.map(
        oldTeacherClassrooms,
        (classroom) => String(classroom),
      );
      expect(mappedOldTeacherClassrooms).to.includes(classroomId);

      const updatedClassroom = await ClassroomService.update({
        _id: classroomId,
        teacher: newTeacherId,
        subject: newSubjectId,
      });
      expect(updatedClassroom).to.be.not.null;
      expect(updatedClassroom).to.have.property('teacher');
      expect(String(updatedClassroom.teacher)).to.be.equal(String(newTeacherId));
      expect(updatedClassroom).to.have.property('subject');
      expect(String(updatedClassroom.subject)).to.be.equal(String(newSubjectId));

      const oldSubjectUpdated = await SubjectModel
        .findById(oldSubjectId)
        .lean()
        .exec();
      expect(oldSubjectUpdated).to.be.not.null;
      expect(oldSubjectUpdated).to.have.property('classrooms');
      const { classrooms: oldSubjectUpdatedClassrooms } = oldSubjectUpdated;
      expect(oldSubjectUpdatedClassrooms).to.have.length(0);

      const newSubjectUpdated = await SubjectModel
        .findById(newSubjectId)
        .lean()
        .exec();
      expect(newSubjectUpdated).to.be.not.null;
      expect(newSubjectUpdated).to.have.property('classrooms');
      const { classrooms: newSubjectUpdatedClassrooms } = newSubjectUpdated;
      expect(newSubjectUpdatedClassrooms).to.have.length(1);
      const mappedNewSubjectUpdatedClassrooms = _.map(
        newSubjectUpdatedClassrooms,
        (classroom) => String(classroom),
      );
      expect(mappedNewSubjectUpdatedClassrooms).to.includes(classroomId);

      const oldTeacherUpdated = await PersonModel
        .findById(oldTeacherId)
        .lean()
        .exec();
      expect(oldTeacherUpdated).to.be.not.null;
      expect(oldTeacherUpdated).to.have.property('classrooms');
      const { classrooms: oldTeacherUpdatedClassrooms } = oldTeacherUpdated;
      expect(oldTeacherUpdatedClassrooms).to.have.length(0);

      const newTeacherUpdated = await PersonModel
        .findById(newTeacherId)
        .lean()
        .exec();
      expect(newTeacherUpdated).to.be.not.null;
      expect(newTeacherUpdated).to.have.property('classrooms');
      const { classrooms: newTeacherUpdatedClassrooms } = newTeacherUpdated;
      expect(newTeacherUpdatedClassrooms).to.have.length(1);
      const mappedNewTeacherUpdatedClassrooms = _.map(
        newTeacherUpdatedClassrooms,
        (classroom) => String(classroom),
      );
      expect(mappedNewTeacherUpdatedClassrooms).to.includes(classroomId);
    });
  });

  describe('fn: remove', () => {
    beforeEach(async () => async.auto({
      teacher: async () => {
        const createdTeacher = await Utils.buildDefaultUser({
          role: 'teacher',
          props: { siape: '888' },
        });
        context.teacher = createdTeacher;
      },
      subject: async () => {
        const createdSubject = await SubjectModel.create({
          curriculumGride: new ObjectId(),
          name: 'testSubject',
          qtyHours: 60,
        });
        context.subject = createdSubject;
      },
    }));

    it('Should try remove a classroom without sent classroom and throw error', async () => {
      let error = false;
      try {
        await ClassroomService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Classroom. Classroom not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a classroom without sent classroom ID and throw error', async () => {
      let error = false;
      try {
        await ClassroomService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Classroom. Classroom ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a classroom with a non existent classroom and throw error', async () => {
      let error = false;
      try {
        await ClassroomService.remove({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Classroom. Classroom not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a classroom and succeed', async () => {
      const subjectId = _.get(context, 'subject._id');
      const teacherId = _.get(context, 'teacher.person');
      const newClassroom = {
        subject: subjectId,
        teacher: teacherId,
        semester: '2022/2',
        allowExceedLimit: false,
      };
      const createdClassroom = await ClassroomService.create(newClassroom);
      expect(createdClassroom).to.be.not.null;
      const classroomId = String(_.get(createdClassroom, '_id'));

      const teacher = await PersonModel
        .findById(teacherId)
        .lean()
        .exec();
      expect(teacher).to.be.not.null;
      expect(teacher).to.have.property('classrooms');
      const { classrooms: teacherClassrooms } = teacher;
      expect(teacherClassrooms).to.have.length(1);
      expect(_.map(teacherClassrooms, (classroom) => String(classroom))).to.includes(classroomId);

      const subject = await SubjectModel
        .findById(subjectId)
        .lean()
        .exec();
      expect(subject).to.be.not.null;
      expect(subject).to.have.property('classrooms');
      const { classrooms: subjectClassrooms } = subject;
      expect(subjectClassrooms).to.have.length(1);
      expect(_.map(subjectClassrooms, (classroom) => String(classroom))).to.includes(classroomId);

      await ClassroomService.remove({ _id: classroomId });
      const removedClassroom = await ClassroomModel
        .findById(classroomId)
        .lean()
        .exec();
      expect(removedClassroom).to.be.null;

      const updatedTeacher = await PersonModel
        .findById(teacherId)
        .lean()
        .exec();
      expect(updatedTeacher).to.be.not.null;
      expect(updatedTeacher).to.have.property('classrooms');
      const { classrooms: updatedTeacherClassrooms } = updatedTeacher;
      expect(updatedTeacherClassrooms).to.have.length(0);

      const updatedSubject = await SubjectModel
        .findById(subjectId)
        .lean()
        .exec();
      expect(updatedSubject).to.be.not.null;
      expect(updatedSubject).to.have.property('classrooms');
      const { classrooms: updatedSubjectClassrooms } = updatedSubject;
      expect(updatedSubjectClassrooms).to.have.length(0);
    });
  });

  describe('fn: addEnrollment', () => {
    it('Should try add enrollment to classroom without classroom ID and throw error', async () => {
      let error = false;
      const newInfo = {
        classroom: null,
        enrollmentId: new ObjectId(),
      };
      try {
        await ClassroomService.addEnrollment(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Enrollment to Classroom. Classroom ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add enrollment to classroom without enrolment and throw error', async () => {
      let error = false;
      const newInfo = {
        classroom: new ObjectId(),
        enrollmentId: null,
      };
      try {
        await ClassroomService.addEnrollment(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Enrollment to Classroom. Enrollment ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add enrollment to classroom with a non existent classroom and throw error', async () => {
      let error = false;
      const newInfo = {
        classroom: new ObjectId(),
        enrollmentId: new ObjectId(),
      };
      try {
        await ClassroomService.addEnrollment(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding Enrollment to Classroom. Classroom not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try add enrollment to classroom and succeed', async () => {
      const createdClassroom = await ClassroomModel.create({
        semester: '2022/01',
        allowExceedLimit: true,
        teacher: new ObjectId(),
        subject: new ObjectId(),
      });
      expect(createdClassroom).to.be.not.null;
      const classroomId = _.get(createdClassroom, '_id');

      const newInfo = {
        classroom: classroomId,
        enrollmentId: new ObjectId(),
      };

      const updatedClassroom = await ClassroomService.addEnrollment(newInfo);
      expect(updatedClassroom).to.have.property('enrollments');
      const { enrollments } = updatedClassroom;
      expect(enrollments).to.have.length(1);
      const mappedEnrollments = _.map(enrollments, (enrollment) => String(enrollment));
      expect(mappedEnrollments).to.includes(String(newInfo.enrollmentId));
    });
  });

  describe('fn: removeEnrollment', () => {
    it('Should try remove a enrollment from a classroom without classroom and throw error', async () => {
      let error = false;
      const newInfo = {
        classroom: null,
        enrollmentId: new ObjectId(),
      };
      try {
        await ClassroomService.removeEnrollment(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Enrollment from Classroom. Classroom ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a enrollment from a classrorom without enrollment and throw error', async () => {
      let error = false;
      const newInfo = {
        classroom: new ObjectId(),
        enrollmentId: null,
      };
      try {
        await ClassroomService.removeEnrollment(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Enrollment from Classroom. Enrollment ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a enrollment from classroom with non existent classroom and throw error', async () => {
      let error = false;
      const newInfo = {
        classroom: new ObjectId(),
        enrollmentId: new ObjectId(),
      };
      try {
        await ClassroomService.removeEnrollment(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Enrollment from Classroom. Classroom not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a enrollment from classroom and succeed', async () => {
      const enrollmentId = new ObjectId();
      const createdClassroom = await ClassroomModel.create({
        semester: '2022/01',
        allowExceedLimit: true,
        teacher: new ObjectId(),
        subject: new ObjectId(),
        enrollments: [enrollmentId],
      });
      expect(createdClassroom).to.be.not.null;
      const classroomId = _.get(createdClassroom, '_id');

      expect(createdClassroom).to.have.property('enrollments');
      const { enrollments } = createdClassroom;
      expect(enrollments).to.have.length(1);
      const mappedEnrollments = _.map(enrollments, (enrollment) => String(enrollment));
      expect(mappedEnrollments).to.includes(String(enrollmentId));

      const updatedClassroom = await ClassroomService.removeEnrollment({
        classroom: classroomId,
        enrollmentId,
      });

      expect(updatedClassroom).to.be.not.null;
      expect(updatedClassroom).to.have.property('enrollments');
      const { enrollments: updatedEnrollments } = updatedClassroom;
      expect(updatedEnrollments).to.have.length(0);
    });
  });

  describe('fn: validateSubject', () => {
    it('Should try validate subject without subject id, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await ClassroomService.validateSubject({ defaultErrorMessage: 'Default message' });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Subject not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate subject without a valid ID, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await ClassroomService.validateSubject({
          subjectId: 'nonValidObjectId',
          defaultErrorMessage: 'Default message',
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Subject not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate subject with a non existent subject and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await ClassroomService.validateSubject({
          subjectId: new ObjectId(),
          defaultErrorMessage: 'Default message',
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Subject not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a subject and succeed', async () => {
      const createdSubject = await SubjectModel.create({
        name: 'Test',
        qtyHours: 60,
        curriculumGride: new ObjectId(),
      });

      const subjectId = _.get(createdSubject, '_id');
      const validate = ClassroomService.validateSubject({
        subjectId,
        defaultErrorMessage: 'Default message',
      });
      expect(validate).to.be.not.null;
    });
  });

  describe('fn: validateTeacher', () => {
    it('Should check if the teacher is valid but without person, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await ClassroomService.validateTeacher({ defaultErrorMessage });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Teacher not sent or not a valid ID`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should check if the teacher is valid but don\'t exists, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await ClassroomService.validateTeacher({
          teacherId: new ObjectId(),
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Teacher not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should check if the teacher is valid, but that person do\'t have a valid user and throw error', async () => {
      const person = await PersonModel.create({
        name: 'name1',
        surname: 'surname1',
        email: 'email@test.com',
        phone: '8888888',
      });

      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await ClassroomService.validateTeacher({
          teacherId: _.get(person, '_id'),
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. User not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should check if the teacher is valid, but the user role isn\'t valid and throw error', async () => {
      const student = await Utils.buildDefaultUser({ role: 'student', props: { username: 'student', registration: 55 } });
      let error = false;
      const defaultErrorMessage = 'Default message';
      try {
        await ClassroomService.validateTeacher({
          teacherId: _.get(student, 'person'),
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Person sent can't be teacher`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should check if the teacher is valid and succeed without errors', async () => {
      const teacher = await Utils.buildDefaultUser({ role: 'teacher', props: { username: 'teacher', siape: 55 } });
      const result = await ClassroomService.validateTeacher({
        teacherId: _.get(teacher, 'person'),
      });
      expect(result).to.be.not.null;
      expect(result).to.have.property('teacher');
      expect(result).to.have.property('validatedRole');
    });
  });

  describe('fn: getClassroomTeacherAndCoordinator', () => {});
});
