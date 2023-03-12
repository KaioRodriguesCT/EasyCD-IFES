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
  SOLICITATION_TYPE_DELETE: createSagaAction('SOLICITATION_TYPE_DELETE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  deleteSolicitationType: (solicitationTypeId) => ({
    type: constants.SOLICITATION_TYPE_DELETE.REQUEST, //Always request, to keep the cycle,
    solicitationTypeId
  })
};

//Handlers
export const handlers = {
  [ constants.SOLICITATION_TYPE_DELETE.REQUEST ]: (state, action) => {
    return { ...state, isDeleting: true };
  },
  [ constants.SOLICITATION_TYPE_DELETE.SUCCESS ]: (state, action) => {
    const { solicitationTypeId, message } = action;
    const solicitationTypes = filter(
      state.solicitationTypes,
      ({ _id }) => !isEqual(_id, solicitationTypeId)
    );
    Message.success(message);
    return { ...state, solicitationTypes, isDeleting: false };
  },
  [ constants.SOLICITATION_TYPE_DELETE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isDeleting: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { solicitationTypeId } = action;

    const { message } = yield call(api, { solicitationTypeId });
    yield put({
      type: constants.SOLICITATION_TYPE_DELETE.SUCCESS,
      solicitationTypeId,
      message
    });
  } catch (e) {
    yield put({
      type: constants.SOLICITATION_TYPE_DELETE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SOLICITATION_TYPE_DELETE.REQUEST, saga);
}

//Api
async function api ({ solicitationTypeId }) {
  //Return the result of the request here
  return request(`solicitation-types/${ solicitationTypeId }`, {
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
