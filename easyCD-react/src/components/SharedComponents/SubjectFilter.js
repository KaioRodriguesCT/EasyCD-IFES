//React
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Lodash
import isNil from 'lodash//isNil';
import map from 'lodash/map';

//Components
import SelectFilter from './SelectFilter/index';

//Actions
import { actions as subjectActions } from '@redux/subjects';

function SubjectFilter ({ defaultValue, onChange }) {
  const dispatch = useDispatch();
  const subjects = useSelector((state) => state.subjects.subjects);

  useEffect(() =>{
    if(isNil(subjects)){
      dispatch(subjectActions.listSubjects());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[subjects]);

  const mapFn = (data) => map(data, (e) => ({ label: e.name, value: e._id }));

  return (
    <SelectFilter
      data={subjects}
      mapFn={mapFn}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Select Subject"
    />
  );
}
export default SubjectFilter;
