import map from 'lodash/map';
import SelectFilter from './SelectFilter/index';

function CAStatusFilter ({ onChange, defaultValue }) {
  const data = ['Accepted', 'Rejected'];

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
export default CAStatusFilter;
