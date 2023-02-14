//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';


import request from '@shared/request';

//Constants
export const constants = {
  PEOPLE_LIST_SLIM_BY_ROLE: createSagaAction('PEOPLE_LIST_SLIM_BY_ROLE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listSlimPeopleByRole: ({ role }) => ({
    type: constants.PEOPLE_LIST_SLIM_BY_ROLE.REQUEST, //Always request, to keep the cycle,
    role
  })
};

//Handlers
export const handlers = {
  [ constants.PEOPLE_LIST_SLIM_BY_ROLE.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.PEOPLE_LIST_SLIM_BY_ROLE.SUCCESS ]: (state, action) => {
    const { peopleSlim } = action;
    return { ...state, peopleSlim, isLoading: false };

  },
  [ constants.PEOPLE_LIST_SLIM_BY_ROLE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, peopleSlim: [] };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { role } = action;
    const { peopleSlim } = yield call(api, { role });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.PEOPLE_LIST_SLIM_BY_ROLE.SUCCESS,
      peopleSlim
    });
  } catch (e) {
    yield put({
      type: constants.PEOPLE_LIST_SLIM_BY_ROLE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.PEOPLE_LIST_SLIM_BY_ROLE.REQUEST, saga);
}

//Api
async function api ({ role }) {
  //Return the result of the request here
  return request('people/slim-by-role', {
    method: 'GET',
    query: { role }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
