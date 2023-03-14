//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

//LOdash
import filter from 'lodash/filter';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';

import request from '@shared/request';

//Constants
export const constants = {
  SOLICITATION_TYPE_UPDATE: createSagaAction('SOLICITATION_TYPE_UPDATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  updateSolicitationType: (solicitationType) => ({
    type: constants.SOLICITATION_TYPE_UPDATE.REQUEST, //Always request, to keep the cycle,
    solicitationType
  })
};

//Handlers
export const handlers = {
  [ constants.SOLICITATION_TYPE_UPDATE.REQUEST ]: (state, action) => {
    return { ...state, isUpdating: true };
  },
  [ constants.SOLICITATION_TYPE_UPDATE.SUCCESS ]: (state, action) => {
    const { solicitationType, message } = action;
    const solicitationTypes = filter(
      state.solicitationTypes,
      ({ _id }) => !isEqual(_id, get(solicitationType, '_id'))
    );
    Message.success(message);
    return {
      ...state,
      solicitationTypes: [...solicitationTypes, solicitationType],
      isUpdating: false
    };
  },
  [ constants.SOLICITATION_TYPE_UPDATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isUpdating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { solicitationType } = action;

    const { solicitationType: newSolicitationType, message } = yield call(api, {
      solicitationType
    });
    yield put({
      type: constants.SOLICITATION_TYPE_UPDATE.SUCCESS,
      solicitationType: newSolicitationType,
      message
    });
  } catch (e) {
    yield put({
      type: constants.SOLICITATION_TYPE_UPDATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SOLICITATION_TYPE_UPDATE.REQUEST, saga);
}

//Api
async function api ({ solicitationType }) {
  //Return the result of the request here
  return request(`solicitation-types/${ get(solicitationType, '_id') }`, {
    method: 'PUT',
    body: { solicitationType }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
