//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

//lodash
import get from 'lodash/get';

import request from '@shared/request';


import { constants as authConstants } from '@redux/authentication';
//Constants
export const constants = {
  USER_AND_PERSON_UPDATE: createSagaAction('USER_AND_PERSON_UPDATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  updateUserAndPerson: (userWithPerson) => ({
    type: constants.USER_AND_PERSON_UPDATE.REQUEST, //Always request, to keep the cycle,
    userWithPerson
  })
};

//Handlers
export const handlers = {
  [ constants.USER_AND_PERSON_UPDATE.REQUEST ]: (state, action) => {
    return { ...state, isUpdating: true };
  },
  [ constants.USER_AND_PERSON_UPDATE.SUCCESS ]: (state, action) => {
    const { message } = action;
    Message.success(message);
    return {
      ...state,
      isUpdating: false
    };
  },
  [ constants.USER_AND_PERSON_UPDATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isUpdating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { userWithPerson } = action;

    const { user, message } = yield call(api, userWithPerson);
    yield put({
      type: constants.USER_AND_PERSON_UPDATE.SUCCESS,
      user,
      message
    });

    yield put({
      type: authConstants.USER_RE_AUTH.SUCCESS,
      user
    });
  } catch (e) {
    yield put({
      type: constants.USER_AND_PERSON_UPDATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.USER_AND_PERSON_UPDATE.REQUEST, saga);
}

//Api
async function api (user) {
  //Return the result of the request here
  return request(`users/${ get(user, '_id') }`, {
    method: 'PUT',
    body: { user }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
