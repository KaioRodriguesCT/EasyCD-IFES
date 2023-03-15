//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  CA_TYPE_CREATE: createSagaAction('CA_TYPE_CREATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  createCaType: (body) => ({
    type: constants.CA_TYPE_CREATE.REQUEST, //Always request, to keep the cycle,
    body
  })
};

//Handlers
export const handlers = {
  [ constants.CA_TYPE_CREATE.REQUEST ]: (state, action) => {
    return { ...state, isCreating: true };
  },
  [ constants.CA_TYPE_CREATE.SUCCESS ]: (state, action) => {
    const { complementaryActivityType, message } = action;
    const complementaryActivityTypes = state.complementaryActivityTypes
      ? [...state.complementaryActivityTypes, complementaryActivityType]
      : [complementaryActivityType];
    Message.success(message);
    return {
      ...state,
      complementaryActivityTypes,
      isCreating: false
    };
  },
  [ constants.CA_TYPE_CREATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isCreating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { body } = action;

    const { complementaryActivityType, message } = yield call(api, body);
    yield put({
      type: constants.CA_TYPE_CREATE.SUCCESS,
      complementaryActivityType,
      message
    });
  } catch (e) {
    yield put({
      type: constants.CA_TYPE_CREATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CA_TYPE_CREATE.REQUEST, saga);
}

//Api
async function api (body) {
  //Return the result of the request here
  return request('complementary-activity-types/', {
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
