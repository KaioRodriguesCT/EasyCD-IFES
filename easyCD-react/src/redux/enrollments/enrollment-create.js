//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  ENROLLMENT_CREATE: createSagaAction('ENROLLMENT_CREATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  createEnrollment: (body) => ({
    type: constants.ENROLLMENT_CREATE.REQUEST, //Always request, to keep the cycle,
    body
  })
};

//Handlers
export const handlers = {
  [ constants.ENROLLMENT_CREATE.REQUEST ]: (state, action) => {
    return { ...state, isCreating: true };
  },
  [ constants.ENROLLMENT_CREATE.SUCCESS ]: (state, action) => {
    const { enrollment, message } = action;
    const enrollments = state.enrollments
      ? [...state.enrollments, enrollment]
      : [enrollment];
    Message.success(message);
    return {
      ...state,
      lastCreatedEnrollment: enrollment,
      enrollments,
      isCreating: false
    };
  },
  [ constants.ENROLLMENT_CREATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isCreating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { body } = action;

    const { enrollment, message } = yield call(api, body);
    yield put({
      type: constants.ENROLLMENT_CREATE.SUCCESS,
      enrollment,
      message
    });
  } catch (e) {
    yield put({
      type: constants.ENROLLMENT_CREATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.ENROLLMENT_CREATE.REQUEST, saga);
}

//Api
async function api (body) {
  //Return the result of the request here
  return request('enrollments/', {
    method: 'POST',
    body
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
