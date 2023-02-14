//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  COURSE_LIST: createSagaAction('COURSE_LIST') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listCourses: ({ filters }) => ({
    type: constants.COURSE_LIST.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.COURSE_LIST.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.COURSE_LIST.SUCCESS ]: (state, action) => {
    const { courses } = action;
    return { ...state, courses, isLoading: false };

  },
  [ constants.COURSE_LIST.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, courses: [] };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { filters } = action;

    const { courses } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.COURSE_LIST.SUCCESS,
      courses
    });
  } catch (e) {
    yield put({
      type: constants.COURSE_LIST.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.COURSE_LIST.REQUEST, saga);
}

//Api
async function api () {
  //Return the result of the request here
  return request('courses/', {
    method: 'GET'
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
