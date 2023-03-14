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
  PERSON_UPDATE: createSagaAction('PERSON_UPDATE') // it wil create a objejct with 3 props, REQUEST, SUCCES, AND FAILURE
};

//Actions
export const actions = {
  updatePerson: (person) => ({
    type: constants.PERSON_UPDATE.REQUEST, //Always request, to keep the cycle,
    person
  })
};

//Handlers
export const handlers = {
  [ constants.PERSON_UPDATE.REQUEST ]: (state, action) => {
    return { ...state, isUpdating: true };
  },
  [ constants.PERSON_UPDATE.SUCCESS ]: (state, action) => {
    const { person, message } = action;
    const people = filter(
      state.people,
      ({ _id }) => !isEqual(_id, get(person, '_id'))
    );
    Message.success(message);
    return {
      ...state,
      people: [...people, person],
      isUpdating: false
    };
  },
  [ constants.PERSON_UPDATE.FAILURE ]: (state, action) => {
    const { message } = action;
    Message.error(message);
    return { ...state, isUpdating: false };
  }
};

//Sagas
export function* saga (action) {
  try {
    const { person } = action;

    const { person: newPerson, message } = yield call(api, { person });
    yield put({
      type: constants.PERSON_UPDATE.SUCCESS,
      person: newPerson,
      message
    });
  } catch (e) {
    yield put({
      type: constants.PERSON_UPDATE.FAILURE,
      message: e.message || e
    });
  }
}

//Watchers
export function* watcher () {
  yield takeLatest(constants.PERSON_UPDATE.REQUEST, saga);
}

//Api
async function api ({ person }) {
  //Return the result of the request here
  return request(`people/${ get(person, '_id') }`, {
    method: 'PUT',
    body: { person }
  });
}

//Exporting all consts and functions
export default {
  actions,
  constants,
  handlers,
  watcher
};
