//Should be imported here the watchers
import { all, fork } from 'redux-saga/effects';

//All Sagas
import { rootSaga as sagaExample } from '@redux/redux-with-saga-example';
import { rootSaga as authentication } from '@redux/authentication';
import { rootSaga as user } from '@redux/user';

export function* rootSaga (){
  const sagas = [
    sagaExample,
    authentication,
    user
  ].map(fork);
  yield all(sagas);
}

export default rootSaga;