//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  COURSE_CREATE: createSagaAction('COURSE_CREATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  createCourse: (body) => ({
    type: constants.COURSE_CREATE.REQUEST, //Always request, to keep the cycle,
    body
  })
};

//Handlers
export const handlers = {
  [ constants.COURSE_CREATE.REQUEST ]: (state, action) => {
    return { ...state, isCreating: true };
  },
  [ constants.COURSE_CREATE.SUCCESS ]: (state, action) => {
    const { course, message } = action;
    Message.success(message);
    return { ...state, lastCreatedCourse: course, isCreating: false };
  },
  [ constants.COURSE_CREATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isCreating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { body } = action;

    const { course, message } = yield call(api, body);
    yield put({
      type: constants.COURSE_CREATE.SUCCESS,
      course,
      message
    });
  } catch (e) {
    yield put({
      type: constants.COURSE_CREATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.COURSE_CREATE.REQUEST, saga);
}

//Api
async function api (body) {
  //Return the result of the request here
  return request('courses/', {
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
