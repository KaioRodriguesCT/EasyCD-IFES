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
  ENROLLMENT_DELETE: createSagaAction('ENROLLMENT_DELETE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  deleteEnrollment: (enrollmentId) => ({
    type: constants.ENROLLMENT_DELETE.REQUEST, //Always request, to keep the cycle,
    enrollmentId
  })
};

//Handlers
export const handlers = {
  [ constants.ENROLLMENT_DELETE.REQUEST ]: (state, action) => {
    return { ...state, isDeleting: true };
  },
  [ constants.ENROLLMENT_DELETE.SUCCESS ]: (state, action) => {
    const { enrollmentId, message } = action;
    const enrollments = filter(
      state.enrollments,
      ({ _id }) => !isEqual(_id, enrollmentId)
    );
    Message.success(message);
    return { ...state, enrollments, isDeleting: false };
  },
  [ constants.ENROLLMENT_DELETE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isDeleting: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { enrollmentId } = action;

    const { message } = yield call(api, { enrollmentId });
    yield put({
      type: constants.ENROLLMENT_DELETE.SUCCESS,
      enrollmentId,
      message
    });
  } catch (e) {
    yield put({
      type: constants.ENROLLMENT_DELETE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.ENROLLMENT_DELETE.REQUEST, saga);
}

//Api
async function api ({ enrollmentId }) {
  //Return the result of the request here
  return request(`enrollments/${ enrollmentId }`, {
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
