//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  CLASSROOM_CREATE: createSagaAction('CLASSROOM_CREATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  createClassroom: (body) => ({
    type: constants.CLASSROOM_CREATE.REQUEST, //Always request, to keep the cycle,
    body
  })
};

//Handlers
export const handlers = {
  [ constants.CLASSROOM_CREATE.REQUEST ]: (state, action) => {
    return { ...state, isCreating: true };
  },
  [ constants.CLASSROOM_CREATE.SUCCESS ]: (state, action) => {
    const { classroom, message } = action;
    const classrooms = state.classrooms
      ? [...state.classrooms, classroom]
      : [classroom];
    Message.success(message);
    return {
      ...state,
      lastCreatedSubject: classroom,
      classrooms,
      isCreating: false
    };
  },
  [ constants.CLASSROOM_CREATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isCreating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { body } = action;

    const { classroom, message } = yield call(api, body);
    yield put({
      type: constants.CLASSROOM_CREATE.SUCCESS,
      classroom,
      message
    });
  } catch (e) {
    yield put({
      type: constants.CLASSROOM_CREATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CLASSROOM_CREATE.REQUEST, saga);
}

//Api
async function api (body) {
  //Return the result of the request here
  return request('classrooms/', {
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
