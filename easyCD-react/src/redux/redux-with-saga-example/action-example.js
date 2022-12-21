import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

import request from '@shared/request';

//Constants
export const constants = {
  ACTION_EXAMPLE: createSagaAction('ACTION_EXAMPLE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  actionExample: (params) => ({
    type: constants.ACTION_EXAMPLE.REQUEST, //Always request, to keep the cycle,
    params
  })
};

//Handlers
export const handlers = {
  [ constants.ACTION_EXAMPLE.FAILURE ]: (state, action) => {},
  [ constants.ACTION_EXAMPLE.SUCCESS ]: (state, action) => {},
  [ constants.ACTION_EXAMPLE.REQUEST ]: (state, action) => {}
};

//Sagas
export function* sagaExample (action) {
  try {
    //Get the data from the action
    //Do a yield call into the api function
    const { message } = yield call(apiExample);
    // eslint-disable-next-line no-console
    console.log(message);
    yield put({
      type: constants.ACTION_EXAMPLE.SUCCESS
    });
  } catch (e) {
    yield put({
      type: constants.ACTION_EXAMPLE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watchSagaExample () {
  yield takeLatest(constants.ACTION_EXAMPLE.REQUEST, sagaExample);
}

//Api
async function apiExample () {
  //Return the result of the request here
  return request('hello-world/', {
    method: 'GET'
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher: watchSagaExample
};
