//Should import all the reducers and export as a object
import { reducer as reducerExample } from '@redux/redux-with-saga-example';
import { reducer as authentication } from '@redux/authentication';

export default {
  reducerExample,
  authentication
};