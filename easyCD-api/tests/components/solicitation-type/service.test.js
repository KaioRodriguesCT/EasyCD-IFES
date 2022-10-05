/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const moment = require('moment');
const async = require('async');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const app = require('../../../app');

const Utils = IoC.create('tests/utils');
const SolicitationTypeService = IoC.create('components/solicitation-type/service');
const SolicitationTypeModel = IoC.create('components/solicitation-type/model');
const SolicitationModel = IoC.create('components/solicitation/model');
const ClassroomModel = IoC.create('components/classroom/model');
const SubjectModel = IoC.create('components/subject/model');
const CourseModel = IoC.create('components/course/model');
const CurriculumGrideModel = IoC.create('components/curriculum-gride/model');
const ComplementaryActivityTypeModel = IoC.create('components/complementary-activity-type/model');
const ComplementaryActivityModel = IoC.create('components/complementary-activity/model');
const EnrollmentModel = IoC.create('components/enrollment/model');

const { ObjectId } = mongoose.Types;
const context = {};
describe('components/solicitation-type/service', () => {
  before(async () => async.auto({
    student: async () => {
      context.student = await Utils.buildDefaultUser({
        role: 'student',
        props: {
          registration: '555',
          username: `student ${moment().add(1, 'day').format('mm:SS.SSS')}`,
        },
      });
    },
    teacher: async () => {
      context.teacher = await Utils.buildDefaultUser({
        role: 'teacher',
        props: {
          siape: 555,
          username: `teacher ${moment().add(1, 'day').format('mm:SS.SSS')}`,
        },
      });
    },
    coordinator: async () => {
      context.coordinator = await Utils.buildDefaultUser({
        role: 'teacher',
        props: {
          siape: 555,
          username: `coordinator ${moment().add(1, 'day').format('mm:SS.SSS')}`,
        },
      });
    },
    course: ['teacher', 'coordinator', async () => {
      const course = await CourseModel.create({
        name: 'teste',
        coordinator: _.get(context, 'coordinator.person'),
      });
      context.course = course;
      return course;
    }],
    course2: ['teacher', 'coordinator', async () => {
      const course = await CourseModel.create({
        name: 'teste2',
        coordinator: _.get(context, 'coordinator.person'),
      });
      context.course2 = course;
      return course;
    }],
    curriculumGride: ['course', async ({ course }) => {
      const gride = await CurriculumGrideModel.create({
        name: 'teste',
        dtStart: moment().subtract(1, 'year').format('YYYY-MM-DD'),
        dtEnd: moment().format('YYYY-MM-DD'),
        isActive: true,
        course: course._id,
      });
      context.gride = gride;
      return gride;
    }],
    subject: ['curriculumGride', async ({ curriculumGride }) => {
      const subject = await SubjectModel.create({
        name: 'Teste 1',
        qtyHours: 60,
        curriculumGride: curriculumGride._id,
      });
      context.subject = subject;
      return subject;
    }],
    subject2: ['curriculumGride', async ({ curriculumGride }) => {
      const subject = await SubjectModel.create({
        name: 'Teste 2',
        qtyHours: 60,
        curriculumGride: curriculumGride._id,
      });
      context.subject2 = subject;
      return subject;
    }],
    classroom: ['subject', async ({ subject }) => {
      const classroom = await ClassroomModel.create({
        semester: '2022/2',
        allowExceedLimit: true,
        teacher: _.get(context, 'teacher.person'),
        subject: subject._id,
      });
      context.classroom = classroom;
      return classroom;
    }],
    classroom2: ['subject2', async ({ subject2 }) => {
      const classroom = await ClassroomModel.create({
        semester: '2022/2',
        allowExceedLimit: true,
        teacher: _.get(context, 'teacher.person'),
        subject: subject2._id,
      });
      context.classroom2 = classroom;
      return classroom;
    }],
    enrollment: ['classroom2', async ({ classroom2 }) => {
      const enrollment = await EnrollmentModel.create({
        classroom: _.get(classroom2, '_id'),
        student: _.get(context, 'student.person'),
      });
      context.enrollment = enrollment;
      return enrollment;
    }],
  }));
  after(async () => {
    await Utils.cleanDatabase();
  });

  describe('fn: create', () => {
    it('Should try create a solicitation type without sent data, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.create();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Solicitation Type. Solicitation Type not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a solicitation type without sent required fields, and throw error', async () => {
      let error = false;
      const newSolicitationType = {
        description: 'SType',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: true,
        fieldsStructure: [
          {
            name: 'classroom',
            type: 'ObjectId',
          },
        ],
      };
      try {
        await SolicitationTypeService.create(newSolicitationType);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating Solicitation Type. Required Field: name not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a solicitation type and succeed', async () => {
      const newSolicitationType = {
        name: 'Enrollment',
        description: 'SType',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: true,
        fieldsStructure: [
          {
            name: 'classroom',
            type: 'ObjectId',
          },
        ],
      };

      const createdSolicitationType = await SolicitationTypeService.create(newSolicitationType);
      expect(createdSolicitationType).to.be.not.null;

      _.forOwn(newSolicitationType, (value, key) => {
        if (_.isArray(value)) {
          return;
        }
        expect(createdSolicitationType).to.have.property(key, value);
      });

      expect(createdSolicitationType).to.have.property('fieldsStructure');
      const { fieldsStructure } = createdSolicitationType;
      _.forEach(newSolicitationType.fieldsStructure, (field) => {
        const exists = _.filter(fieldsStructure, (item) => _.isEqual(field.name, item.name));
        expect(!_.isNil(exists)).to.be.true;
      });
    });
  });

  describe('fn: update', () => {
    it('Should try update a solicitation type without data, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Solicitation Type. Solicitation Type not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a solicitation type without ID, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Solicitation Type. Solicitation Type ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a solicitation type with non existent ID, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.update({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating Solicitation Type. Solicitation Type not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update a solicitation type and succeed, updating only the fields that are available', async () => {
      const newSolicitationType = {
        name: 'Enrollment',
        description: 'SType',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: true,
        fieldsStructure: [
          {
            name: 'classroom',
            type: 'ObjectId',
          },
        ],
      };

      const createdSolicitationType = await SolicitationTypeService.create(newSolicitationType);
      expect(createdSolicitationType).to.be.not.null;
      const solicitationTypeId = _.get(createdSolicitationType, '_id');

      const shouldBeUpdated = {
        name: 'new Name',
        description: 'newDescription',
        allowSubmitFile: false,
      };

      const shouldntBeUpdated = {
        requireTeacherApproval: null,
        requireCoordinatorApproval: undefined,
      };

      const updatedSolictationType = await SolicitationTypeService.update({
        ...shouldBeUpdated,
        ...shouldntBeUpdated,
        _id: solicitationTypeId,
      });
      expect(updatedSolictationType).to.be.not.null;

      _.forOwn(shouldBeUpdated, (value, key) => {
        expect(updatedSolictationType).to.have.property(key, value);
      });

      _.forOwn(shouldntBeUpdated, (value, key) => {
        expect(updatedSolictationType).to.not.have.property(key, value);
      });
    });

    it('Should try update a solicitation type and succeed, passing fieldStructure', async () => {
      const newSolicitationType = {
        name: 'Enrollment',
        description: 'SType',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: true,
        fieldsStructure: [
          {
            name: 'classroom',
            type: 'ObjectId',
          },
        ],
      };

      const createdSolicitationType = await SolicitationTypeService.create(newSolicitationType);
      expect(createdSolicitationType).to.be.not.null;
      const solicitationTypeId = _.get(createdSolicitationType, '_id');

      const newFieldsStructure = [
        {
          name: 'collection',
          type: 'String',
        },
        {
          name: 'student',
          type: 'String',
        },
      ];

      const updatedSType = await SolicitationTypeService.update({
        fieldsStructure: newFieldsStructure,
        _id: solicitationTypeId,
      });
      expect(updatedSType).to.be.any;
      expect(updatedSType).to.have.property('fieldsStructure');
      const { fieldsStructure } = updatedSType;
      _.forEach(newFieldsStructure, ({ name, type }) => {
        const exists = _.find(
          fieldsStructure,
          (field) => _.isEqual(field.name, name) && _.isEqual(field.type, type),
        );
        expect(exists).to.be.any;
        expect(exists).to.be.not.null;
      });
    });
  });

  describe('fn: remove', () => {
    it('Should try remove a solicitation type without sent data, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Solicitation Type. Solicitation Type not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a solicitation type without sent ID, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Solicitation Type. Solicitation Type ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a solicitation type with a non existent ID, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.remove({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing Solicitation Type. Solicitation Type not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a solicitation type and succeed', async () => {
      const newSolicitationType = {
        name: 'Enrollment',
        description: 'SType',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: true,
        fieldsStructure: [
          {
            name: 'classroom',
            type: 'ObjectId',
          },
        ],
      };

      const createdSolicitationType = await SolicitationTypeService.create(newSolicitationType);
      expect(createdSolicitationType).to.be.not.null;
      const solicitationTypeId = _.get(createdSolicitationType, '_id');

      await SolicitationTypeService.remove({ _id: solicitationTypeId });
      const removedSolicitation = await SolicitationTypeModel
        .findById(solicitationTypeId)
        .lean()
        .exec();
      expect(removedSolicitation).to.be.null;
    });
  });

  describe('fn: validateFieldsStructure', () => {
    it('Should try validate fieldsStructure with empty array, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default error message';
      try {
        SolicitationTypeService.validateFieldsStructure({ defaultErrorMessage });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Structure of the fields sent is not valid`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate fieldsStructure, but one of the fields are without name or type property, and throw error', async () => {
      let error = false;
      const defaultErrorMessage = 'Default error message';
      const fieldsStructure = [
        {
          name: 'test',
        },
      ];
      try {
        SolicitationTypeService.validateFieldsStructure({
          fieldsStructure,
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Name or type of the field are not valid, on fields structure array`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate fieldsStructure, but one of the fields are with a non available type', async () => {
      let error = false;
      const defaultErrorMessage = 'Default error message';
      const fieldsStructure = [
        {
          name: 'test',
          type: 'Image',
        },
      ];
      try {
        SolicitationTypeService.validateFieldsStructure({
          fieldsStructure,
          defaultErrorMessage,
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `${defaultErrorMessage}. Type of field test not valid. Please use one of the allow types: String, Number, Buffer, Boolean, ObjectId`);
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate fieldsStructure and succeed', async () => {
      const fieldsStructure = [
        {
          name: 'test',
          type: 'String',
        },
      ];
      const result = SolicitationTypeService.validateFieldsStructure({ fieldsStructure });
      expect(result).to.be.true;
    });
  });

  describe('fn: validateMeta', () => {
    it('Should try validate a meta field without ID, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.validateMeta({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Solicitation Type ID not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validiate a meta field with a non existent solicitiation type', async () => {
      let error = false;
      try {
        await SolicitationTypeService.validateMeta({ solicitationTypeId: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Solicitation Type not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a meta from a solicitation type with name Enrollment, and succeed', async () => {
      const newSolicitationType = {
        name: 'Enrollment',
        description: 'SType',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: true,
        fieldsStructure: [
          {
            name: 'classroom',
            type: 'ObjectId',
          },
        ],
      };
      const createdSolicitationType = await SolicitationTypeService.create(newSolicitationType);
      expect(createdSolicitationType).to.be.not.null;
      const solicitationTypeId = _.get(createdSolicitationType, '_id');

      const newClassroom = {
        subject: new ObjectId(),
        teacher: new ObjectId(),
        semester: '2022/2',
        allowExceedLimit: false,
      };
      const createdClassrom = await ClassroomModel.create(newClassroom);
      expect(createdClassrom).to.be.not.null;
      const classroomId = _.get(createdClassrom, '_id');

      const meta = {
        classroom: classroomId,
      };
      const result = await SolicitationTypeService.validateMeta({ solicitationTypeId, meta });
      expect(result).to.be.true;
    });

    it('Should try validate a meta from a solicitation type with name Enrollment Change, and succeed', async () => {
      const newSolicitationType = {
        name: 'Enrollment Change',
        description: 'SType',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: true,
        fieldsStructure: [
          {
            name: 'classroomToEnroll',
            type: 'ObjectId',
          },
          {
            name: 'classroomToUnenroll',
            type: 'ObjectId',
          },
        ],
      };
      const createdSolicitationType = await SolicitationTypeService.create(newSolicitationType);
      expect(createdSolicitationType).to.be.not.null;
      const solicitationTypeId = _.get(createdSolicitationType, '_id');

      const newClassroom1 = {
        subject: new ObjectId(),
        teacher: new ObjectId(),
        semester: '2022/2',
        allowExceedLimit: false,
      };
      const createdClassrom1 = await ClassroomModel.create(newClassroom1);
      expect(createdClassrom1).to.be.not.null;
      const classroomId1 = _.get(createdClassrom1, '_id');

      const newClassroom2 = {
        subject: new ObjectId(),
        teacher: new ObjectId(),
        semester: '2022/2',
        allowExceedLimit: false,
      };
      const createdClassrom2 = await ClassroomModel.create(newClassroom2);
      expect(createdClassrom2).to.be.not.null;
      const classroomId2 = _.get(createdClassrom2, '_id');

      const meta = {
        classroomToEnroll: classroomId1,
        classroomToUnenroll: classroomId2,
      };

      const result = await SolicitationTypeService.validateMeta({ solicitationTypeId, meta });
      expect(result).to.be.true;
    });

    it('Should try validate a meta from a solicitation type with name Complementary Activity, and succeed', async () => {
      const newSolicitationType = {
        name: 'Complementary Activity',
        description: 'SType',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: true,
        fieldsStructure: [
          {
            name: 'classroomToEnroll',
            type: 'ObjectId',
          },
          {
            name: 'classroomToUnenroll',
            type: 'ObjectId',
          },
        ],
      };
      const createdSolicitationType = await SolicitationTypeService.create(newSolicitationType);
      expect(createdSolicitationType).to.be.not.null;
      const solicitationTypeId = _.get(createdSolicitationType, '_id');

      const newCAType = {
        name: 'CAType Test #1',
        score: 10,
        unit: 'Hour',
        axle: 'Teaching',
      };
      const createdCAType = await ComplementaryActivityTypeModel.create(newCAType);
      expect(createdCAType).to.be.not.null;
      const createdCATypeId = _.get(createdCAType, '_id');

      const meta = {
        complementaryActivityType: createdCATypeId,
        evidence: Buffer.from('Test'),
        quantity: 10,
      };
      const result = await SolicitationTypeService.validateMeta({
        solicitationTypeId,
        meta,
      });
      expect(result).to.be.true;
    });

    it('Should try validate a meta without logic implemented and return null', async () => {
      const newSolicitationType = {
        name: 'Not implemented',
        description: 'SType',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: true,
        fieldsStructure: [
          {
            name: 'classroomToEnroll',
            type: 'ObjectId',
          },
          {
            name: 'classroomToUnenroll',
            type: 'ObjectId',
          },
        ],
      };
      const createdSolicitationType = await SolicitationTypeService.create(newSolicitationType);
      expect(createdSolicitationType).to.be.not.null;
      const solicitationTypeId = _.get(createdSolicitationType, '_id');

      const result = await SolicitationTypeService.validateMeta({
        solicitationTypeId,
        meta: {},
      });
      expect(result).to.be.null;
    });
  });

  describe('fn: validateEnrollmentSolicitationMeta', () => {
    it('Should try validate a enrollment solicitation meta, without sent any meta and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.validateEnrollmentSolicitationMeta({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Meta not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a enrollment solicitation meta, without a classroom field, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.validateEnrollmentSolicitationMeta({ meta: {} });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Classroom not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a enrollment solicitation meta, without a not classroom ID, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.validateEnrollmentSolicitationMeta({
          meta: {
            classroom: 'nonValidObjectId',
          },
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Classroom not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a enrollment solicitation meta, with a non existent classroom ID, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.validateEnrollmentSolicitationMeta({
          meta: {
            classroom: new ObjectId(),
          },
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Classroom not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try valudate a enrollment solicitation meta and succeed', async () => {
      const newClassroom = {
        subject: new ObjectId(),
        teacher: new ObjectId(),
        semester: '2022/2',
        allowExceedLimit: false,
      };
      const createdClassrom = await ClassroomModel.create(newClassroom);
      expect(createdClassrom).to.be.not.null;
      const classroomId = _.get(createdClassrom, '_id');

      const meta = {
        classroom: classroomId,
      };
      const result = await SolicitationTypeService.validateEnrollmentSolicitationMeta({ meta });
      expect(result).to.be.true;
    });
  });

  describe('fn: validateEnrollmentChangeSolicitationMeta', () => {
    before(async () => async.auto({
      classrooms: async () => {
        context.classroomToEnroll = await ClassroomModel.create({
          subject: new ObjectId(),
          teacher: new ObjectId(),
          semester: '2022/2',
          allowExceedLimit: false,
        });

        context.classroomToUnenroll = await ClassroomModel.create({
          subject: new ObjectId(),
          teacher: new ObjectId(),
          semester: '2022/2',
          allowExceedLimit: false,
        });
      },
    }));

    it('Should try validate a enrollment change solicitation meta, without meta and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.validateEnrollmentChangeSolicitationMeta({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Meta not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a enrollment change solicitation meta, without classroom to enroll and throw error', async () => {
      let error = false;
      const meta = {
        classroomToUnenroll: _.get(context, 'classroomToUnenroll._id'),
      };
      try {
        await SolicitationTypeService.validateEnrollmentChangeSolicitationMeta({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Classroom to enroll not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a enrollment change solicitation meta, with not valid ID of classroom to enroll and throw error', async () => {
      let error = false;
      const meta = {
        classroomToUnenroll: _.get(context, 'classroomToUnenroll._id'),
        classroomToEnroll: 'notValidObjectId',
      };
      try {
        await SolicitationTypeService.validateEnrollmentChangeSolicitationMeta({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Classroom to enroll not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a enrollment change solicitation meta, with not existent ID of classroom to enroll and throw error', async () => {
      let error = false;
      const meta = {
        classroomToUnenroll: _.get(context, 'classroomToUnenroll._id'),
        classroomToEnroll: new ObjectId(),
      };
      try {
        await SolicitationTypeService.validateEnrollmentChangeSolicitationMeta({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Classroom to enroll not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a enrollment change solicitation meta, without classroom to unenroll and throw error', async () => {
      let error = false;
      const meta = {
        classroomToEnroll: _.get(context, 'classroomToEnroll._id'),
      };
      try {
        await SolicitationTypeService.validateEnrollmentChangeSolicitationMeta({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Classroom to unenroll not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a enrollment change solicitation meta, with not valid ID of classroom to unenroll and throw error', async () => {
      let error = false;
      const meta = {
        classroomToEnroll: _.get(context, 'classroomToEnroll._id'),
        classroomToUnenroll: 'notValidObjectId',
      };
      try {
        await SolicitationTypeService.validateEnrollmentChangeSolicitationMeta({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Classroom to unenroll not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a enrollment change solicitation meta, with not existent ID of classroom to unenroll and throw error', async () => {
      let error = false;
      const meta = {
        classroomToEnroll: _.get(context, 'classroomToEnroll._id'),
        classroomToUnenroll: new ObjectId(),
      };
      try {
        await SolicitationTypeService.validateEnrollmentChangeSolicitationMeta({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on validate Enrollment Solicitation meta. Classroom to unenroll not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a enrollment change solicitation meta and succeed', async () => {
      const meta = {
        classroomToEnroll: _.get(context, 'classroomToEnroll._id'),
        classroomToUnenroll: _.get(context, 'classroomToUnenroll._id'),
      };
      const result = await SolicitationTypeService
        .validateEnrollmentChangeSolicitationMeta({ meta });

      expect(result).to.be.true;
    });
  });

  describe('fn: validateComplementaryActivityMetaSolicitation', () => {
    before(async () => async.auto({
      CAType: async () => {
        context.caType = await ComplementaryActivityTypeModel.create({
          name: 'Test',
          score: 10,
          unit: 'Hour',
          axle: 'Teaching',
        });
      },
    }));

    it('Should try validate a complementary activity solicitation meta, without meta and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.validateComplementaryActivityMetaSolicitation({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on Complementary Activity Solicitation meta. Meta not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity solicitation meta, without complementary activity type, and throw error', async () => {
      let error = false;
      const meta = {};
      try {
        await SolicitationTypeService.validateComplementaryActivityMetaSolicitation({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on Complementary Activity Solicitation meta. Complementary Activity type not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity solicitation meta, with non valid complementary activity type ID, and throw error', async () => {
      let error = false;
      const meta = {
        complementaryActivityType: 'nonValidObjectId',
      };
      try {
        await SolicitationTypeService.validateComplementaryActivityMetaSolicitation({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on Complementary Activity Solicitation meta. Complementary Activity type not sent or not a valid ID');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity solicitation meta, with non existent complementary activity type ID, and throw error', async () => {
      let error = false;
      const meta = {
        complementaryActivityType: new ObjectId(),
      };
      try {
        await SolicitationTypeService.validateComplementaryActivityMetaSolicitation({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on Complementary Activity Solicitation meta. Complementary Activity Type not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity solicitation meta, without evidence and throw error', async () => {
      let error = false;
      const meta = {
        complementaryActivityType: _.get(context, 'caType._id'),
      };
      try {
        await SolicitationTypeService.validateComplementaryActivityMetaSolicitation({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on Complementary Activity Solicitation meta. Evidence not sent or not a valid Buffer');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity solicitation meta, with not evidence as a buffer and throw error', async () => {
      let error = false;
      const meta = {
        complementaryActivityType: _.get(context, 'caType._id'),
        evidence: 'notValidBuffer',
      };
      try {
        await SolicitationTypeService.validateComplementaryActivityMetaSolicitation({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on Complementary Activity Solicitation meta. Evidence not sent or not a valid Buffer');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity solicitation meta, without quantity and throw error', async () => {
      let error = false;
      const meta = {
        complementaryActivityType: _.get(context, 'caType._id'),
        evidence: Buffer.from('test'),
      };
      try {
        await SolicitationTypeService.validateComplementaryActivityMetaSolicitation({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on Complementary Activity Solicitation meta. Quantity not sent or not a valid number');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity solicitation meta, with not quantity as a number and throw error', async () => {
      let error = false;
      const meta = {
        complementaryActivityType: _.get(context, 'caType._id'),
        evidence: Buffer.from('test'),
        quantity: 'notANumber',
      };
      try {
        await SolicitationTypeService.validateComplementaryActivityMetaSolicitation({ meta });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on Complementary Activity Solicitation meta. Quantity not sent or not a valid number');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try validate a complementary activity solicitation meta and succeed', async () => {
      const meta = {
        complementaryActivityType: _.get(context, 'caType._id'),
        evidence: Buffer.from('test'),
        quantity: 1,
      };
      const result = await SolicitationTypeService
        .validateComplementaryActivityMetaSolicitation({ meta });
      expect(result).to.be.true;
    });
  });

  describe('fn: processSolicitation', () => {
    before(async () => {
      const names = [
        'Enrollment',
        'Enrollment Change',
        'Complementary Activity',
        'NotIdentified',
      ];
      context.solicitationsType = await async.mapSeries(
        names,
        async (name) => SolicitationTypeModel
          .create({
            name,
            description: name,
            requireTeacherApproval: false,
            requireCoordinatorApproval: true,
            allowSubmitFile: false,
            // Don't matter here the structure
            fieldsStructure: [],
          }),
      );
    });

    it('Should try process a solicitation, without solicitation and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.processSolicitation({
          state: 'created',
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error processing recently created solicitation. Solicitation not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try process a solicitation without existent solicitation type and throw error', async () => {
      let error = false;
      const info = {
        solicitation: {
          _id: new ObjectId(),
          solicitationType: new ObjectId(),
        },
        state: 'created',
      };
      try {
        await SolicitationTypeService.processSolicitation(info);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', `Error processing recently created solicitation: ${String(info.solicitation._id)}. Solicitation Type not found`);
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try process a solicitation of Enrollment and succeed', async () => {
      const solicitationType = _.find(context.solicitationsType, ({ name }) => _.isEqual(name, 'Enrollment'));
      const info = {
        solicitation: {
          _id: new ObjectId(),
          solicitationType: _.get(solicitationType, '_id'),
          meta: {
            classroom: _.get(context, 'classroom._id'),
          },
        },
        state: 'nonIdentified',
      };
      const result = await SolicitationTypeService.processSolicitation(info);
      expect(result).to.be.null;
    });

    it('Should try process a solicitation of Enrollment Change and succeed', async () => {
      const solicitationType = _.find(context.solicitationsType, ({ name }) => _.isEqual(name, 'Enrollment Change'));
      const info = {
        solicitation: {
          _id: new ObjectId(),
          solicitationType: _.get(solicitationType, '_id'),
          meta: {
            classroomToEnroll: _.get(context, 'classroom._id'),
            classroomToUnenroll: _.get(context, 'classroom2._id'),
          },
        },
        state: 'nonIdentified',
      };
      const result = await SolicitationTypeService.processSolicitation(info);
      expect(result).to.be.null;
    });

    it('Should try process a solicitation of Complementary Activity and succeed', async () => {
      const createdCAType = await ComplementaryActivityTypeModel.create({
        name: 'CAType Test #1',
        score: 10,
        unit: 'Hour',
        axle: 'Teaching',
      });
      expect(createdCAType).to.be.not.null;

      const solicitationType = _.find(context.solicitationsType, ({ name }) => _.isEqual(name, 'Complementary Activity'));
      const info = {
        solicitation: {
          _id: new ObjectId(),
          solicitationType: _.get(solicitationType, '_id'),
          meta: {
            quantity: 1,
            evidence: Buffer.from('TESTS'),
            course: _.get(context, 'course._id'),
            complementaryActivityType: _.get(createdCAType, '_id'),
          },
        },
        state: 'nonIdentified',
      };
      const result = await SolicitationTypeService.processSolicitation(info);
      expect(result).to.be.null;
    });

    it('Should try process solicitation, with not identified name and return null', async () => {
      const solicitationType = _.find(context.solicitationsType, ({ name }) => _.isEqual(name, 'NotIdentified'));
      const info = {
        solicitation: {
          _id: new ObjectId(),
          solicitationType: _.get(solicitationType, '_id'),
        },
      };
      const result = await SolicitationTypeService.processSolicitation(info);
      expect(result).to.be.null;
    });
  });

  describe('fn: processEnrollmentSolicitation', () => {
    it('Should try process an enrollment solicitation, without solicitation or solicitation type, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.processEnrollmentSolicitation({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on processing Enrollment Solicitation. Solicitation or Solicitation type not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try process an enrollment solicitation, and do not find coordinator or teacher for the clasroom sent', async () => {
      let error = false;
      const solicitationType = {
        _id: new ObjectId(),
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            classroom: new ObjectId(),
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
        },
        solicitationType,
      };

      try {
        await SolicitationTypeService.processEnrollmentSolicitation(info);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on processing Enrollment Solicitation. Teacher and Coordinator not found for classroom');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try process an enrollment solicitation, with created state, and process required approvals successfully', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            classroom: _.get(context, 'classroom._id'),
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'created',
      };

      const result = await SolicitationTypeService.processEnrollmentSolicitation(info);
      expect(result).to.be.not.null;
      expect(result).to.have.property('processingTeacher');
      expect(result).to.have.property('processingCoordinator');
      const { processingTeacher, processingCoordinator } = result;
      expect(processingCoordinator).to.be.not.null;
      expect(processingTeacher).to.be.not.null;
    });

    it('Should try process an enrollment solicitation, with deleted state, and process required approvals successfully', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            classroom: _.get(context, 'classroom._id'),
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'deleted',
      };

      const result = await SolicitationTypeService.processEnrollmentSolicitation(info);
      expect(result).to.be.not.null;
      expect(result).to.have.property('processingTeacher');
      expect(result).to.have.property('processingCoordinator');
      const { processingTeacher, processingCoordinator } = result;
      expect(processingCoordinator).to.be.not.null;
      expect(processingTeacher).to.be.not.null;
    });

    it('Should try process an enrollment solicitation, with updated state, and is not approved, so return null', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: false,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            classroom: _.get(context, 'classroom._id'),
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
          coordinatorApproval: false,
        },
        solicitationType,
        state: 'updated',
      };

      const result = await SolicitationTypeService.processEnrollmentSolicitation(info);
      expect(result).to.null;
    });

    it('Should try process an enrollment solicitation, with updated state, and is approved, so should process the action', async () => {
      const classroomId = _.get(context, 'classroom._id');

      const createdSolicitationType = await SolicitationTypeModel.create({
        name: 'ttest',
        description: 'test',
        requireTeacherApproval: false,
        requireCoordinatorApproval: true,
        allowSubmitFile: false,
        fieldsStructure: [
          {
            name: 'classroom',
            type: 'ObjectId',
          },
        ],
      });
      const solicitationTypeId = _.get(createdSolicitationType, '_id');

      const createdSolicitation = await SolicitationModel.create({
        solicitationType: solicitationTypeId,
        student: _.get(context, 'student.person'),
        meta: {
          classroom: classroomId,
        },
      });

      const info = {
        solicitation: {
          ...createdSolicitation.toJSON(),
          coordinatorApproval: true,
        },
        solicitationType: createdSolicitationType,
        state: 'updated',
      };

      const result = await SolicitationTypeService.processEnrollmentSolicitation(info);
      expect(result).to.be.not.null;
      expect(result).to.have.property('createdEnrollment');

      const { createdEnrollment } = result;
      expect(createdEnrollment).to.be.not.null;
      expect(createdEnrollment).to.have.property('classroom');
      expect(String(createdEnrollment.classroom)).to.be.equal(String(classroomId));

      expect(result).to.have.property('updatedSolicitation');
      const { updatedSolicitation } = result;
      expect(updatedSolicitation).to.have.property('isProcessed', true);
    });

    it('Should try process an enrollment solicitation, with a non identified state and return null', async () => {
      const solicitationType = {
        _id: new ObjectId(),
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            classroom: _.get(context, 'classroom._id'),
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'notIdentified',
      };

      const result = await SolicitationTypeService.processEnrollmentSolicitation(info);
      expect(result).to.be.null;
    });
  });

  describe('fn: processEnrollmentChangeSolicitation', () => {
    it('Should try process a solicitation, without solicitation or solicitation type and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.processEnrollmentChangeSolicitation({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on processing Enrollment Change Solicitation. Solicitation or Solicitation type not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try process a solicitation, wtithout teacher and coordinator and throw error', async () => {
      let error = false;
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            classroomToEnroll: new ObjectId(),
          },
        },
        solicitationType: {
          _id: new ObjectId(),
        },
      };
      try {
        await SolicitationTypeService.processEnrollmentChangeSolicitation(info);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on processing Enrollment Change Solicitation. Teacher and Coordinator not found for classroom');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try process a solicitation with created state and succeed', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            classroomToEnroll: _.get(context, 'classroom._id'),
            classroomToUnenroll: _.get(context, 'classroom2._id'),
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'created',
      };

      const result = await SolicitationTypeService.processEnrollmentChangeSolicitation(info);
      expect(result).to.be.not.null;
      expect(result).to.have.property('processingTeacher');
      expect(result).to.have.property('processingCoordinator');
      const { processingTeacher, processingCoordinator } = result;
      expect(processingCoordinator).to.be.not.null;
      expect(processingTeacher).to.be.not.null;
    });

    it('Should try process a solicitation with deleted state and succeed', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            classroomToEnroll: _.get(context, 'classroom._id'),
            classroomToUnenroll: _.get(context, 'classroom2._id'),
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'deleted',
      };

      const result = await SolicitationTypeService.processEnrollmentChangeSolicitation(info);
      expect(result).to.be.not.null;
      expect(result).to.have.property('processingTeacher');
      expect(result).to.have.property('processingCoordinator');
      const { processingTeacher, processingCoordinator } = result;
      expect(processingCoordinator).to.be.not.null;
      expect(processingTeacher).to.be.not.null;
    });

    it('Should try process a solicitation with updated state, and not approved, and return null', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            classroomToEnroll: _.get(context, 'classroom._id'),
            classroomToUnenroll: _.get(context, 'classroom2._id'),
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'updated',
      };

      const result = await SolicitationTypeService.processEnrollmentChangeSolicitation(info);
      expect(result).to.be.null;
    });

    it('Should try process a solicitation with updated state, and approved so should process all actions', async () => {
      const solicitationType = await SolicitationTypeModel.create({
        name: 'testType',
        description: 'testType',
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
        allowSubmitFile: false,
        fieldsStructure: [
          {
            name: 'classroomToEnroll',
            type: 'ObjectId',
          },
          {
            name: 'classroomToUnenroll',
            type: 'ObjectId',
          },
        ],
      });
      const solicitation = await SolicitationModel.create({
        meta: {
          classroomToEnroll: _.get(context, 'classroom._id'),
          classroomToUnenroll: _.get(context, 'classroom2._id'),
        },
        isProcessed: false,
        solicitationType: solicitationType._id,
        student: _.get(context, 'student.person'),
        teacherApproval: true,
        coordinatorApproval: true,
      });
      const info = {
        solicitation,
        solicitationType,
        state: 'updated',
      };

      const result = await SolicitationTypeService.processEnrollmentChangeSolicitation(info);
      expect(result).to.be.not.null;

      // Expect to have created a new enrollment with the classroom to enrol and the student
      const createdClassrom = await EnrollmentModel
        .findOne({
          student: _.get(info, 'solicitation.student'),
          classroom: _.get(info, 'solicitation.meta.classroomToEnroll'),
        })
        .lean()
        .exec();
      expect(createdClassrom).to.be.not.null;

      // Expect to have updatte the classroom to unenroll with Canceled status.
      const canceledClassroom = await EnrollmentModel
        .findOne({
          student: _.get(info, 'solicitation.student'),
          classroom: _.get(info, 'solicitation.meta.classroomToUnenroll'),
        })
        .lean()
        .exec();
      expect(canceledClassroom).to.be.not.null;
      expect(canceledClassroom).to.have.property('status', 'Canceled');

      // Expect to update the isProcessed flag to don't process it again
      const updatedSolicitation = await SolicitationModel
        .findById(_.get(solicitation, '_id'))
        .lean()
        .exec();
      expect(updatedSolicitation).to.have.property('isProcessed', true);
    });

    it('Should try process a solicitation with non identified state and return null', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            classroomToEnroll: _.get(context, 'classroom._id'),
            classroomToUnenroll: _.get(context, 'classroom2._id'),
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'nonIdentified',
      };

      const result = await SolicitationTypeService.processEnrollmentChangeSolicitation(info);
      expect(result).to.be.null;
    });
  });

  describe('fn: processComplementaryActivitySolicitation', () => {
    it('Should try process a solicitation without solicitation or solicitation type, and throw error', async () => {
      let error = false;
      try {
        await SolicitationTypeService.processComplementaryActivitySolicitation({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on processing Complementary Activity Solicitation. Solicitation or Solicitation type not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try process a solicitation without a existent course and and throw error', async () => {
      let error = false;
      const solicitationType = {
        _id: new ObjectId(),
      };
      const info = {
        solicitation: {
          meta: {
            course: new ObjectId(),
          },
        },
        solicitationType,
      };
      try {
        await SolicitationTypeService.processComplementaryActivitySolicitation(info);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error on processing Complementary Activity Solicitation. Course not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try process a solicitation with created state, and process required approvals successfully', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: false,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            course: _.get(context, 'course._id'),
            evidence: Buffer.from('YYYY_TEST'),
            quantity: 1,
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'created',
      };

      const result = await SolicitationTypeService.processComplementaryActivitySolicitation(info);
      expect(result).to.be.not.null;
      expect(result).to.have.property('processingTeacher');
      expect(result).to.have.property('processingCoordinator');
      const { processingTeacher, processingCoordinator } = result;
      expect(processingCoordinator).to.be.not.null;
      expect(processingTeacher).to.be.null;
    });

    it('Should try process a solicitation with deleted state, and process required approvals successfully', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: false,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            course: _.get(context, 'course._id'),
            evidence: Buffer.from('YYYY_TEST'),
            quantity: 1,
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'deleted',
      };

      const result = await SolicitationTypeService.processComplementaryActivitySolicitation(info);
      expect(result).to.be.not.null;
      expect(result).to.have.property('processingTeacher');
      expect(result).to.have.property('processingCoordinator');
      const { processingTeacher, processingCoordinator } = result;
      expect(processingCoordinator).to.be.not.null;
      expect(processingTeacher).to.be.null;
    });

    it('Should try process a solicitation with updated state, but not approved and not repproved and return null', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: false,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            course: _.get(context, 'course._id'),
            evidence: Buffer.from('YYYY_TEST'),
            quantity: 1,
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'updated',
      };

      const result = await SolicitationTypeService.processComplementaryActivitySolicitation(info);
      expect(result).to.be.null;
    });

    it('Should try process a solicitation with updated state, and approved, so should process all actions', async () => {
      const createdCAType = await ComplementaryActivityTypeModel.create({
        name: 'CAType Test #1',
        score: 10,
        unit: 'Hour',
        axle: 'Teaching',
      });
      expect(createdCAType).to.be.not.null;

      const solicitationType = await SolicitationTypeModel.create({
        name: 'testType',
        description: 'testType',
        requireTeacherApproval: false,
        requireCoordinatorApproval: true,
        allowSubmitFile: false,
        fieldsStructure: [
          {
            name: 'course',
            type: 'ObjectId',
          },
          {
            name: 'evidence',
            type: 'Buffer',
          },
          {
            name: 'quantity',
            type: 'Number',
          },
        ],
      });
      expect(solicitationType).to.be.not.null;

      const solicitation = await SolicitationModel.create({
        meta: {
          course: _.get(context, 'course._id'),
          evidence: Buffer.from('YYYY_TEST'),
          quantity: 1,
          complementaryActivityType: _.get(createdCAType, '_id'),
        },
        isProcessed: false,
        solicitationType: solicitationType._id,
        student: _.get(context, 'student.person'),
        coordinatorApproval: true,
      });
      expect(solicitation).to.be.not.null;

      const info = {
        solicitation,
        solicitationType,
        state: 'updated',
      };

      const result = await SolicitationTypeService.processComplementaryActivitySolicitation(info);
      expect(result).to.be.not.null;

      // Expect to create a complementary activity approved for the student
      const CActivity = await ComplementaryActivityModel
        .findOne({
          student: _.get(solicitation, 'student'),
          course: _.get(solicitation, 'meta.course'),
          complementaryActivityType: _.get(createdCAType, '_id'),
        })
        .lean()
        .exec();
      expect(CActivity).to.be.not.null;
      expect(CActivity).to.have.property('status', 'Accepted');

      // Should update the solicitation with is processed flags
      const updatedSolicitation = await SolicitationModel
        .findById(_.get(solicitation, '_id'))
        .lean()
        .exec();
      expect(updatedSolicitation).to.be.not.null;
      expect(updatedSolicitation).to.have.property('isProcessed', true);
    });

    it('Should try process a solicitation with updated state, and reproved, so should process all actions', async () => {
      const createdCAType = await ComplementaryActivityTypeModel.create({
        name: 'CAType Test #1',
        score: 10,
        unit: 'Hour',
        axle: 'Teaching',
      });
      expect(createdCAType).to.be.not.null;

      const solicitationType = await SolicitationTypeModel.create({
        name: 'testType',
        description: 'testType',
        requireTeacherApproval: false,
        requireCoordinatorApproval: true,
        allowSubmitFile: false,
        fieldsStructure: [
          {
            name: 'course',
            type: 'ObjectId',
          },
          {
            name: 'evidence',
            type: 'Buffer',
          },
          {
            name: 'quantity',
            type: 'Number',
          },
        ],
      });
      expect(solicitationType).to.be.not.null;

      const solicitation = await SolicitationModel.create({
        meta: {
          course: _.get(context, 'course2._id'),
          evidence: Buffer.from('YYYY_TEST'),
          quantity: 1,
          complementaryActivityType: _.get(createdCAType, '_id'),
        },
        isProcessed: false,
        solicitationType: solicitationType._id,
        student: _.get(context, 'student.person'),
        coordinatorApproval: false,
      });
      expect(solicitation).to.be.not.null;

      const info = {
        solicitation,
        solicitationType,
        state: 'updated',
      };

      const result = await SolicitationTypeService.processComplementaryActivitySolicitation(info);
      expect(result).to.be.not.null;

      // Expect to create a complementary activity approved for the student
      const CActivity = await ComplementaryActivityModel
        .findOne({
          student: _.get(solicitation, 'student'),
          course: _.get(solicitation, 'meta.course'),
          complementaryActivityType: _.get(createdCAType, '_id'),
        })
        .lean()
        .exec();
      expect(CActivity).to.be.not.null;
      expect(CActivity).to.have.property('status', 'Rejected');

      // Should update the solicitation with is processed flags
      const updatedSolicitation = await SolicitationModel
        .findById(_.get(solicitation, '_id'))
        .lean()
        .exec();
      expect(updatedSolicitation).to.be.not.null;
      expect(updatedSolicitation).to.have.property('isProcessed', true);
    });

    it('Should try process a solicitation with non identified state, and return null', async () => {
      const solicitationType = {
        _id: new ObjectId(),
        requireTeacherApproval: false,
        requireCoordinatorApproval: true,
      };
      const info = {
        solicitation: {
          _id: new ObjectId(),
          meta: {
            course: _.get(context, 'course._id'),
            evidence: Buffer.from('YYYY_TEST'),
            quantity: 1,
          },
          isProcessed: false,
          solicitationType: solicitationType._id,
          student: _.get(context, 'student.person'),
        },
        solicitationType,
        state: 'nonIdentified',
      };

      const result = await SolicitationTypeService.processComplementaryActivitySolicitation(info);
      expect(result).to.be.null;
    });
  });

  describe('fn: processingRequiredApprovals', () => {
    beforeEach(async () => async.auto({
      teacher: async () => {
        context.teacher = await Utils.buildDefaultUser({
          role: 'teacher',
          props: {
            siape: 555,
            username: `teacher ${moment().format('mm:SS')}`,
          },
        });
      },
      coordinator: async () => {
        context.coordinator = await Utils.buildDefaultUser({
          role: 'teacher',
          props: {
            siape: 555,
            username: `coordinator ${moment().format('mm:SS')}`,
          },
        });
      },
    }));

    it('Should try process required approvals, with an solicitation that do not need teacher approval and return null', async () => {
      const info = {
        solicitation: {
          _id: new ObjectId(),
        },
        teacher: _.get(context, 'teacher.person'),
        coordinator: _.get(context, 'coordinator.person'),
        solicitationType: {
          requireTeacherApproval: false,
          requireCoordinatorApproval: true,
        },
        state: 'created',
      };
      const result = await SolicitationTypeService.processingRequiredApprovals(info);
      expect(result.processingTeacher).to.be.null;
    });

    it('Should try process required approvals with state created, and add solicitation to teacher', async () => {
      const info = {
        solicitation: {
          _id: new ObjectId(),
        },
        teacher: _.get(context, 'teacher.person'),
        coordinator: _.get(context, 'coordinator.person'),
        solicitationType: {
          requireTeacherApproval: true,
          requireCoordinatorApproval: false,
        },
        state: 'created',
      };
      const result = await SolicitationTypeService.processingRequiredApprovals(info);
      expect(result.processingTeacher).to.be.not.null;
      expect(result).to.have.property('processingTeacher');
      const { processingTeacher: updatedTeacher } = result;
      expect(updatedTeacher).to.have.property('solicitations');
      const { solicitations: teacherSolicitations } = updatedTeacher;
      const mapTeacherSol = _.map(teacherSolicitations, (solicitation) => String(solicitation));
      expect(mapTeacherSol).to.includes(String(_.get(info, 'solicitation._id')));
    });

    it('Should try process required approvals with state deleted, and remove solicitation from teacher', async () => {
      const solicitationId = new ObjectId();
      const info = {
        solicitation: {
          _id: solicitationId,
        },
        teacher: _.get(context, 'teacher.person'),
        coordinator: _.get(context, 'coordinator.person'),
        solicitationType: {
          requireTeacherApproval: true,
          requireCoordinatorApproval: false,
        },
        state: 'created',
      };

      const result = await SolicitationTypeService.processingRequiredApprovals(info);
      expect(result).to.be.not.null;
      expect(result).to.have.property('processingTeacher');

      const { processingTeacher: updatedTeacher } = result;
      expect(updatedTeacher).to.have.property('solicitations');

      const { solicitations: teacherSolicitations } = updatedTeacher;
      const mapTeacherSol = _.map(teacherSolicitations, (solicitation) => String(solicitation));
      expect(mapTeacherSol).to.includes(String(_.get(info, 'solicitation._id')));

      const resultDeleted = await SolicitationTypeService.processingRequiredApprovals({
        ...info,
        state: 'deleted',
      });

      expect(resultDeleted).to.be.not.null;
      expect(resultDeleted).to.have.property('processingTeacher');

      const { processingTeacher: updatedTeacher_ } = resultDeleted;
      expect(updatedTeacher_).to.have.property('solicitations');

      const { solicitations: teacherSolicitations_ } = updatedTeacher_;
      expect(teacherSolicitations_).to.have.length(0);
    });

    it('Should try process required approvals, with an solicitation that do not need coordinator approval and return null', async () => {
      const info = {
        solicitation: {
          _id: new ObjectId(),
        },
        teacher: _.get(context, 'teacher.person'),
        coordinator: _.get(context, 'coordinator.person'),
        solicitationType: {
          requireTeacherApproval: true,
          requireCoordinatorApproval: false,
        },
        state: 'created',
      };
      const result = await SolicitationTypeService.processingRequiredApprovals(info);
      expect(result.processingCoordinator).to.be.null;
    });

    it('Should try process required approvals with state created, and add solicitation to coordinator', async () => {
      const info = {
        solicitation: {
          _id: new ObjectId(),
        },
        teacher: _.get(context, 'teacher.person'),
        coordinator: _.get(context, 'coordinator.person'),
        solicitationType: {
          requireTeacherApproval: false,
          requireCoordinatorApproval: true,
        },
        state: 'created',
      };
      const result = await SolicitationTypeService.processingRequiredApprovals(info);
      expect(result.processingCoordinator).to.be.not.null;
      expect(result).to.have.property('processingCoordinator');
      const { processingCoordinator: updatedCoordinator } = result;
      expect(updatedCoordinator).to.have.property('solicitations');
      const { solicitations: coordSolcitations } = updatedCoordinator;
      const mapCoordSol = _.map(coordSolcitations, (solicitation) => String(solicitation));
      expect(mapCoordSol).to.includes(String(_.get(info, 'solicitation._id')));
    });

    it('Should try process required approvals with state deleted, and remove solicitation from coordinator', async () => {
      const info = {
        solicitation: {
          _id: new ObjectId(),
        },
        teacher: _.get(context, 'teacher.person'),
        coordinator: _.get(context, 'coordinator.person'),
        solicitationType: {
          requireTeacherApproval: false,
          requireCoordinatorApproval: true,
        },
        state: 'created',
      };
      const result = await SolicitationTypeService.processingRequiredApprovals(info);
      expect(result.processingCoordinator).to.be.not.null;
      expect(result).to.have.property('processingCoordinator');

      const { processingCoordinator: updatedCoordinator } = result;
      expect(updatedCoordinator).to.have.property('solicitations');

      const { solicitations: coordSolcitations } = updatedCoordinator;
      const mapCoordSol = _.map(coordSolcitations, (solicitation) => String(solicitation));
      expect(mapCoordSol).to.includes(String(_.get(info, 'solicitation._id')));

      const resultDeleted = await SolicitationTypeService.processingRequiredApprovals({
        ...info,
        state: 'deleted',
      });

      expect(resultDeleted).to.be.not.null;
      expect(resultDeleted).to.have.property('processingCoordinator');

      const { processingCoordinator: updatedCoord_ } = resultDeleted;
      expect(updatedCoord_).to.have.property('solicitations');

      const { solicitations: coordSolcitations_ } = updatedCoord_;
      expect(coordSolcitations_).to.have.length(0);
    });

    it('Should try process required approvals, and send a non idenfitified state and just return null for both processing', async () => {
      const info = {
        solicitation: {
          _id: new ObjectId(),
        },
        teacher: _.get(context, 'teacher.person'),
        coordinator: _.get(context, 'coordinator.person'),
        solicitationType: {
          requireTeacherApproval: true,
          requireCoordinatorApproval: true,
        },
        state: 'notIdentified',
      };

      const result = await SolicitationTypeService.processingRequiredApprovals(info);
      expect(result).to.be.not.null;
      expect(result).to.have.property('processingCoordinator');
      expect(result).to.have.property('processingTeacher');
      expect(result.processingCoordinator).to.be.null;
      expect(result.processingTeacher).to.be.null;
    });
  });

  describe('fn: isApproved', () => {
    it('Should try validate if solicitation is approved, and return false, because require teacher approval and do not have it', async () => {
      const solicitation = {
        teacherApproval: false,
      };
      const solicitationType = {
        requireTeacherApproval: true,
      };
      const result = SolicitationTypeService.isApproved({ solicitation, solicitationType });
      expect(result).to.be.false;
    });

    it('Should try validate if solicitation is approved, and return false, because require coordinator approval and do not have it', async () => {
      const solicitation = {
        coordinatorApproval: false,
      };
      const solicitationType = {
        requireTeacherApproval: false,
        requireCoordinatorApproval: true,
      };
      const result = SolicitationTypeService.isApproved({ solicitation, solicitationType });
      expect(result).to.be.false;
    });

    it('Should try validate if solicitation is approved and return true, because or have all required approvals', async () => {
      const solicitation = {
        coordinatorApproval: true,
        teacherApproval: true,
      };
      const solicitationType = {
        requireTeacherApproval: true,
        requireCoordinatorApproval: true,
      };
      const result = SolicitationTypeService.isApproved({ solicitation, solicitationType });
      expect(result).to.be.true;
    });
  });

  describe('fn: isReproved', () => {
    it('Should try validate if a solicitation is repproved, and return true, because need coordinator approval and it is false', async () => {
      const solicitation = {
        teacherApproval: false,
      };
      const solicitationType = {
        requireTeacherApproval: true,
      };
      const result = SolicitationTypeService.isReproved({ solicitation, solicitationType });
      expect(result).to.be.true;
    });

    it('Should try validate if a solicitation is repproved, and return true, because need teacher approval and it is false', async () => {
      const solicitation = {
        coordinatorApproval: false,
      };
      const solicitationType = {
        requireCoordinatorApproval: true,
      };
      const result = SolicitationTypeService.isReproved({ solicitation, solicitationType });
      expect(result).to.be.true;
    });

    it('Should try validate if a solicitation is repproved, and return false, because do not have any of your required approvals false', async () => {
      const solicitation = {
        coordinatorApproval: null,
        teacherrApproval: null,
      };
      const solicitationType = {
        requireCoordinatorApproval: true,
        requireTeacherApproval: true,
      };
      const result = SolicitationTypeService.isReproved({ solicitation, solicitationType });
      expect(result).to.be.false;
    });
  });
});
