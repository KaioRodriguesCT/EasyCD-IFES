//Shared
import { createSagaAction } from '@shared/sagas';
import request from '@shared/request';

//Redux
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

//Constants
export const constants = {
  USER_RE_AUTH: createSagaAction('USER_RE_AUTH') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  userReAuth: ({ refreshToken }) => ({
    type: constants.USER_RE_AUTH.REQUEST, //Always request, to keep the cycle,
    refreshToken
  })
};

//Handlers
export const handlers = {
  [ constants.USER_RE_AUTH.REQUEST ]: (state, action) => {
    return { ...state, isReAuthenticating: true };
  },
  [ constants.USER_RE_AUTH.SUCCESS ]: (state, action) => {
    const { user, message } = action;
    Message.success(message);
    return { ...state, isReAuthenticating: false, user };
  },
  [ constants.USER_RE_AUTH.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isReAuthenticating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    //Get the data from the action
    //Password already encrypted here
    const { refreshToken } = action;
    //Do a yield call into the api function
    const { user, message } = yield call(api, refreshToken);
    yield put({
      type: constants.USER_RE_AUTH.SUCCESS,
      user,
      message
    });
  } catch (e) {
    yield put({
      type: constants.USER_RE_AUTH.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watch () {
  yield takeLatest(constants.USER_RE_AUTH.REQUEST, saga);
}

//Api
async function api (refreshToken) {
  //Return the result of the request here
  return request('users/re-auth', {
    method: 'POST',
    body: { refreshToken }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher: watch
};
