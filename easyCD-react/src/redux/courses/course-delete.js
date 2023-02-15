//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

//LOdash
import filter from 'lodash/filter';
import isEqual from 'lodash/isEqual';

import request from '@shared/request';

//Constants
export const constants = {
  COURSE_DELETE: createSagaAction('COURSE_DELETE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  deleteCourse: (courseId) => ({
    type: constants.COURSE_DELETE.REQUEST, //Always request, to keep the cycle,
    courseId
  })
};

//Handlers
export const handlers = {
  [ constants.COURSE_DELETE.REQUEST ]: (state, action) => {
    return { ...state, isDeleting: true };
  },
  [ constants.COURSE_DELETE.SUCCESS ]: (state, action) => {
    const { courseId, message } = action;
    const courses = filter(state.courses, ({ _id }) => !isEqual(_id, courseId));
    Message.success(message);
    return { ...state, courses, isDeleting: false };
  },
  [ constants.COURSE_DELETE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isDeleting: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { courseId } = action;

    const { message } = yield call(api, { courseId });
    yield put({
      type: constants.COURSE_DELETE.SUCCESS,
      courseId,
      message
    });
  } catch (e) {
    yield put({
      type: constants.COURSE_DELETE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.COURSE_DELETE.REQUEST, saga);
}

//Api
async function api ({ courseId }) {
  //Return the result of the request here
  return request(`courses/${ courseId }`, {
    method: 'DELETE'
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
