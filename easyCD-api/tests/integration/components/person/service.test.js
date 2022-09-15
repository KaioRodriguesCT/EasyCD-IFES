/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const app = require('../../../../app');

// Service
const Utils = IoC.create('tests/utils');
const PersonService = IoC.create('components/person/service');
const PersonModel = IoC.create('components/person/model');
const { ObjectId } = mongoose.Types;

describe('component/person/service', () => {
  const defaultNewPerson = {
    name: 'Person',
    surname: '#1',
    email: 'person#1@gmail.com',
    phone: '99999999',
  };

  afterEach(async () => {
    await Utils.cleanDatabase();
  });

  describe('fn: findById', () => {
    it('Should try search by id and return success', async () => {
      const createdPerson = await PersonModel.create(defaultNewPerson);
      const personFound = await PersonService.findById({ _id: _.get(createdPerson, '_id') });
      expect(personFound).to.not.be.null;
      expect(String(_.get(personFound, '_id'))).to.be.equal(String(_.get(createdPerson, '_id')));
    });
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

  describe('fn: update', () => {
    it('Should try update person without person and throw error', async () => {
      let error = false;
      try {
        await PersonService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating person. Person not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a person but don\'t send ID and throw error', async () => {
      let error = false;
      try {
        await PersonService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating person. Person ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a person with non existent person and throw error', async () => {
      const _id = new ObjectId();
      let error = false;
      try {
        await PersonService.update({ _id });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating person. Person not Found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update a person and only update the fields that are being sent', async () => {
      const createdPerson = await PersonModel.create(defaultNewPerson);

      const newFields = {
        name: 'UpdatedName',
        surname: 'UpdatedSurname',
        email: 'updatedEmail@gmail.com',
        phone: 'updatedPhone',
        city: 'City',
        uf: 'updatedUf',
        address: 'updatedAddress',
      };

      const nonValidFields = {
        age: 55,
        isAdult: true,
        anyFieldName: false,
      };

      const updatedPerson = await PersonService.update({
        ...newFields,
        ...nonValidFields,
        _id: _.get(createdPerson, '_id'),
      });
      // Testing all the valid updated fields
      _.forOwn(newFields, (value, key) => {
        expect(updatedPerson).to.have.property(key, value);
      });

      // Testing all the non valid updated fields
      _.forOwn(nonValidFields, (value, key) => {
        expect(updatedPerson).to.not.have.property(key, value);
      });
    });

    it('Should try update a person with empty fields that are not allowed be empty and others that are allowed, should success', async () => {
      const newPerson = {
        name: 'Person',
        surname: '#1',
        email: 'person#1@gmail.com',
        phone: '99999999',
        city: 'City',
        uf: 'UF',
        address: 'Address',
      };

      const createdPerson = await PersonModel.create(newPerson);

      const shouldBeEmpty = {
        city: null,
        uf: '',
        address: null,
      };

      const shouldntBeEmpty = {
        name: null,
        surname: '',
        email: undefined,
      };

      const updatedPerson = await PersonService.update({
        ...shouldBeEmpty,
        ...shouldntBeEmpty,
        _id: _.get(createdPerson, '_id'),
      });

      // Testing, should use the same values
      _.forOwn(shouldBeEmpty, (value, key) => {
        expect(updatedPerson).to.have.property(key, value);
      });

      // Testing, shouldn't use the same value
      _.forOwn(shouldntBeEmpty, (value, key) => {
        expect(updatedPerson).to.not.have.property(key, value);
      });
    });
  });

  describe('fn: remove', () => {
    it('Should try remove person without person and throw error', async () => {
      let error = false;
      try {
        await PersonService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing person. Person not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove person without ID and throw error', async () => {
      let error = false;
      try {
        await PersonService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing person. Person ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove person with non existent person and throw error', async () => {
      const _id = new ObjectId();
      let error = false;
      try {
        await PersonService.remove({ _id });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing person. Person not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try delete person and succeed', async () => {
      const createdPerson = await PersonModel.create(defaultNewPerson);
      const createdPersonId = _.get(createdPerson, '_id');

      await PersonService.remove({ _id: createdPersonId });

      const removedPerson = await PersonModel
        .findOneWithDeleted({ _id: createdPersonId })
        .lean()
        .exec();

      expect(removedPerson).to.have.property('deleted', true);
      expect(removedPerson).to.have.property('deletedAt');

      // Should override normal methods, and ignore person with deleted
      const person = await PersonModel
        .findOne({ _id: createdPersonId })
        .lean()
        .exec();
      expect(person).to.be.null;
    });
  });

  describe('fn: addCourse', () => {
    it('Should try add a course to person without coordinator and get error', async () => {
      const newInfo = {
        coordinator: null,
        courseId: new ObjectId(),
      };
      let error = false;
      try {
        await PersonService.addCourse(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding course to Coordinator. Coordinator ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a course to person without course and get error', async () => {
      const newInfo = {
        coordinator: new ObjectId(),
        courseId: null,
      };
      let error = false;
      try {
        await PersonService.addCourse(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding course to Coordinator. Course ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a course to person and succeed', async () => {
      const createdPerson = await PersonModel.create(defaultNewPerson);
      const _id = _.get(createdPerson, '_id');
      const newInfo = {
        coordinator: _id,
        courseId: new ObjectId(),
      };

      const updatedPerson = await PersonService.addCourse(newInfo);

      expect(updatedPerson).to.have.property('courses');
      const { courses } = updatedPerson;
      expect(courses).to.have.length(1);
      expect(_.map(courses, (course) => String(course))).to.includes(String(newInfo.courseId));
    });
  });

  describe('fn: removeCourse', async () => {
    it('Should try remove a course from person without coordinator and get error', async () => {
      const newInfo = {
        coordinator: null,
        courseId: new ObjectId(),
      };
      let error = false;
      try {
        await PersonService.removeCourse(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing course from Coordinator. Coordinator ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a course from person without course and get error', async () => {
      const newInfo = {
        coordinator: new ObjectId(),
        courseId: null,
      };
      let error = false;
      try {
        await PersonService.removeCourse(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing course from Coordinator. Course ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a course from person and succeed', async () => {
      const courseId = new ObjectId();
      const createdPerson = await PersonModel.create({
        ...defaultNewPerson,
        courses: [courseId],
      });
      const _id = _.get(createdPerson, '_id');

      expect(createdPerson).to.have.property('courses');
      const { courses } = createdPerson;
      expect(courses).to.have.length(1);
      const mappedCourses = _.map(courses, (course) => String(course));
      expect(mappedCourses).to.includes(String(courseId));

      const updatedPerson = await PersonService.removeCourse({
        courseId,
        coordinator: _id,
      });
      expect(updatedPerson).to.have.property('courses');
      const { courses: updatedCourses } = updatedPerson;
      expect(updatedCourses).to.have.length(0);
    });
  });

  describe('fn: addClassroom', () => {
    it('Should try add a classroom to person without teacher and get error', async () => {
      const newInfo = {
        teacher: null,
        classroomId: new ObjectId(),
      };
      let error = false;
      try {
        await PersonService.addClassroom(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding classroom to Teacher. Teacher ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a classroom to person without classroom and get error', async () => {
      const newInfo = {
        teacher: new ObjectId(),
        classroomId: null,
      };
      let error = false;
      try {
        await PersonService.addClassroom(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding classroom to Teacher. Classroom ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a classroom to person and succeed', async () => {
      const createdPerson = await PersonModel.create(defaultNewPerson);
      const _id = _.get(createdPerson, '_id');
      const newInfo = {
        teacher: _id,
        classroomId: new ObjectId(),
      };

      const updatedPerson = await PersonService.addClassroom(newInfo);

      expect(updatedPerson).to.have.property('classrooms');
      const { classrooms } = updatedPerson;
      expect(classrooms).to.have.length(1);
      const mappedClassrooms = _.map(classrooms, (classroom) => String(classroom));
      expect(mappedClassrooms).to.includes(String(newInfo.classroomId));
    });
  });

  describe('fn: removeClassroom', async () => {
    it('Should try remove a classroom from person without teacher and get error', async () => {
      const newInfo = {
        teacher: null,
        classroomId: new ObjectId(),
      };
      let error = false;
      try {
        await PersonService.removeClassroom(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing classroom from Teacher. Teacher ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a classroom from person without classroom and get error', async () => {
      const newInfo = {
        teacher: new ObjectId(),
        classroomId: null,
      };
      let error = false;
      try {
        await PersonService.removeClassroom(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing classroom from Teacher. Classroom ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a classroom from person and succeed', async () => {
      const classroomId = new ObjectId();
      const createdPerson = await PersonModel.create({
        ...defaultNewPerson,
        classrooms: [classroomId],
      });
      const _id = _.get(createdPerson, '_id');

      expect(createdPerson).to.have.property('classrooms');
      const { classrooms } = createdPerson;
      expect(classrooms).to.have.length(1);
      const mappedClassrooms = _.map(classrooms, (classroom) => String(classroom));
      expect(mappedClassrooms).to.includes(String(classroomId));

      const updatedPerson = await PersonService.removeClassroom({ classroomId, teacher: _id });
      expect(updatedPerson).to.have.property('classrooms');
      const { classrooms: updatedClassrooms } = updatedPerson;
      expect(updatedClassrooms).to.have.length(0);
    });
  });

  describe('fn: addEnrollment', () => {
    it('Should try add a enrollment to person without student and get error', async () => {
      const newInfo = {
        student: null,
        enrollmentId: new ObjectId(),
      };
      let error = false;
      try {
        await PersonService.addEnrollment(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding enrollment to Student. Student ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a enrollment to person without enrollment and get error', async () => {
      const newInfo = {
        student: new ObjectId(),
        enrollmentId: null,
      };
      let error = false;
      try {
        await PersonService.addEnrollment(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding enrollment to Student. Enrollment ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a classroom to person and succeed', async () => {
      const createdPerson = await PersonModel.create(defaultNewPerson);
      const _id = _.get(createdPerson, '_id');
      const newInfo = {
        student: _id,
        enrollmentId: new ObjectId(),
      };

      const updatedPerson = await PersonService.addEnrollment(newInfo);

      expect(updatedPerson).to.have.property('enrollments');
      const { enrollments } = updatedPerson;
      expect(enrollments).to.have.length(1);
      const mappedEnrollments = _.map(enrollments, (enrollment) => String(enrollment));
      expect(mappedEnrollments).to.includes(String(newInfo.enrollmentId));
    });
  });

  describe('fn: removeEnrollment', async () => {
    it('Should try remove a enrollment from person without student and get error', async () => {
      const newInfo = {
        student: null,
        enrollmentId: new ObjectId(),
      };
      let error = false;
      try {
        await PersonService.removeEnrollment(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing enrollment from Student. Student ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a enrollment from person without enrollment and get error', async () => {
      const newInfo = {
        student: new ObjectId(),
        enrollmentId: null,
      };
      let error = false;
      try {
        await PersonService.removeEnrollment(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing enrollment from Student. Enrollment ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a enrollment from person and succeed', async () => {
      const enrollmentId = new ObjectId();
      const createdPerson = await PersonModel.create({
        ...defaultNewPerson,
        enrollments: [enrollmentId],
      });
      const _id = _.get(createdPerson, '_id');

      expect(createdPerson).to.have.property('enrollments');
      const { enrollments } = createdPerson;
      expect(enrollments).to.have.length(1);
      const mappedEnrollments = _.map(enrollments, (enrollment) => String(enrollment));
      expect(mappedEnrollments).to.includes(String(enrollmentId));

      const updatedPerson = await PersonService.removeEnrollment({ enrollmentId, student: _id });
      expect(updatedPerson).to.have.property('enrollments');
      const { enrollments: updatedEnrollments } = updatedPerson;
      expect(updatedEnrollments).to.have.length(0);
    });
  });

  describe('fn: addComplementaryActivity', () => {
    it('Should try add a complementary activity to person without student and get error', async () => {
      const newInfo = {
        student: null,
        complementaryActivityId: new ObjectId(),
      };
      let error = false;
      try {
        await PersonService.addComplementaryActivity(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding complementary activity to Student. Student ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a complementary activity to person without complementary activity and get error', async () => {
      const newInfo = {
        student: new ObjectId(),
        complementaryActivityId: null,
      };
      let error = false;
      try {
        await PersonService.addComplementaryActivity(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding complementary activity to Student. Complementary Activity ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a complementary activity to person and succeed', async () => {
      const createdPerson = await PersonModel.create(defaultNewPerson);
      const _id = _.get(createdPerson, '_id');
      const newInfo = {
        student: _id,
        complementaryActivityId: new ObjectId(),
      };

      const updatedPerson = await PersonService.addComplementaryActivity(newInfo);

      expect(updatedPerson).to.have.property('complementaryActivities');
      const { complementaryActivities } = updatedPerson;
      expect(complementaryActivities).to.have.length(1);
      const mappedComplementaryActivities = _.map(complementaryActivities, (ca) => String(ca));
      expect(mappedComplementaryActivities).to.includes(String(newInfo.complementaryActivityId));
    });
  });

  describe('fn: removeComplementaryActivity', async () => {
    it('Should try remove a complementary activity from person without student and get error', async () => {
      const newInfo = {
        student: null,
        complementaryActivityId: new ObjectId(),
      };
      let error = false;
      try {
        await PersonService.removeComplementaryActivity(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing complementary activity from Student. Student ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a complementary activity from person without complementary activity and get error', async () => {
      const newInfo = {
        student: new ObjectId(),
        complementaryActivityId: null,
      };
      let error = false;
      try {
        await PersonService.removeComplementaryActivity(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing complementary activity from Student. Complementary Activity ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a complementary activity from person and succeed', async () => {
      const complementaryActivityId = new ObjectId();
      const createdPerson = await PersonModel.create({
        ...defaultNewPerson,
        complementaryActivities: [complementaryActivityId],
      });
      const _id = _.get(createdPerson, '_id');

      expect(createdPerson).to.have.property('complementaryActivities');
      const { complementaryActivities } = createdPerson;
      expect(complementaryActivities).to.have.length(1);
      const mappedComplementaryActivities = _.map(complementaryActivities, (ca) => String(ca));
      expect(mappedComplementaryActivities).to.includes(String(complementaryActivityId));

      const updatedPerson = await PersonService.removeComplementaryActivity({
        complementaryActivityId,
        student: _id,
      });
      expect(updatedPerson).to.have.property('complementaryActivities');
      const { complementaryActivities: updatedComplementaryActivities } = updatedPerson;
      expect(updatedComplementaryActivities).to.have.length(0);
    });
  });

  describe('fn: addSolicitation', () => {
    it('Should try add a solicitation to person without person and get error', async () => {
      const newInfo = {
        person: null,
        solicitationId: new ObjectId(),
      };
      let error = false;
      try {
        await PersonService.addSolicitation(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding solicitation to Person. Person ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a solicitation to person without solicitation and get error', async () => {
      const newInfo = {
        person: new ObjectId(),
        solicitationId: null,
      };
      let error = false;
      try {
        await PersonService.addSolicitation(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error adding solicitation to Person. Solicitation ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try add a solicitation to person and succeed', async () => {
      const createdPerson = await PersonModel.create(defaultNewPerson);
      const _id = _.get(createdPerson, '_id');
      const newInfo = {
        person: _id,
        solicitationId: new ObjectId(),
      };

      const updatedPerson = await PersonService.addSolicitation(newInfo);

      expect(updatedPerson).to.have.property('solicitations');
      const { solicitations } = updatedPerson;
      expect(solicitations).to.have.length(1);
      const mappedSolicitations = _.map(solicitations, (solicitation) => String(solicitation));
      expect(mappedSolicitations).to.includes(String(newInfo.solicitationId));
    });
  });

  describe('fn: removeSolicitation', async () => {
    it('Should try remove a solicitation from person without person and get error', async () => {
      const newInfo = {
        person: null,
        solicitationId: new ObjectId(),
      };
      let error = false;
      try {
        await PersonService.removeSolicitation(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing solicitation from Person. Person ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a solicitation from person without solicitation and get error', async () => {
      const newInfo = {
        person: new ObjectId(),
        solicitationId: null,
      };
      let error = false;
      try {
        await PersonService.removeSolicitation(newInfo);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing solicitation from Person. Solicitation ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a solicitation from person and succeed', async () => {
      const solicitationId = new ObjectId();
      const createdPerson = await PersonModel.create({
        ...defaultNewPerson,
        solicitations: [solicitationId],
      });
      const _id = _.get(createdPerson, '_id');

      expect(createdPerson).to.have.property('solicitations');
      const { solicitations } = createdPerson;
      expect(solicitations).to.have.length(1);
      const mappedSolicitations = _.map(solicitations, (solicitation) => String(solicitation));
      expect(mappedSolicitations).to.includes(String(solicitationId));

      const updatedPerson = await PersonService.removeSolicitation({
        solicitationId,
        person: _id,
      });
      expect(updatedPerson).to.have.property('solicitations');
      const { solicitations: updatedSolicitations } = updatedPerson;
      expect(updatedSolicitations).to.have.length(0);
    });
  });
});
