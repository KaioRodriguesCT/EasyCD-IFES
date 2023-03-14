//React
import React from 'react';

//Antd
import { Select } from 'antd';

function StatusSelect ({ defaultValue, onChange }) {
  const options = ['Deferred', 'Undeferred', 'Pending', 'Canceled'].map((elem) => ({
    label: elem,
    value: elem
  }));
  return (
    <Select
      options={options}
      allowClear={false}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Select the status"
    />
  );
}
export default StatusSelect;
