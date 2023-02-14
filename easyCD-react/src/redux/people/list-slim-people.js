//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  PEOPLE_LIST_SLIM: createSagaAction('PEOPLE_LIST_SLIM') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listSlimPeople: ({ filters }) => ({
    type: constants.PEOPLE_LIST_SLIM.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.PEOPLE_LIST_SLIM.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.PEOPLE_LIST_SLIM.SUCCESS ]: (state, action) => {
    const { peopleSlim } = action;
    return { ...state, peopleSlim, isLoading: false };

  },
  [ constants.PEOPLE_LIST_SLIM.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, peopleSlim: [] };
  }
};

//Sagas
export function* saga (action) {
  try {

    const { filters } = action;
    const { peopleSlim } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.PEOPLE_LIST_SLIM.SUCCESS,
      peopleSlim
    });
  } catch (e) {
    yield put({
      type: constants.PEOPLE_LIST_SLIM.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.PEOPLE_LIST_SLIM.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('people/slim/', {
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
