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
  ENROLLMENT_UPDATE: createSagaAction('ENROLLMENT_UPDATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  updateEnrollment: (enrollment) => ({
    type: constants.ENROLLMENT_UPDATE.REQUEST, //Always request, to keep the cycle,
    enrollment
  })
};

//Handlers
export const handlers = {
  [ constants.ENROLLMENT_UPDATE.REQUEST ]: (state, action) => {
    return { ...state, isUpdating: true };
  },
  [ constants.ENROLLMENT_UPDATE.SUCCESS ]: (state, action) => {
    const { enrollment, message } = action;
    const enrollments = filter(
      state.enrollments,
      ({ _id }) => !isEqual(_id, get(enrollment, '_id'))
    );
    Message.success(message);
    return {
      ...state,
      enrollments: [...enrollments, enrollment],
      isUpdating: false
    };
  },
  [ constants.ENROLLMENT_UPDATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isUpdating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { enrollment } = action;

    const { enrollment: newEnrollment, message } = yield call(api, { enrollment });
    yield put({
      type: constants.ENROLLMENT_UPDATE.SUCCESS,
      enrollment: newEnrollment,
      message
    });
  } catch (e) {
    yield put({
      type: constants.ENROLLMENT_UPDATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.ENROLLMENT_UPDATE.REQUEST, saga);
}

//Api
async function api ({ enrollment }) {
  //Return the result of the request here
  return request(`enrollments/${ get(enrollment, '_id') }`, {
    method: 'PUT',
    body: { enrollment }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
