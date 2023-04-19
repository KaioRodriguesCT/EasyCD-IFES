//React
import React from 'react';

//Antd
import { Select } from 'antd';

function StatusSelect ({ defaultValue, onChange, showRestrict }) {
  const nonRestrictStts = ['Pending', 'Canceled'];
  const restrictStts = ['Deferred', 'Undeferred'];
  const options = (showRestrict ? nonRestrictStts.concat(restrictStts) : nonRestrictStts).map(
    (elem) => ({
      label: elem,
      value: elem
    })
  );
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
