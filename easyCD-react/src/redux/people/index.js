import { all, fork } from 'redux-saga/effects';

import reduce from 'lodash/reduce';
import merge from 'lodash/merge';
import map from 'lodash/map';
import filter from 'lodash/filter';
import isNil from 'lodash/isNil';

import { createReducer } from '@shared/reducers';

import ListPeople from './list-people';
import ListSlimPeople from './list-slim-people';
import ListSlimPeopleByRole from './list-slim-people-by-role';
import PersonCreate from './person-create';
import PersonUpdate from './person-update';
import GetTeachers from './get-teachers';
import GetStudents from './get-students';

//Modules
const modules = [
  ListPeople,
  ListSlimPeople,
  ListSlimPeopleByRole,
  PersonCreate,
  PersonUpdate,
  GetTeachers,
  GetStudents
];

//Initial State
export const initialState = {
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  people: null,
  peopleSlim: null
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
