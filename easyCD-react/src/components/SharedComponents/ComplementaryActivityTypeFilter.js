//React
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Lodash
import isNil from 'lodash//isNil';
import map from 'lodash/map';

//Components
import SelectFilter from './SelectFilter/index';

//Actions
import { actions as caTypeActions } from '@redux/complementary-activity-types';

function ComplementaryActivityTypeFilter ({ defaultValue, onChange }) {
  const dispatch = useDispatch();
  const caTypes = useSelector(
    (state) => state.complementaryActivityTypes.complementaryActivityTypes
  );

  useEffect(() => {
    if (isNil(caTypes)) {
      dispatch(caTypeActions.listCaTypes());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caTypes]);

  const mapFn = (data) => map(data, (e) => ({ label: e.name, value: e._id }));

  return (
    <SelectFilter
      data={caTypes}
      mapFn={mapFn}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Select Type"
    />
  );
}
export default ComplementaryActivityTypeFilter;
