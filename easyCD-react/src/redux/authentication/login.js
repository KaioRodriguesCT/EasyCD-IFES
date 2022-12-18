//Shared
import { createSagaAction } from '@shared/sagas';
import request from '@shared/request';

//Redux
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

//Constants
export const constants = {
  USER_LOGIN: createSagaAction('USER_LOGIN') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  userLogin: (user) => ({
    type: constants.USER_LOGIN.REQUEST, //Always request, to keep the cycle,
    user
  })
};

//Handlers
export const handlers = {
  [ constants.USER_LOGIN.REQUEST ]: (state, action) => {
    return { ...state, isLoggingIn: true };
  },
  [ constants.USER_LOGIN.SUCCESS ]: (state, action) => {
    const { user, message } = action;
    Message.success(message);
    return { ...state, isLoggingIn: false, user };
  },
  [ constants.USER_LOGIN.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoggingIn: false };
  }
};

//Sagas
export function* sagaUserLogin (action) {
  try {
    //Get the data from the action
    //Password already encrypted here
    const {
      user: { username, password }
    } = action;
    //Do a yield call into the api function
    const { user, message } = yield call(apiUserLogin, { username, password });
    yield put({
      type: constants.USER_LOGIN.SUCCESS,
      user,
      message
    });
  } catch (e) {
    yield put({
      type: constants.USER_LOGIN.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watchSagaUserLogin () {
  yield takeLatest(constants.USER_LOGIN.REQUEST, sagaUserLogin);
}

//Api
async function apiUserLogin (user) {
  //Return the result of the request here
  return request('users/auth', {
    method: 'POST',
    body: user
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher: watchSagaUserLogin
};
