import { all, fork } from 'redux-saga/effects';

import reduce from 'lodash/reduce';
import merge from 'lodash/merge';
import map from 'lodash/map';
import filter from 'lodash/filter';
import isNil from 'lodash/isNil';

import { createReducer } from '@shared/reducers';

import ClassroomCreate from './classroom-create';
import ClassroomDelete from './classroom-delete';
import ClassroomUpdate from './classroom-update';
import ListClassrooms from './list-classrooms';
import GetTeacherClassrooms from './get-teacher-classrooms';

//Modules
const modules = [
  ClassroomCreate,
  ClassroomDelete,
  ClassroomUpdate,
  ListClassrooms,
  GetTeacherClassrooms
];

//Initial State
export const initialState = {
  isCreating: false,
  isDeleting: false,
  isUpdating: false,
  lastClassroomCreated: null,

  isLoading: false,
  classrooms: null
};

//Handlers
const ACTION_HANDLERS = reduce(map(modules, 'handlers'), merge, {});

//Reducers
export const reducer = createReducer(initialState, (state, action) => {
  const handler = ACTION_HANDLERS[ action.type ];
  return handler ? handler(state, action) : { ...state };
});

//Actions
export const actions = reduce(map(modules, 'actions'), merge, {});

// Constants
export const constants = reduce(map(modules, 'constants'), merge, {});

// Root saga
// Export the root saga by forking all available sagas
export function* rootSaga () {
  const sagas = map(
    filter(modules, (mod) => !isNil(mod.watcher)),
    'watcher'
  );
  yield all(sagas.map(fork));
}
