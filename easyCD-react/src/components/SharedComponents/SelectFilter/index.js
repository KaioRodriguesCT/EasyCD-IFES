import { Select } from 'antd';
import { useMemo } from 'react';

import './index.css';

function SelectFilter ({ defaultValue, onChange, data, mapFn, placeholder, allowClear = true }){
  const options = useMemo(() => mapFn(data),[data, mapFn]);
  return (
    <Select
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange}
      options={options }
      allowClear={allowClear}
      style={{ width:'250px', position:'unset !important' }}
    />
  );
}
export default SelectFilter;