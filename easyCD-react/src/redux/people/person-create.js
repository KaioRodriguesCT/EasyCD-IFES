//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  PEOPLE_CREATE: createSagaAction('PEOPLE_CREATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  createPerson: (body) => ({
    type: constants.PEOPLE_CREATE.REQUEST, //Always request, to keep the cycle,
    body
  })
};

//Handlers
export const handlers = {
  [ constants.PEOPLE_CREATE.REQUEST ]: (state, action) => {
    return { ...state, isCreating: true };
  },
  [ constants.PEOPLE_CREATE.SUCCESS ]: (state, action) => {
    const { person, message } = action;
    const people = state.people ? [...state.people, person] : [person];
    Message.success(message);
    return {
      ...state,
      people,
      isCreating: false
    };
  },
  [ constants.PEOPLE_CREATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isCreating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { body } = action;

    const {
      user: { person },
      message
    } = yield call(api, body);
    yield put({
      type: constants.PEOPLE_CREATE.SUCCESS,
      person,
      message
    });
  } catch (e) {
    yield put({
      type: constants.PEOPLE_CREATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.PEOPLE_CREATE.REQUEST, saga);
}

//Api
async function api (body) {
  //Return the result of the request here
  return await request('users/', {
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
