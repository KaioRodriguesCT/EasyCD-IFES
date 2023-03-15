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
  CA_DELETE: createSagaAction('CA_DELETE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  deleteComplementaryActivity: (complementaryActivityId) => ({
    type: constants.CA_DELETE.REQUEST, //Always request, to keep the cycle,
    complementaryActivityId
  })
};

//Handlers
export const handlers = {
  [ constants.CA_DELETE.REQUEST ]: (state, action) => {
    return { ...state, isDeleting: true };
  },
  [ constants.CA_DELETE.SUCCESS ]: (state, action) => {
    const { complementaryActivityId, message } = action;
    const complementaryActivities = filter(
      state.complementaryActivities,
      ({ _id }) => !isEqual(_id, complementaryActivityId)
    );
    Message.success(message);
    return { ...state, complementaryActivities, isDeleting: false };
  },
  [ constants.CA_DELETE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isDeleting: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { complementaryActivityId } = action;

    const { message } = yield call(api, { complementaryActivityId });
    yield put({
      type: constants.CA_DELETE.SUCCESS,
      complementaryActivityId,
      message
    });
  } catch (e) {
    yield put({
      type: constants.CA_DELETE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CA_DELETE.REQUEST, saga);
}

//Api
async function api ({ complementaryActivityId }) {
  //Return the result of the request here
  return request(`complementary-activities/${ complementaryActivityId }`, {
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
