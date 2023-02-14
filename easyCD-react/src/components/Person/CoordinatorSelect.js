//React
import React, { useMemo } from 'react';

//Antd
import { Select } from 'antd';

//Lodash
import get from 'lodash/get';
import map from 'lodash/map';

function CoordinatorSelect ({ onChange, peopleSlim, defaultValue }){
  //Data
  const options = useMemo(()=>{
    return map(peopleSlim,(person) => ({
      label: get(person, 'name'),
      value: get(person,'_id')
    }));
  },[peopleSlim]);

  return (
    <Select
      options={options}
      onChange={onChange}
      placeholder="Select Coordinator"
      allowClear
      defaultValue={defaultValue}
    />
  );
}

export default CoordinatorSelect;