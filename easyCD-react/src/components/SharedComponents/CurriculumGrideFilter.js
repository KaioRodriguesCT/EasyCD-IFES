//React
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Lodash
import isNil from 'lodash//isNil';
import map from 'lodash/map';

//Components
import SelectFilter from './SelectFilter/index';

//Actions
import { actions as grideActions } from '@redux/curriculum-grides';

function CurriculumGrideFilter ({ defaultValue, onChange }) {
  const dispatch = useDispatch();
  const cGrides = useSelector((state) => state.curriculumGrides.curriculumGrides);

  useEffect(() =>{
    if(isNil(cGrides)){
      dispatch(grideActions.listCurriculumGrides());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[cGrides]);

  const mapFn = (data) => map(data, (e) => ({ label: e.name, value: e._id }));

  return (
    <SelectFilter
      data={cGrides}
      mapFn={mapFn}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Select Curriculum Gride"
    />
  );
}
export default CurriculumGrideFilter;
