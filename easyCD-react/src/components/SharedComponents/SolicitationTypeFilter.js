//React
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Lodash
import isNil from 'lodash//isNil';
import map from 'lodash/map';

//Components
import SelectFilter from './SelectFilter/index';

//Actions
import { actions as stActions } from '@redux/solicitation-types';

function SolicitationTypeFilter ({ defaultValue, onChange }) {
  const dispatch = useDispatch();
  const saTypes = useSelector((state) => state.solicitationTypes.solicitationTypes);

  useEffect(() =>{
    if(isNil(saTypes)){
      dispatch(stActions.listSolicitationTypes());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[saTypes]);

  const mapFn = (data) => map(data, (e) => ({ label: e.name, value: e._id }));

  return (
    <SelectFilter
      data={saTypes}
      mapFn={mapFn}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Select Solicitation Type"
    />
  );
}
export default SolicitationTypeFilter;
