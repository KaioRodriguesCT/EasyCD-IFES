//Redux
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from '@redux-saga/core';
import { routerReducer } from 'react-router-redux';

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
const combinedReducers = combineReducers({ ...reducers, routing: routerReducer });

//Persisting the reducers
const persistedReducer = persistReducer(persistConfig, combinedReducers);

//Creating the saga middleware
const composeEnhancers =
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      trace: true,
      traceLimit: 1000
    }))
  || compose;
const sagaMiddleware = createSagaMiddleware();

//Creating the store
export const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware))
);

//Creating the persistor
export const persistor = persistStore(store);

//Adding the sagas to the middleware .
sagaMiddleware.run(rootSaga);