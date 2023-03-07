//Should import all the reducers and export as a object
import { reducer as reducerExample } from '@redux/redux-with-saga-example';
import { reducer as authentication } from '@redux/authentication';
import { reducer as user } from '@redux/user';
import { reducer as people } from '@redux/people';
import { reducer as courses } from '@redux/courses';
import { reducer as curriculumGrides } from '@redux/curriculum-grides';
import { reducer as subjects } from '@redux/subjects';
import { reducer as classrooms } from '@redux/classrooms';
import { reducer as enrollments } from '@redux/enrollments';


export default {
  reducerExample,
  authentication,
  user,
  people,
  courses,
  curriculumGrides,
  subjects,
  classrooms,
  enrollments
};