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

function CoordinatorFilter ({ defaultValue, onChange }) {
  const dispatch = useDispatch();
  const coordinators = useSelector((state) => state.people.teachers);

  useEffect(() =>{
    if(isNil(coordinators)){
      dispatch(peopleActions.getTeachers());
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
      placeholder="Select Coordinator"
    />
  );
}
export default CoordinatorFilter;
