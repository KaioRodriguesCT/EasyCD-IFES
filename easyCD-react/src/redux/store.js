import { createStore , applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from '@redux-saga/core';

//Reducers
import reducers from '@redux/modules';

//Sagas
import rootSaga from '@redux/sagas';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  combineReducers(reducers),
  applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(rootSaga);

export default store;