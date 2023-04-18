//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  GET_STUDENT_ENROLLMENTS: createSagaAction('GET_STUDENT_ENROLLMENTS') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  getStudentEnrollments: ({ filters }) => ({
    type: constants.GET_STUDENT_ENROLLMENTS.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.GET_STUDENT_ENROLLMENTS.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.GET_STUDENT_ENROLLMENTS.SUCCESS ]: (state, action) => {
    const { enrollments } = action;
    return { ...state, studentEnrollments: enrollments , isLoading: false };

  },
  [ constants.GET_STUDENT_ENROLLMENTS.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, enrollments: [] };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { filters } = action;

    const { enrollments } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.GET_STUDENT_ENROLLMENTS.SUCCESS,
      enrollments
    });
  } catch (e) {
    yield put({
      type: constants.GET_STUDENT_ENROLLMENTS.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.GET_STUDENT_ENROLLMENTS.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('enrollments/student-enrollments', {
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
