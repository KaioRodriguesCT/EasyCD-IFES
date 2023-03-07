//React
import React from 'react';

//Antd
import { Select } from 'antd';

function StatusSelect ({ onChange, defaultValue }){
  const options = [
    {
      label: 'Canceled',
      value: 'Canceled'

    },
    {
      label: 'In Progress',
      value: 'In Progress'
    },
    {
      label: 'Approved',
      value: 'Approved'
    },
    {
      label: 'Repproved',
      value: 'Repproved'
    }
  ];
  return (
    <Select
      defaultValue={defaultValue}
      allowClear={false}
      onChange={onChange}
      options={options}
    />
  );
}
export default StatusSelect;
