//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  GET_STUDENTS: createSagaAction('GET_STUDENTS') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  getStudents: () => ({
    type: constants.GET_STUDENTS.REQUEST
  })
};

//Handlers
export const handlers = {
  [ constants.GET_STUDENTS.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.GET_STUDENTS.SUCCESS ]: (state, action) => {
    const { peopleSlim } = action;
    return { ...state, students: peopleSlim, isLoading: false };

  },
  [ constants.GET_STUDENTS.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, students: [] };
  }
};

//Sagas
export function* saga () {
  try {
    const { peopleSlim } = yield call(api, { role: 'student' });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.GET_STUDENTS.SUCCESS,
      peopleSlim
    });
  } catch (e) {
    yield put({
      type: constants.GET_STUDENTS.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.GET_STUDENTS.REQUEST, saga);
}

//Api
async function api ({ role }) {
  //Return the result of the request here
  return request('people/slim-by-role', {
    method: 'GET',
    query: { role }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
