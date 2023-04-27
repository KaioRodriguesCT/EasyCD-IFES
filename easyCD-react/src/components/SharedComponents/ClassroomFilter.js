//React
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Lodash
import isNil from 'lodash//isNil';
import map from 'lodash/map';

//Components
import SelectFilter from './SelectFilter/index';

//Actions
import { actions as classroomActions } from '@redux/classrooms';

function ClassroomFilter ({ defaultValue, onChange }) {
  const dispatch = useDispatch();
  const classrooms = useSelector((state) => state.classrooms.classrooms);

  useEffect(() => {
    if (isNil(classrooms)) {
      dispatch(classroomActions.listClassrooms());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classrooms]);

  const mapFn = (data) => map(data, (e) => ({ label: e.name, value: e._id }));

  return (
    <SelectFilter
      data={classrooms}
      mapFn={mapFn}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Select classroom"
    />
  );
}
export default ClassroomFilter;
