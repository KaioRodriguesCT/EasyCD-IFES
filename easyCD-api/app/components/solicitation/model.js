const mongooseDelete = require('mongoose-delete');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
exports = module.exports = function initModel(mongo) {
  const Solicitation = new mongo.Schema({
    solicitationType: {
      type: ObjectId,
      ref: 'SolicitationType',
      required: true,
      indeX: true,
    },
    status: {
      type: String,
      enum: ['Deferred', 'Undeferred', 'Pending'],
      required: true,
      default: 'Pending',
      index: true,
    },
    teacherApproval: {
      type: Boolean,
      required: true,
      index: true,
    },
    teacherNotes: {
      type: String,
    },
    coordinatorApproval: {
      type: Boolean,
      required: true,
      index: true,
    },
    coordinatorNotes: {
      type: String,
    },
    student: {
      type: ObjectId,
      ref: 'People',
      required: true,
      index: true,
    },
    meta: {
      type: Object,
      required: true,
    },
    /*
    // When a solicitation of a Complementary activity
    complementaryActivityType: {
      type: ObjectId,
      ref: 'ComplementaryActivityType',
      index: true,
    },
    evidence: {
      type: Buffer,
    },
    quantity: {
      type: Number,
    },

    // When a solicitation of a new Enrollment
    classroom: {
      type: ObjectId,
      ref: 'Classroom',
    },

    // When a solicitation of change Enrollment
    classroomToCreate: {
      type: ObjectId,
      ref: 'Classroom',
    },
    classroomToCancel: {
      type: ObjectId,
      ref: 'Classroom',
    }, */
  });

  // Plugins
  Solicitation.plugin(
    mongooseDelete,
    {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: true,
    },
  );

  return mongo.model('Solicitation', Solicitation);
};
exports['@singleton'] = true;
exports['@require'] = ['lib/mongo'];
