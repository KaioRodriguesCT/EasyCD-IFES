//React
import React, { useMemo } from 'react';

//Antd
import { Select } from 'antd';

//Lodash
import map from 'lodash/map';

function ComponentSelect ({ onChange, data, mapOptions, defaultValue, placeholder }) {

  //Data
  const options = useMemo(()=> map(data, mapOptions),[data, mapOptions]);

  return (
    <Select
      options={options}
      onChange={onChange}
      placeholder={placeholder}
      allowClear
      defaultValue={defaultValue}
    />
  );
}
export default ComponentSelect;