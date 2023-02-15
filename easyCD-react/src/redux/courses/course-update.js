//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

//LOdash
import filter from 'lodash/filter';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';

import request from '@shared/request';

//Constants
export const constants = {
  COURSE_UPDATE: createSagaAction('COURSE_UPDATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  updateCourse: (course) => ({
    type: constants.COURSE_UPDATE.REQUEST, //Always request, to keep the cycle,
    course
  })
};

//Handlers
export const handlers = {
  [ constants.COURSE_UPDATE.REQUEST ]: (state, action) => {
    return { ...state, isUpdating: true };
  },
  [ constants.COURSE_UPDATE.SUCCESS ]: (state, action) => {
    const { course, message } = action;
    const courses = filter(state.courses, ({ _id }) => !isEqual(_id, get(course, '_id')));
    Message.success(message);
    return { ...state, courses: [...courses, course], isUpdating: false };
  },
  [ constants.COURSE_UPDATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isUpdating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { course } = action;

    const { course: newCourse, message } = yield call(api, { course });
    yield put({
      type: constants.COURSE_UPDATE.SUCCESS,
      course: newCourse,
      message
    });
  } catch (e) {
    yield put({
      type: constants.COURSE_UPDATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.COURSE_UPDATE.REQUEST, saga);
}

//Api
async function api ({ course }) {
  //Return the result of the request here
  return request(`courses/${ get(course, '_id') }`, {
    method: 'PUT',
    body: { course }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
