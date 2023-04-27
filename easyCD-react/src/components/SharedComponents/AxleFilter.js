import map from 'lodash/map';
import SelectFilter from './SelectFilter';

function AxleFilter ({ onChange, defaultValue }){
  const data = ['Teaching', 'Research', 'Extension', 'Student Representation'];

  const mapFn = (data) => map(data, (e) => ({ label: e, value: e }));

  return (
    <SelectFilter
      data={data}
      mapFn={mapFn}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Select axle"
    />
  );
}
export default AxleFilter;