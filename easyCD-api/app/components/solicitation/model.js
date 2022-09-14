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
      enum: ['Deferred', 'Undeferred', 'Pending', 'Canceled'],
      required: true,
      default: 'Pending',
      index: true,
    },
    teacherApproval: {
      type: Boolean,
      index: true,
    },
    teacherNotes: {
      type: String,
    },
    coordinatorApproval: {
      type: Boolean,
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
    isProcessed: {
      type: Boolean,
      required: true,
      index: true,
      default: false,
    },
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
