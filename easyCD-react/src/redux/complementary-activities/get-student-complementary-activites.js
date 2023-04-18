//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  GET_STUDENT_CACTIVITIES: createSagaAction('GET_STUDENT_CACTIVITIES') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  getStudentCActivities: ({ filters } = {}) => ({
    type: constants.GET_STUDENT_CACTIVITIES.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.GET_STUDENT_CACTIVITIES.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.GET_STUDENT_CACTIVITIES.SUCCESS ]: (state, action) => {
    const { complementaryActivities } = action;
    return { ...state, studentCActivities: complementaryActivities, isLoading: false };
  },
  [ constants.GET_STUDENT_CACTIVITIES.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, complementaryActivities: [] };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { filters } = action;

    const { complementaryActivities } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.GET_STUDENT_CACTIVITIES.SUCCESS,
      complementaryActivities
    });
  } catch (e) {
    yield put({
      type: constants.GET_STUDENT_CACTIVITIES.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.GET_STUDENT_CACTIVITIES.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('complementary-activities/student-activities', {
    method: 'GET',
    query: { filters }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
