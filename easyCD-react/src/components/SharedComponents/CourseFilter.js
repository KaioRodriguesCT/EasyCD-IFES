//React
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Lodash
import isNil from 'lodash//isNil';
import map from 'lodash/map';

//Components
import SelectFilter from './SelectFilter/index';

//Actions
import { actions as courseActions } from '@redux/courses';

function CourseFilter ({ defaultValue, onChange }) {
  const dispatch = useDispatch();
  const coordinators = useSelector((state) => state.courses.courses);

  useEffect(() =>{
    if(isNil(coordinators)){
      dispatch(courseActions.listCourses());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[coordinators]);

  const mapFn = (data) => map(data, (e) => ({ label: e.name, value: e._id }));

  return (
    <SelectFilter
      data={coordinators}
      mapFn={mapFn}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Select Course"
    />
  );
}
export default CourseFilter;
