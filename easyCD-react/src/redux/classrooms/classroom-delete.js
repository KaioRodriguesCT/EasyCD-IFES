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
  CLASSROOM_DELETE: createSagaAction('CLASSROOM_DELETE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  deleteClassroom: (classroomId) => ({
    type: constants.CLASSROOM_DELETE.REQUEST, //Always request, to keep the cycle,
    classroomId
  })
};

//Handlers
export const handlers = {
  [ constants.CLASSROOM_DELETE.REQUEST ]: (state, action) => {
    return { ...state, isDeleting: true };
  },
  [ constants.CLASSROOM_DELETE.SUCCESS ]: (state, action) => {
    const { classroomId, message } = action;
    const classrooms = filter(
      state.classrooms,
      ({ _id }) => !isEqual(_id, classroomId)
    );
    Message.success(message);
    return { ...state, classrooms, isDeleting: false };
  },
  [ constants.CLASSROOM_DELETE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isDeleting: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { classroomId } = action;

    const { message } = yield call(api, { classroomId });
    yield put({
      type: constants.CLASSROOM_DELETE.SUCCESS,
      classroomId,
      message
    });
  } catch (e) {
    yield put({
      type: constants.CLASSROOM_DELETE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CLASSROOM_DELETE.REQUEST, saga);
}

//Api
async function api ({ classroomId }) {
  //Return the result of the request here
  return request(`classrooms/${ classroomId }`, {
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
