//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  CA_LIST: createSagaAction('CA_LIST') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listComplementaryActivities: ({ filters } = {}) => ({
    type: constants.CA_LIST.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.CA_LIST.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.CA_LIST.SUCCESS ]: (state, action) => {
    const { complementaryActivities } = action;
    return { ...state, complementaryActivities, isLoading: false };
  },
  [ constants.CA_LIST.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, complementaryActivities: [] };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { filters } = action;

    const { complementaryActivities } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.CA_LIST.SUCCESS,
      complementaryActivities
    });
  } catch (e) {
    yield put({
      type: constants.CA_LIST.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CA_LIST.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('complementary-activities/', {
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
