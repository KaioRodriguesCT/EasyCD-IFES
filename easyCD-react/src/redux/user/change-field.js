//Shared
import { createSagaAction } from '@shared/sagas';

//Lodash
import clone from 'lodash/clone';

//Redux
import {  put, takeLatest } from 'redux-saga/effects';

//Constants
export const constants = {
  CHANGE_FIELD: createSagaAction('CHANGE_FIELD') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  changeField: (field, value) => ({
    type: constants.CHANGE_FIELD.REQUEST, //Always request, to keep the cycle,
    field,
    value
  })
};

//Handlers
export const handlers = {
  [ constants.CHANGE_FIELD.REQUEST ]: (state, action) => {
    return { ...state };
  },
  [ constants.CHANGE_FIELD.SUCCESS ]: (state, action) => {
    const { field, value } = action;
    const newState = clone(state);
    newState[ field ] = value;
    return newState;
  },
  [ constants.CHANGE_FIELD.FAILURE ]: (state, action) => {
    return { ...state };
  }
};

//Sagas
export function* sagaChangeField (action) {
  try {
    //Get the data from the action
    //Password already encrypted here
    const { field, value } = action;
    //Do a yield call into the api function

    yield put({
      type: constants.CHANGE_FIELD.SUCCESS,
      field,
      value
    });
  } catch (e) {
    yield put({
      type: constants.CHANGE_FIELD.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watchSagaChangeField () {
  yield takeLatest(constants.CHANGE_FIELD.REQUEST, sagaChangeField);
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher: watchSagaChangeField
};
