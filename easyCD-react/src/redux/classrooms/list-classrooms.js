//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  CLASSROOM_LIST: createSagaAction('CLASSROOM_LIST') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listClassrooms: ({ filters }) => ({
    type: constants.CLASSROOM_LIST.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.CLASSROOM_LIST.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.CLASSROOM_LIST.SUCCESS ]: (state, action) => {
    const { classrooms } = action;
    return { ...state, classrooms, isLoading: false };

  },
  [ constants.CLASSROOM_LIST.FAILURE ]: (state, action) => {
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
      type: constants.CLASSROOM_LIST.SUCCESS,
      classrooms
    });
  } catch (e) {
    yield put({
      type: constants.CLASSROOM_LIST.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CLASSROOM_LIST.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('classrooms/', {
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
