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
  CURRICULUM_GRIDE_DELETE: createSagaAction('CURRICULUM_GRIDE_DELETE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  deleteCurriculumGride: (curriculumGrideId) => ({
    type: constants.CURRICULUM_GRIDE_DELETE.REQUEST, //Always request, to keep the cycle,
    curriculumGrideId
  })
};

//Handlers
export const handlers = {
  [ constants.CURRICULUM_GRIDE_DELETE.REQUEST ]: (state, action) => {
    return { ...state, isDeleting: true };
  },
  [ constants.CURRICULUM_GRIDE_DELETE.SUCCESS ]: (state, action) => {
    const { curriculumGrideId, message } = action;
    const curriculumGrides = filter(
      state.curriculumGrides,
      ({ _id }) => !isEqual(_id, curriculumGrideId)
    );
    Message.success(message);
    return { ...state, curriculumGrides, isDeleting: false };
  },
  [ constants.CURRICULUM_GRIDE_DELETE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isDeleting: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { curriculumGrideId } = action;

    const { message } = yield call(api, { curriculumGrideId });
    yield put({
      type: constants.CURRICULUM_GRIDE_DELETE.SUCCESS,
      curriculumGrideId,
      message
    });
  } catch (e) {
    yield put({
      type: constants.CURRICULUM_GRIDE_DELETE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.CURRICULUM_GRIDE_DELETE.REQUEST, saga);
}

//Api
async function api ({ curriculumGrideId }) {
  //Return the result of the request here
  return request(`curriculum-grides/${ curriculumGrideId }`, {
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
