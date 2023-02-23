//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  SUBJECT_CREATE: createSagaAction('SUBJECT_CREATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  createSubject: (body) => ({
    type: constants.SUBJECT_CREATE.REQUEST, //Always request, to keep the cycle,
    body
  })
};

//Handlers
export const handlers = {
  [ constants.SUBJECT_CREATE.REQUEST ]: (state, action) => {
    return { ...state, isCreating: true };
  },
  [ constants.SUBJECT_CREATE.SUCCESS ]: (state, action) => {
    const { subject, message } = action;
    const subjects = state.subjects
      ? [...state.subjects, subject]
      : [subject];
    Message.success(message);
    return {
      ...state,
      lastCreatedSubject: subject,
      subjects,
      isCreating: false
    };
  },
  [ constants.SUBJECT_CREATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isCreating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { body } = action;

    const { subject, message } = yield call(api, body);
    yield put({
      type: constants.SUBJECT_CREATE.SUCCESS,
      subject,
      message
    });
  } catch (e) {
    yield put({
      type: constants.SUBJECT_CREATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SUBJECT_CREATE.REQUEST, saga);
}

//Api
async function api (body) {
  //Return the result of the request here
  return request('subjects/', {
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
