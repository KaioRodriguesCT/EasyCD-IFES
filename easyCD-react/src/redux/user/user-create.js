//Shared
import { createSagaAction } from '@shared/sagas';
import request from '@shared/request';

//Redux
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

//Constants
export const constants = {
  USER_CREATE: createSagaAction('USER_CREATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  userCreate: (user) => ({
    type: constants.USER_CREATE.REQUEST, //Always request, to keep the cycle,
    user
  })
};

//Handlers
export const handlers = {
  [ constants.USER_CREATE.REQUEST ]: (state, action) => {
    return { ...state, isCreatingUser: true, userSuccessfullyCreated: false };
  },
  [ constants.USER_CREATE.SUCCESS ]: (state, action) => {
    const { user, message } = action;
    Message.success(message);
    return {
      ...state,
      isCreatingUser: false,
      lastCreatedUser: user,
      userSuccessfullyCreated: true
    };
  },
  [ constants.USER_CREATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isCreatingUser: false, userSuccessfullyCreated: false };
  }
};

//Sagas
export function* sagaUserCreate (action) {
  try {
    //Get the data from the action
    //Password already encrypted here
    const {
      user: { username, password, role, siape, registration, name, surname, email, phone, address }
    } = action;
    //Do a yield call into the api function
    const { user, message } = yield call(apiUserCreate, {
      username,
      password,
      role,
      siape,
      registration,
      name,
      surname,
      email,
      phone,
      address
    });

    yield put({
      type: constants.USER_CREATE.SUCCESS,
      user,
      message
    });
  } catch (e) {
    yield put({
      type: constants.USER_CREATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watchSagaUserCreate () {
  yield takeLatest(constants.USER_CREATE.REQUEST, sagaUserCreate);
}

//Api
async function apiUserCreate (user) {
  //Return the result of the request here
  const result = await request('users/', {
    method: 'POST',
    body: user
  });
  return result;
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher: watchSagaUserCreate
};
