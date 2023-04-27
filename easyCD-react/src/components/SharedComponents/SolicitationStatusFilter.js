import map from 'lodash/map';
import SelectFilter from './SelectFilter/index';

function SolicitationStatusFilter ({ onChange, defaultValue }) {
  const data = ['Pending', 'Canceled', 'Deferred', 'Undeferred'];

  const mapFn = (data) => map(data, (e) => ({ label: e, value: e }));

  return (
    <SelectFilter
      data={data}
      mapFn={mapFn}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Select status"
    />
  );
}
export default SolicitationStatusFilter;
