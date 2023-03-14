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
  SOLICITATION_UPDATE: createSagaAction('SOLICITATION_UPDATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  updateSolicitation: (solicitation) => ({
    type: constants.SOLICITATION_UPDATE.REQUEST, //Always request, to keep the cycle,
    solicitation
  })
};

//Handlers
export const handlers = {
  [ constants.SOLICITATION_UPDATE.REQUEST ]: (state, action) => {
    return { ...state, isUpdating: true };
  },
  [ constants.SOLICITATION_UPDATE.SUCCESS ]: (state, action) => {
    const { solicitation, message } = action;
    const solicitations = filter(
      state.solicitations,
      ({ _id }) => !isEqual(_id, get(solicitation, '_id'))
    );
    Message.success(message);
    return {
      ...state,
      solicitations: [...solicitations, solicitation],
      isUpdating: false
    };
  },
  [ constants.SOLICITATION_UPDATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isUpdating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { solicitation } = action;

    const { solicitation: newSolicitation, message } = yield call(api, { solicitation });
    yield put({
      type: constants.SOLICITATION_UPDATE.SUCCESS,
      solicitation: newSolicitation,
      message
    });
  } catch (e) {
    yield put({
      type: constants.SOLICITATION_UPDATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SOLICITATION_UPDATE.REQUEST, saga);
}

//Api
async function api ({ solicitation }) {
  //Return the result of the request here
  return request(`solicitations/${ get(solicitation, '_id') }`, {
    method: 'PUT',
    body: { solicitation }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
