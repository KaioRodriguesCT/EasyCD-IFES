//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  ENROLLMENT_LIST: createSagaAction('ENROLLMENT_LIST') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listEnrollments: ({ filters }) => ({
    type: constants.ENROLLMENT_LIST.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.ENROLLMENT_LIST.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.ENROLLMENT_LIST.SUCCESS ]: (state, action) => {
    const { enrollments } = action;
    return { ...state, enrollments, isLoading: false };

  },
  [ constants.ENROLLMENT_LIST.FAILURE ]: (state, action) => {
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
      type: constants.ENROLLMENT_LIST.SUCCESS,
      enrollments
    });
  } catch (e) {
    yield put({
      type: constants.ENROLLMENT_LIST.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.ENROLLMENT_LIST.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('enrollments/', {
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
