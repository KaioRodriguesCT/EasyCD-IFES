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
  SUBJECT_UPDATE: createSagaAction('SUBJECT_UPDATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  updateSubject: (subject) => ({
    type: constants.SUBJECT_UPDATE.REQUEST, //Always request, to keep the cycle,
    subject
  })
};

//Handlers
export const handlers = {
  [ constants.SUBJECT_UPDATE.REQUEST ]: (state, action) => {
    return { ...state, isUpdating: true };
  },
  [ constants.SUBJECT_UPDATE.SUCCESS ]: (state, action) => {
    const { subject, message } = action;
    const subjects = filter(
      state.subjects,
      ({ _id }) => !isEqual(_id, get(subject, '_id'))
    );
    Message.success(message);
    return {
      ...state,
      subjects: [...subjects, subject],
      isUpdating: false
    };
  },
  [ constants.SUBJECT_UPDATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isUpdating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { subject } = action;

    const { subject: newSubject, message } = yield call(api, { subject });
    yield put({
      type: constants.SUBJECT_UPDATE.SUCCESS,
      subject: newSubject,
      message
    });
  } catch (e) {
    yield put({
      type: constants.SUBJECT_UPDATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SUBJECT_UPDATE.REQUEST, saga);
}

//Api
async function api ({ subject }) {
  //Return the result of the request here
  return request(`subjects/${ get(subject, '_id') }`, {
    method: 'PUT',
    body: { subject }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
