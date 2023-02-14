//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  PEOPLE_LIST: createSagaAction('PEOPLE_LIST') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listPeople: ({ filters }) => ({
    type: constants.PEOPLE_LIST.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.PEOPLE_LIST.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.PEOPLE_LIST.SUCCESS ]: (state, action) => {
    const { people } = action;
    return { ...state, people, isLoading: false };

  },
  [ constants.PEOPLE_LIST.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { filters } = action;

    const { people } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.PEOPLE_LIST.SUCCESS,
      people
    });
  } catch (e) {
    yield put({
      type: constants.PEOPLE_LIST.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.PEOPLE_LIST.REQUEST, saga);
}

//Api
async function api () {
  //Return the result of the request here
  return request('people/', {
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
