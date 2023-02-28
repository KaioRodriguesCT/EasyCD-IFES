//React
import React, { useMemo } from 'react';

//Antd
import { Select } from 'antd';

//Lodash
import get from 'lodash/get';
import map from 'lodash/map';

function PeopleSelect ({ onChange, peopleSlim, defaultValue, placeholder }){
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
      placeholder={placeholder}
      allowClear
      defaultValue={defaultValue}
    />
  );
}

export default PeopleSelect;