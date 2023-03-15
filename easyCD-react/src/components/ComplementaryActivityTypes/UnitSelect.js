//React
import React from 'react';

//Antd
import { Select } from 'antd';

function UnitSelect ({ onChange, defaultValue }) {
  const options = ['Hour'].map((elem) => ({
    label: elem,
    value: elem
  }));

  return (
    <Select onChange={onChange} options={options} defaultValue={defaultValue} allowClear={false} style={{ minWidth:'100px' }} />
  );
}
export default UnitSelect;
