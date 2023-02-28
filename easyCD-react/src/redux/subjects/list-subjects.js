//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  SUBJECTS_LIST: createSagaAction('SUBJECTS_LIST') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listSubjects: ({ filters }) => ({
    type: constants.SUBJECTS_LIST.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.SUBJECTS_LIST.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.SUBJECTS_LIST.SUCCESS ]: (state, action) => {
    const { subjects } = action;
    return { ...state, subjects, isLoading: false };
  },
  [ constants.SUBJECTS_LIST.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, subjects: [] };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { filters } = action;

    const { subjects } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.SUBJECTS_LIST.SUCCESS,
      subjects
    });
  } catch (e) {
    yield put({
      type: constants.SUBJECTS_LIST.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SUBJECTS_LIST.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('subjects/', {
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
