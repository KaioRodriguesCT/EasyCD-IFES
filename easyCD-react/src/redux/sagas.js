//Should be imported here the watchers
import { all, fork } from 'redux-saga/effects';

//All Sagas
import { rootSaga as sagaExample } from '@redux/redux-with-saga-example';
import { rootSaga as authentication } from '@redux/authentication';
import { rootSaga as user } from '@redux/user';
import { rootSaga as people } from '@redux/people';
import { rootSaga as courses } from '@redux/courses';
import { rootSaga as curriculumGrides } from '@redux/curriculum-grides';
import { rootSaga as subjects } from '@redux/subjects';
import { rootSaga as classrooms } from '@redux/classrooms';

export function* rootSaga (){
  const sagas = [
    sagaExample,
    authentication,
    user,
    people,
    courses,
    curriculumGrides,
    subjects,
    classrooms
  ].map(fork);
  yield all(sagas);
}

export default rootSaga;