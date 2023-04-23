//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  GET_TEACHER_CLASSROOMS: createSagaAction('GET_TEACHER_CLASSROOMS') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  getTeacherClassrooms: ({ filters } = {}) => ({
    type: constants.GET_TEACHER_CLASSROOMS.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.GET_TEACHER_CLASSROOMS.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.GET_TEACHER_CLASSROOMS.SUCCESS ]: (state, action) => {
    const { classrooms } = action;
    return { ...state, classrooms, isLoading: false };

  },
  [ constants.GET_TEACHER_CLASSROOMS.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, classrooms: [] };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { filters } = action;

    const { classrooms } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.GET_TEACHER_CLASSROOMS.SUCCESS,
      classrooms
    });
  } catch (e) {
    yield put({
      type: constants.GET_TEACHER_CLASSROOMS.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.GET_TEACHER_CLASSROOMS.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('classrooms/teacher-classrooms', {
    method: 'GET',
    query: { filters }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
