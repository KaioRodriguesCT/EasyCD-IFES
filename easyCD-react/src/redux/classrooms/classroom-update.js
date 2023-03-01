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
  CLASSROOM_UPDATE: createSagaAction('CLASSROOM_UPDATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  updateClassroom: (classroom) => ({
    type: constants.CLASSROOM_UPDATE.REQUEST, //Always request, to keep the cycle,
    classroom
  })
};

//Handlers
export const handlers = {
  [ constants.CLASSROOM_UPDATE.REQUEST ]: (state, action) => {
    return { ...state, isUpdating: true };
  },
  [ constants.CLASSROOM_UPDATE.SUCCESS ]: (state, action) => {
    const { classroom, message } = action;
    const classrooms = filter(state.classrooms, ({ _id }) => !isEqual(_id, get(classroom, '_id')));
    Message.success(message);
    return { ...state, classrooms: [...classrooms, classroom], isUpdating: false };
  },
  [ constants.CLASSROOM_UPDATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isUpdating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { classroom } = action;

    const { classroom: newClassroom, message } = yield call(api, { classroom });
    yield put({
      type: constants.CLASSROOM_UPDATE.SUCCESS,
      classroom: newClassroom,
      message
    });
  } catch (e) {
    yield put({
      type: constants.CLASSROOM_UPDATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CLASSROOM_UPDATE.REQUEST, saga);
}

//Api
async function api ({ classroom }) {
  //Return the result of the request here
  return request(`classrooms/${ get(classroom, '_id') }`, {
    method: 'PUT',
    body: { classroom }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
