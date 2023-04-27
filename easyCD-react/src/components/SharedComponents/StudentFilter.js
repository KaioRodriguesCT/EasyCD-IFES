//React
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Lodash
import isNil from 'lodash//isNil';
import map from 'lodash/map';

//Components
import SelectFilter from './SelectFilter/index';

//Actions
import { actions as peopleActions } from '@redux/people';

function StudentFilter ({ defaultValue, onChange }) {
  const dispatch = useDispatch();
  const students = useSelector((state) => state.people.students);

  useEffect(() =>{
    if(isNil(students)){
      dispatch(peopleActions.getStudents());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[students]);

  const mapFn = (data) => map(data, (e) => ({ label: e.name, value: e._id }));

  return (
    <SelectFilter
      data={students}
      mapFn={mapFn}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Select Student"
    />
  );
}
export default StudentFilter;
