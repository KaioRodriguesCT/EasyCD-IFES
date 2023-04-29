import map from 'lodash/map';
import SelectFilter from './SelectFilter/index';

function EnrollmentStatusFilter ({ onChange, defaultValue }) {
  const data = ['Canceled', 'In Progress', 'Approved', 'Repproved'];

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
export default EnrollmentStatusFilter;
