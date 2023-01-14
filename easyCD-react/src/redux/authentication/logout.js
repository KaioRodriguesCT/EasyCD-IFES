//Shared
import { createSagaAction } from '@shared/sagas';
//Redux
import { put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

//Constants
export const constants = {
  USER_LOGOUT: createSagaAction('USER_LOGOUT') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  userLogout: () => ({
    type: constants.USER_LOGOUT.REQUEST
  })
};

//Handlers
export const handlers = {
  [ constants.USER_LOGOUT.REQUEST ]: (state, action) => {
    return { ...state };
  },
  [ constants.USER_LOGOUT.SUCCESS ]: (state, action) => {
    Message.success('User logout successfully');
    return { ...state, user: null };
  },
  [ constants.USER_LOGOUT.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state };
  }
};

//Sagas
export function* saga (action) {
  try {
    yield put({
      type: constants.USER_LOGOUT.SUCCESS
    });
  } catch (e) {
    yield put({
      type: constants.USER_LOGOUT.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.USER_LOGOUT.REQUEST, saga);
}


//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
