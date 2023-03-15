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
  CA_TYPE_UPDATE: createSagaAction('CA_TYPE_UPDATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  updateCaType: (caType) => ({
    type: constants.CA_TYPE_UPDATE.REQUEST, //Always request, to keep the cycle,
    caType
  })
};

//Handlers
export const handlers = {
  [ constants.CA_TYPE_UPDATE.REQUEST ]: (state, action) => {
    return { ...state, isUpdating: true };
  },
  [ constants.CA_TYPE_UPDATE.SUCCESS ]: (state, action) => {
    const { complementaryActivityType, message } = action;
    const complementaryActivityTypes = filter(
      state.complementaryActivityTypes,
      ({ _id }) => !isEqual(_id, get(complementaryActivityType, '_id'))
    );
    Message.success(message);
    return {
      ...state,
      complementaryActivityTypes: [...complementaryActivityTypes, complementaryActivityType],
      isUpdating: false
    };
  },
  [ constants.CA_TYPE_UPDATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isUpdating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { caType } = action;

    const { complementaryActivityType, message } = yield call(api, {
      complementaryActivityType: caType
    });
    yield put({
      type: constants.CA_TYPE_UPDATE.SUCCESS,
      complementaryActivityType,
      message
    });
  } catch (e) {
    yield put({
      type: constants.CA_TYPE_UPDATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CA_TYPE_UPDATE.REQUEST, saga);
}

//Api
async function api ({ complementaryActivityType }) {
  //Return the result of the request here
  return request(`complementary-activity-types/${ get(complementaryActivityType, '_id') }`, {
    method: 'PUT',
    body: { complementaryActivityType }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
