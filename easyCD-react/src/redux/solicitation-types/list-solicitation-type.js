//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  SOLICITATION_TYPE_LIST: createSagaAction('SOLICITATION_TYPE_LIST') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listSolicitationTypes: ({ filters } = {}) => ({
    type: constants.SOLICITATION_TYPE_LIST.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.SOLICITATION_TYPE_LIST.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.SOLICITATION_TYPE_LIST.SUCCESS ]: (state, action) => {
    const { solicitationTypes } = action;
    return { ...state, solicitationTypes, isLoading: false };
  },
  [ constants.SOLICITATION_TYPE_LIST.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { filters } = action;

    const { solicitationTypes } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.SOLICITATION_TYPE_LIST.SUCCESS,
      solicitationTypes
    });
  } catch (e) {
    yield put({
      type: constants.SOLICITATION_TYPE_LIST.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SOLICITATION_TYPE_LIST.REQUEST, saga);
}

//Api
async function api () {
  //Return the result of the request here
  return request('solicitation-types/', {
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
