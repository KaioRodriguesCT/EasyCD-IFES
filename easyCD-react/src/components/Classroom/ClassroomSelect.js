//React
import React, { useMemo } from 'react';

//Antd
import { Select } from 'antd';

//Lodash
import get from 'lodash/get';
import map from 'lodash/map';

function ClassroomSelect ({ onChange, classrooms, defaultValue }){
  //Data
  const options = useMemo(()=>{
    return map(classrooms,(classroom) => ({
      label: get(classroom, 'name'),
      value: get(classroom,'_id')
    }));
  },[classrooms]);

  return (
    <Select
      options={options}
      onChange={onChange}
      placeholder="Select classroom"
      allowClear
      defaultValue={defaultValue}
    />
  );
}

export default ClassroomSelect;