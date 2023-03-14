//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  SOLICITATION_CREATE: createSagaAction('SOLICITATION_CREATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  createSolicitation: (body) => ({
    type: constants.SOLICITATION_CREATE.REQUEST, //Always request, to keep the cycle,
    body
  })
};

//Handlers
export const handlers = {
  [ constants.SOLICITATION_CREATE.REQUEST ]: (state, action) => {
    return { ...state, isCreating: true };
  },
  [ constants.SOLICITATION_CREATE.SUCCESS ]: (state, action) => {
    const { solicitation, message } = action;
    const solicitations = state.solicitations
      ? [...state.solicitations, solicitation]
      : [solicitation];
    Message.success(message);
    return { ...state, solicitations, isCreating: false };
  },
  [ constants.SOLICITATION_CREATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isCreating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { body } = action;

    const { solicitation, message } = yield call(api, body);
    yield put({
      type: constants.SOLICITATION_CREATE.SUCCESS,
      solicitation,
      message
    });
  } catch (e) {
    yield put({
      type: constants.SOLICITATION_CREATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SOLICITATION_CREATE.REQUEST, saga);
}

//Api
async function api (body) {
  //Return the result of the request here
  return request('solicitations/', {
    method: 'POST',
    body
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
