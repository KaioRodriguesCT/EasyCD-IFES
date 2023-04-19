//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  GET_STUDENT_SOLICITATIONS: createSagaAction('GET_STUDENT_SOLICITATIONS') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  getStudentSolicitations: ({ filters } = {}) => ({
    type: constants.GET_STUDENT_SOLICITATIONS.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.GET_STUDENT_SOLICITATIONS.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.GET_STUDENT_SOLICITATIONS.SUCCESS ]: (state, action) => {
    const { solicitations } = action;
    return { ...state, studentSolicitations: solicitations, isLoading: false };

  },
  [ constants.GET_STUDENT_SOLICITATIONS.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, solicitations: [] };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { filters } = action;

    const { solicitations } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.GET_STUDENT_SOLICITATIONS.SUCCESS,
      solicitations
    });
  } catch (e) {
    yield put({
      type: constants.GET_STUDENT_SOLICITATIONS.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.GET_STUDENT_SOLICITATIONS.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('solicitations/student-solicitations', {
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
