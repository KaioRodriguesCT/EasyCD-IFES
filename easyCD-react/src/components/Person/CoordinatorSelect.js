//React
import React from 'react';

//Antd
import { Select } from 'antd';

function CoordinatorSelect ({ onChange }){
  return (
    <Select
      options={[]}
      onChange={onChange}
    />
  );
}

export default CoordinatorSelect;