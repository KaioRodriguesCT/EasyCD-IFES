/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
exports = module.exports = function initUser(IoC, Utils) {
  const User = new mongoose.Schema({
    // User data
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String.fromCharCode,
      required: true,
      minlength: 8,
    },
    role: {
      enum: ['student', 'coodinator', 'teacher'],
      default: 'student',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    // Person data
    name: {
      type: String,
      index: true,
    },
    surname: {
      type: String,
    },
    fullName: {
      type: String,
      index: true,
    },
    birthDate: {
      type: Date,
      index: true,
    },
    phoneNumber: {
      type: String,
    },
    secondaryPhoneNumber: {
      type: String,
    },
    studentRegistration: {
      type: String,
    },
  }, {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  });
  // Actions
  User.static('modelValidation', _modelValidation);
  function _modelValidation(user) {
    const validationResult = {
      message: [],
      isValid: false,
    };
    const username = _.get(user, 'username') || null;
    if (!username) {
      validationResult.errors.push('Username is required and not found');
    }
    const password = _.get(user, 'password') || null;
    if (!password || _.size(password) < 8) {
      validationResult.errors.push('Password is required and minimium of 8 characters.');
    }
    const role = _.get(user, 'role') || null;
    if (!role) {
      validationResult.errors.push('Role not found, and it is required');
    }
    const email = _.get(user, 'email') || null;
    if (!email) {
      validationResult.errors.push('Email not found, and it is required');
    }
    validationResult.isValid = true;
    return validationResult;
  }
  // Middlwares
  User.pre('save', () => {});
  User.post('save', () => {});
  User.pre('remove', () => {});
  User.post('remove', () => {});
  // Plugins
  User.plugin(mongooseDelete, { deletedBy: true, deletedAt: true }, { overrideMethods: 'all' });

  // Keep this always on the end
  return mongoose.model('User', User);
};

exports['@singleton'] = true;

exports['@require'] = ['!container', 'lib/utils'];
