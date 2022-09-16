/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const { expect } = require('chai');
const IoC = require('electrolyte');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const app = require('../../../app');

// Service
const Utils = IoC.create('tests/utils');
const UserService = IoC.create('components/user/service');
const UserModel = IoC.create('components/user/model');
const PersonModel = IoC.create('components/person/model');
const { ObjectId } = mongoose.Types;

describe('componentes/user/service', async () => {
  const defaultPerson = {
    name: 'Person',
    surname: '#1',
    email: 'person#1@gmail.com',
    phone: '99999999',
  };

  const defaultUser = {
    username: 'username',
    password: 'password',
    role: 'student',
    registration: '555',
  };

  afterEach(async () => {
    await Utils.cleanDatabase();
  });

  describe('fn: create', () => {
    it('Should try create a teacher without SIAPE code and throw error', async () => {
      const newUser = {
        username: 'username',
        password: 'password',
        role: 'teacher',
      };
      let error = false;
      try {
        await UserService.create({ ...newUser, ...defaultPerson });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating User. Field: Siape is required for Teacher');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try created a student without registration code and throw error', async () => {
      const newUser = {
        username: 'username',
        password: 'password',
        role: 'student',
      };
      let error = false;
      try {
        await UserService.create({ ...newUser, ...defaultPerson });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating User. Field: Registration is required for Student');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a user without required fields and throw error', async () => {
      const newUser = {
        password: 'password',
        role: 'student',
        registration: '8888',
      };
      let error = false;
      try {
        await UserService.create({ ...newUser, ...defaultPerson });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating User. Required Field: username, not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a user but the username is already being used, and throw error', async () => {
      const newUser = {
        username: 'username',
        password: 'password',
        role: 'student',
        registration: '8888',
        person: new ObjectId(),
      };
      await UserModel.create(newUser);
      let error = false;
      try {
        await UserService.create({ ...newUser, ...defaultPerson });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error creating User. Username is already being used');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try create a user and succeed', async () => {
      const newUser = {
        username: 'username',
        password: 'password',
        role: 'student',
        registration: '8888',
      };
      const createdUser = await UserService.create({ ...newUser, ...defaultPerson });
      _.forOwn(newUser, (value, key) => {
        if (_.isEqual(key, 'password')) {
          expect(createdUser[key]).to.be.not.any;
        } else {
          expect(createdUser).to.have.property(key, value);
        }
      });

      const person = await PersonModel
        .findById(_.get(createdUser, 'person'))
        .lean()
        .exec();

      expect(person).to.be.not.null;
      _.forOwn(defaultPerson, (value, key) => {
        expect(person).to.have.property(key, value);
      });
    });
  });

  describe('fn: update', () => {
    it('Should try update a user without user, and throw error', async () => {
      let error = false;
      try {
        await UserService.update();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating User. User not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a user without ID and throw error', async () => {
      let error = false;
      try {
        await UserService.update({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating User. User ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a user withohut a existent user', async () => {
      let error = false;
      try {
        await UserService.update({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating User. User not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try update a user role to teacher without sent Siape and throw error', async () => {
      const user = {
        username: 'username',
        password: 'password',
        role: 'student',
        registration: 'registration',
        person: new ObjectId(),
      };
      const createdUser = await UserModel.create(user);
      let error = false;
      try {
        const updatedFields = {
          role: 'teacher',
        };
        await UserService.update({ ...updatedFields, _id: _.get(createdUser, '_id') });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating User. Field: Siape is required for Teacher');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a user role to student without sent Registration and throw error', async () => {
      const user = {
        username: 'username',
        password: 'password',
        role: 'teacher',
        siape: 555,
        person: new ObjectId(),
      };
      const createdUser = await UserModel.create(user);
      let error = false;
      try {
        const updatedFields = {
          role: 'student',
        };
        await UserService.update({ ...updatedFields, _id: _.get(createdUser, '_id') });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating User. Field: Registration is required for Student');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a user username with a already existent username and throw error', async () => {
      const user1 = {
        username: 'User #1',
        password: 'password',
        role: 'teacher',
        siape: 555,
        person: new ObjectId(),
      };
      const user2 = {
        username: 'User #2',
        password: 'password',
        role: 'teacher',
        siape: 555,
        person: new ObjectId(),
      };
      const createdUser1 = await UserModel.create(user1);
      const createdUser2 = await UserModel.create(user2);

      let error = false;
      try {
        await UserService.update({
          _id: _.get(createdUser2, '_id'),
          username: _.get(createdUser1, 'username'),
        });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error updating User. Username is already being used');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try update a user and succeed', async () => {
      const user = {
        username: 'username',
        password: 'password',
        role: 'student',
        registration: 'registration',
        person: new ObjectId(),
      };
      const createdUser = await UserModel.create(user);

      const updatedFields = {
        username: 'updatedUsername',
        password: 'updatedPassword',
        role: 'teacher',
        siape: 8885,
      };
      const updatedUser = await UserService.update({
        ...updatedFields,
        _id: _.get(createdUser, '_id'),
      });
      _.forOwn(updatedFields, (value, key) => {
        expect(updatedUser).to.have.property(key, value);
      });
    });

    it('Should try empty a non allowedEmpty field and don\'t update it', async () => {
      const user = {
        username: 'username',
        password: 'password',
        role: 'student',
        registration: 'registration',
        person: new ObjectId(),
      };
      const createdUser = await UserModel.create(user);

      const updatedFields = {
        username: null,
        password: undefined,
        role: '',
        registration: null,
        siape: null,
      };
      const updatedUser = await UserService.update({
        ...updatedFields,
        _id: _.get(createdUser, '_id'),
      });
      _.forOwn(updatedFields, (value, key) => {
        expect(updatedUser).to.not.have.property(key, value);
      });
    });
  });

  describe('fn: remove', async () => {
    it('Should try remove a user without sent a user, and throw error', async () => {
      let error = false;
      try {
        await UserService.remove();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing User. User not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a user without sent a ID, and throw error', async () => {
      let error = false;
      try {
        await UserService.remove({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing User. User ID not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a user with a non existent user, and throw error', async () => {
      let error = false;
      try {
        await UserService.remove({ _id: new ObjectId() });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'Error removing User. User not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try remove a user and succeed', async () => {
      const createdUser = await UserService.create({ ...defaultPerson, ...defaultUser });
      const createdUserId = _.get(createdUser, '_id');
      expect(createdUser).to.be.not.null;

      const person = await PersonModel
        .findById(_.get(createdUser, 'person'))
        .lean()
        .exec();
      expect(person).to.be.not.null;

      await UserService.remove({ _id: createdUserId });

      // Should remove user
      const user = await UserModel
        .findById(createdUserId)
        .lean()
        .exec();
      expect(user).to.be.null;
      // Should remove person
      const removedPerson = await PersonModel
        .findById(_.get(createdUser, 'person'))
        .lean()
        .exec();
      expect(removedPerson).to.be.null;
    });
  });

  describe('fn: auth', () => {
    it('Should try authenticate the user without sent the user, and throw error', async () => {
      let error = false;
      try {
        await UserService.auth();
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'User authentication failed. Error: User not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try authenticate the user without username and password, and throw error', async () => {
      let error = false;
      try {
        await UserService.auth({});
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'User authentication failed. Error: Username or Password not sent');
        expect(e).to.have.property('status', 400);
      }
      expect(error).to.be.true;
    });

    it('Should try authenticate the user with a non existent username, and throw error', async () => {
      const user = {
        username: 'user1',
        password: 'pass1',
      };
      let error = false;
      try {
        await UserService.auth(user);
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'User authentication failed. Error: Username not found');
        expect(e).to.have.property('status', 404);
      }
      expect(error).to.be.true;
    });

    it('Should try authenticate the user with wrong password', async () => {
      const user = {
        username: 'user1',
        password: 'pass1',
        role: 'student',
        registration: '55',
        person: new ObjectId(),
      };
      const createdUser = await UserModel.create(user);
      expect(createdUser).to.be.not.null;
      let error = false;
      try {
        await UserService.auth({ username: 'user1', password: 'wrongPass' });
      } catch (e) {
        error = true;
        expect(e).to.have.property('message', 'User authentication failed. Error: User not authenticated');
        expect(e).to.have.property('status', 401);
      }
      expect(error).to.be.true;
    });

    it('Should try authenticate the user and succeed', async () => {
      const user = {
        username: 'user1',
        password: 'pass1',
        role: 'student',
        registration: '55',
      };
      // Need use the service to get the password encrypted
      const createdUser = await UserService.create({ ...user, ...defaultPerson });
      expect(createdUser).to.be.not.null;

      const auth = await UserService.auth(_.pick(user, ['username', 'password']));
      expect(auth).to.be.not.null;

      expect(auth).to.have.property('username', user.username);
      expect(auth).to.have.property('role', user.role);
      expect(auth).to.have.property('token');
      expect(auth.token).to.be.not.null;
    });
  });

  describe('fn: getByPerson', () => {
    it('Should try search user by person and return success', async () => {
      const createdUser = await UserService.create({ ...defaultPerson, ...defaultUser });
      const userFound = await UserService.getByPerson(_.get(createdUser, 'person'));
      expect(userFound).to.not.be.null;
      expect(String(_.get(userFound, '_id'))).to.be.equal(String(_.get(createdUser, '_id')));
    });
  });

  describe('fn: findById', () => {
    it('Should try find a user by id', async () => {
      const createdUser = await UserService.create({ ...defaultPerson, ...defaultUser });
      const userFound = await UserService.findById({ _id: _.get(createdUser, '_id') });
      expect(userFound).to.not.be.null;
      expect(String(_.get(userFound, '_id'))).to.be.equal(String(_.get(createdUser, '_id')));
    });
  });
});
