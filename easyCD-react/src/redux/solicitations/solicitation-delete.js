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
  SOLICITATION_DELETE: createSagaAction('SOLICITATION_DELETE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  deleteSolicitation: (solicitationId) => ({
    type: constants.SOLICITATION_DELETE.REQUEST, //Always request, to keep the cycle,
    solicitationId
  })
};

//Handlers
export const handlers = {
  [ constants.SOLICITATION_DELETE.REQUEST ]: (state, action) => {
    return { ...state, isDeleting: true };
  },
  [ constants.SOLICITATION_DELETE.SUCCESS ]: (state, action) => {
    const { solicitationId, message } = action;
    const solicitations = filter(
      state.solicitations,
      ({ _id }) => !isEqual(_id, solicitationId)
    );
    Message.success(message);
    return { ...state, solicitations, isDeleting: false };
  },
  [ constants.SOLICITATION_DELETE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isDeleting: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { solicitationId } = action;

    const { message } = yield call(api, { solicitationId });
    yield put({
      type: constants.SOLICITATION_DELETE.SUCCESS,
      solicitationId,
      message
    });
  } catch (e) {
    yield put({
      type: constants.SOLICITATION_DELETE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SOLICITATION_DELETE.REQUEST, saga);
}

//Api
async function api ({ solicitationId }) {
  //Return the result of the request here
  return request(`solicitations/${ solicitationId }`, {
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
