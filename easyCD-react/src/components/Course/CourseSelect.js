//React
import React, { useMemo } from 'react';

//Antd
import { Select } from 'antd';

//Lodash
import get from 'lodash/get';
import map from 'lodash/map';

function CourseSelect ({ onChange, courses, defaultValue }){
  //Data
  const options = useMemo(()=>{
    return map(courses,(course) => ({
      label: get(course, 'name'),
      value: get(course,'_id')
    }));
  },[courses]);

  return (
    <Select
      options={options}
      onChange={onChange}
      placeholder="Select course"
      allowClear
      defaultValue={defaultValue}
    />
  );
}

export default CourseSelect;