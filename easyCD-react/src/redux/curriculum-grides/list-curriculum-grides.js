//React
import { createSagaAction } from '@src/shared/sagas';
import { call, put, takeLatest } from 'redux-saga/effects';

//Antd
import { message as Message } from 'antd';

import request from '@shared/request';

//Constants
export const constants = {
  CURRICULUM_GRIDE_LIST: createSagaAction('CURRICULUM_GRIDE_LIST') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  listCurriculumGrides: ({ filters } = {}) => ({
    type: constants.CURRICULUM_GRIDE_LIST.REQUEST, //Always request, to keep the cycle,
    filters
  })
};

//Handlers
export const handlers = {
  [ constants.CURRICULUM_GRIDE_LIST.REQUEST ]: (state, action) => {
    return { ...state, isLoading: true };
  },
  [ constants.CURRICULUM_GRIDE_LIST.SUCCESS ]: (state, action) => {
    const { curriculumGrides } = action;
    return { ...state, curriculumGrides, isLoading: false };
  },
  [ constants.CURRICULUM_GRIDE_LIST.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isLoading: false, curriculumGrides: [] };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { filters } = action;

    const { curriculumGrides } = yield call(api, { filters });
    // eslint-disable-next-line no-console
    yield put({
      type: constants.CURRICULUM_GRIDE_LIST.SUCCESS,
      curriculumGrides
    });
  } catch (e) {
    yield put({
      type: constants.CURRICULUM_GRIDE_LIST.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CURRICULUM_GRIDE_LIST.REQUEST, saga);
}

//Api
async function api ({ filters }) {
  //Return the result of the request here
  return request('curriculum-grides/', {
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
