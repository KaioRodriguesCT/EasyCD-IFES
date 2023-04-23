//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  GET_COORDINATOR_COURSES: createSagaAction('GET_COORDINATOR_COURSES') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  getCoordinatorCourses: ({ filters } = {}) => ({
    type: constants.GET_COORDINATOR_COURSES.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.GET_COORDINATOR_COURSES.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.GET_COORDINATOR_COURSES.SUCCESS ]: (state, action) => {
    const { courses } = action;
    return { ...state, courses, isLoading: false };

  },
  [ constants.GET_COORDINATOR_COURSES.FAILURE ]: (state, action) => {
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
      type: constants.GET_COORDINATOR_COURSES.SUCCESS,
      courses
    });
  } catch (e) {
    yield put({
      type: constants.GET_COORDINATOR_COURSES.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.GET_COORDINATOR_COURSES.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('courses/coordinator-courses', {
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
