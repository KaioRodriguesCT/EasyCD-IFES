//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  CURRICULUM_GRIDE_CREATE: createSagaAction('CURRICULUM_GRIDE_CREATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  createCurriculumGride: (body) => ({
    type: constants.CURRICULUM_GRIDE_CREATE.REQUEST, //Always request, to keep the cycle,
    body
  })
};

//Handlers
export const handlers = {
  [ constants.CURRICULUM_GRIDE_CREATE.REQUEST ]: (state, action) => {
    return { ...state, isCreating: true };
  },
  [ constants.CURRICULUM_GRIDE_CREATE.SUCCESS ]: (state, action) => {
    const { curriculumGride, message } = action;
    const curriculumGrides = state.curriculumGrides
      ? [...state.curriculumGrides, curriculumGride]
      : [curriculumGride];
    Message.success(message);
    return {
      ...state,
      lastCreatedCurriculumGride: curriculumGride,
      curriculumGrides,
      isCreating: false
    };
  },
  [ constants.CURRICULUM_GRIDE_CREATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isCreating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { body } = action;

    const { curriculumGride, message } = yield call(api, body);
    yield put({
      type: constants.CURRICULUM_GRIDE_CREATE.SUCCESS,
      curriculumGride,
      message
    });
  } catch (e) {
    yield put({
      type: constants.CURRICULUM_GRIDE_CREATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CURRICULUM_GRIDE_CREATE.REQUEST, saga);
}

//Api
async function api (body) {
  //Return the result of the request here
  return request('curriculum-grides/', {
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
