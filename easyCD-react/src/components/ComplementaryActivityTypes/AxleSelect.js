//React
import React from 'react';

//Antd
import { Select } from 'antd';

function AxleSelect ({ onChange, defaultValue }) {
  const options = ['Teaching', 'Research', 'Extension', 'Student Representation'].map((elem) => ({
    label: elem,
    value: elem
  }));

  return (
    <Select onChange={onChange} options={options} defaultValue={defaultValue} allowClear={false} />
  );
}
export default AxleSelect;
