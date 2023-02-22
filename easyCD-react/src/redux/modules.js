//Should import all the reducers and export as a object
import { reducer as reducerExample } from '@redux/redux-with-saga-example';
import { reducer as authentication } from '@redux/authentication';
import { reducer as user } from '@redux/user';
import { reducer as people } from '@redux/people';
import { reducer as courses } from '@redux/courses';
import { reducer as curriculumGrides } from '@redux/curriculum-grides';

export default {
  reducerExample,
  authentication,
  user,
  people,
  courses,
  curriculumGrides
};