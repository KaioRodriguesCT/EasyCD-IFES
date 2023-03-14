//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  SOLICITATIONS_LIST: createSagaAction('SOLICITATIONS_LIST') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listSolicitations: ({ filters } = {}) => ({
    type: constants.SOLICITATIONS_LIST.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.SOLICITATIONS_LIST.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.SOLICITATIONS_LIST.SUCCESS ]: (state, action) => {
    const { solicitations } = action;
    return { ...state, solicitations, isLoading: false };

  },
  [ constants.SOLICITATIONS_LIST.FAILURE ]: (state, action) => {
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
      type: constants.SOLICITATIONS_LIST.SUCCESS,
      solicitations
    });
  } catch (e) {
    yield put({
      type: constants.SOLICITATIONS_LIST.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SOLICITATIONS_LIST.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('solicitations/', {
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
