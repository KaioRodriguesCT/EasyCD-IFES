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
  SUBJECT_DELETE: createSagaAction('SUBJECT_DELETE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  deleteSubject: (subjectId) => ({
    type: constants.SUBJECT_DELETE.REQUEST, //Always request, to keep the cycle,
    subjectId
  })
};

//Handlers
export const handlers = {
  [ constants.SUBJECT_DELETE.REQUEST ]: (state, action) => {
    return { ...state, isDeleting: true };
  },
  [ constants.SUBJECT_DELETE.SUCCESS ]: (state, action) => {
    const { subjectId, message } = action;
    const subjects = filter(
      state.subjects,
      ({ _id }) => !isEqual(_id, subjectId)
    );
    Message.success(message);
    return { ...state, subjects, isDeleting: false };
  },
  [ constants.SUBJECT_DELETE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isDeleting: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { subjectId } = action;

    const { message } = yield call(api, { subjectId });
    yield put({
      type: constants.SUBJECT_DELETE.SUCCESS,
      subjectId,
      message
    });
  } catch (e) {
    yield put({
      type: constants.SUBJECT_DELETE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.SUBJECT_DELETE.REQUEST, saga);
}

//Api
async function api ({ subjectId }) {
  //Return the result of the request here
  return request(`subjects/${ subjectId }`, {
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
