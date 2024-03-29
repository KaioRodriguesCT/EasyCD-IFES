import { all, fork } from 'redux-saga/effects';

import reduce from 'lodash/reduce';
import merge from 'lodash/merge';
import map from 'lodash/map';
import filter from 'lodash/filter';
import isNil from 'lodash/isNil';

import { createReducer } from '@shared/reducers';

import SolicitationCreate from './solicitation-create';
import SolicitationUpdate from './solicitation-update';
import SolicitationDelete from './solicitation-delete';
import ListSolicitations from './list-solicitations';
import GetStudentSolicitations from './get-student-solicitations';
import GetTeacherSolicitations from './get-teacher-solicitations ';

//Modules
const modules = [
  ListSolicitations,
  SolicitationCreate,
  SolicitationDelete,
  SolicitationUpdate,
  GetStudentSolicitations,
  GetTeacherSolicitations
];

//Initial State
export const initialState = {
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  solicitations: null,
  studentSolicitations: null,
  teacherSolicitations: null
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
