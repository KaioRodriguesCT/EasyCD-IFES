const _ = require('lodash');
const jwt = require('jsonwebtoken');

exports = module.exports = function initJWTPolicies(Utils) {
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
      const token = _.get(req, 'cookies.JWT');
      if (!token) {
        return res.status(401).json({
          message: 'Not authorized, token not available',
        });
      }
      return JWTPolicies(token, role, next);
    } catch (e) {
      return next(e);
    }
  }

  function JWTPolicies(token, role, next) {
    const decodedToken = jwt.verify(token, process.env.MAIN_TOKEN_ACCESS);
    if (!decodedToken) {
      Utils.throwError('Something wrong with user token', 403);
    }

    const tokenRole = _.get(decodedToken, 'role') || null;
    /// Basic level of access
    if (role === 'student' || _.isEqual(tokenRole, 'admin') || _.isEqual(tokenRole, role) || (_.isEqual(role, 'logged'))) {
      return next();
    }
    const error = new Error('Not authorized.');
    error.status = 401;
    throw error;
  }
};

exports['@singleton'] = true;
exports['@require'] = ['lib/utils'];
