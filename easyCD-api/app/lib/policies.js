/* eslint-disable no-shadow */
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const moment = require('moment');

exports = module.exports = function initJWTPolicies(Utils, settings) {
  return {
    JWTStudent,
    JWTTeacher,
    JWTAdmin,
    JWTLogged,
  };

  function JWTStudent(req, res, next) {
    return JWTRole(req, res, next, 'student');
  }

  function JWTTeacher(req, res, next) {
    return JWTRole(req, res, next, 'teacher');
  }

  function JWTLogged(req, res, next) {
    return JWTRole(req, res, next, 'logged');
  }

  function JWTAdmin(req, res, next) {
    return JWTRole(req, res, next, 'admin');
  }

  function JWTRole(req, res, next, role) {
    try {
      const { headers } = req;
      const accessToken = _.get(headers, 'authentication');
      if (!accessToken) {
        return res.status(401).json({
          message: 'Not authorized',
        });
      }
      const jwtToken = _.last(_.split(accessToken, ' '));
      const user = jwt.verify(jwtToken, settings.accessToken.secret, (err, user) => {
        if (err?.expiredAt < moment()) {
          return Utils.throwError('User token expired', 409);
        }
        return user;
      });

      const tokenRole = _.get(user, 'role') || null;
      /// Basic level of access
      if (role === 'student' || _.isEqual(tokenRole, 'admin') || _.isEqual(tokenRole, role) || (_.isEqual(role, 'logged'))) {
        return next();
      }
      return Utils.throwError('Not authorized', 401);
    } catch (e) {
      return next(e);
    }
  }
};

exports['@singleton'] = true;
exports['@require'] = ['lib/utils', 'boot/settings'];
