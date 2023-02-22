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
  CURRICULUM_GRIDE_UPDATE: createSagaAction('CURRICULUM_GRIDE_UPDATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  updateCurriculumGride: (curriculumGride) => ({
    type: constants.CURRICULUM_GRIDE_UPDATE.REQUEST, //Always request, to keep the cycle,
    curriculumGride
  })
};

//Handlers
export const handlers = {
  [ constants.CURRICULUM_GRIDE_UPDATE.REQUEST ]: (state, action) => {
    return { ...state, isUpdating: true };
  },
  [ constants.CURRICULUM_GRIDE_UPDATE.SUCCESS ]: (state, action) => {
    const { curriculumGride, message } = action;
    const curriculumGrides = filter(
      state.curriculumGrides,
      ({ _id }) => !isEqual(_id, get(curriculumGride, '_id'))
    );
    Message.success(message);
    return {
      ...state,
      curriculumGrides: [...curriculumGrides, curriculumGride],
      isUpdating: false
    };
  },
  [ constants.CURRICULUM_GRIDE_UPDATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isUpdating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { curriculumGride } = action;

    const { curriculumGride: newCurriculumGride, message } = yield call(api, { curriculumGride });
    yield put({
      type: constants.CURRICULUM_GRIDE_UPDATE.SUCCESS,
      curriculumGride: newCurriculumGride,
      message
    });
  } catch (e) {
    yield put({
      type: constants.CURRICULUM_GRIDE_UPDATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CURRICULUM_GRIDE_UPDATE.REQUEST, saga);
}

//Api
async function api ({ curriculumGride }) {
  //Return the result of the request here
  return request(`curriculum-grides/${ get(curriculumGride, '_id') }`, {
    method: 'PUT',
    body: { curriculumGride }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
