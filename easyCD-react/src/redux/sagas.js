//Should be imported here the watchers
import { all, fork } from 'redux-saga/effects';

//All Sagas
import { rootSaga as sagaExample } from '@redux/redux-with-saga-example';

export function* rootSaga (){
  const sagas = [
    sagaExample
  ].map(fork);
  yield all(sagas);
}

export default rootSaga;