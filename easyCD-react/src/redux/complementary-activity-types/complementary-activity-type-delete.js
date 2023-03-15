//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

//LOdash
import filter from 'lodash/filter';
import isEqual from 'lodash/isEqual';

import request from '@shared/request';

//Constants
export const constants = {
  CA_TYPE_DELETE: createSagaAction('CA_TYPE_DELETE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  deleteCaType: (caTypeId) => ({
    type: constants.CA_TYPE_DELETE.REQUEST, //Always request, to keep the cycle,
    caTypeId
  })
};

//Handlers
export const handlers = {
  [ constants.CA_TYPE_DELETE.REQUEST ]: (state, action) => {
    return { ...state, isDeleting: true };
  },
  [ constants.CA_TYPE_DELETE.SUCCESS ]: (state, action) => {
    const { caTypeId, message } = action;
    const complementaryActivityTypes = filter(
      state.complementaryActivityTypes,
      ({ _id }) => !isEqual(_id, caTypeId)
    );
    Message.success(message);
    return { ...state, complementaryActivityTypes, isDeleting: false };
  },
  [ constants.CA_TYPE_DELETE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isDeleting: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { caTypeId } = action;

    const { message } = yield call(api, { caTypeId });
    yield put({
      type: constants.CA_TYPE_DELETE.SUCCESS,
      caTypeId,
      message
    });
  } catch (e) {
    yield put({
      type: constants.CA_TYPE_DELETE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CA_TYPE_DELETE.REQUEST, saga);
}

//Api
async function api ({ caTypeId }) {
  //Return the result of the request here
  return request(`complementary-activity-types/${ caTypeId }`, {
    method: 'DELETE'
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
