//Redux
import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from '@redux-saga/core';

//Redux persist
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Reducers
import reducers from '@redux/modules';

// Sagas
import rootSaga from '@redux/sagas';

const persistConfig = {
  key: 'primary',
  storage,
  //Here will be all reducers that will be store on persist config
  whitelist:['authentication']
};

//Combining the reducers
const combinedReducers = combineReducers(reducers);

//Persisting the reducers
const persistedReducer = persistReducer(persistConfig, combinedReducers);

//Creating the saga middleware
const sagaMiddleware = createSagaMiddleware();

//Creating the store
const store = createStore(
  persistedReducer,
  applyMiddleware(sagaMiddleware)
);

//Creating the persistor
const persistor = persistStore(store);

//Adding the sagas to the middleware .
sagaMiddleware.run(rootSaga);

export { store, persistor };