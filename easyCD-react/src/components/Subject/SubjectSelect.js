//React
import React, { useMemo } from 'react';

//Antd
import { Select } from 'antd';

//Lodash
import get from 'lodash/get';
import map from 'lodash/map';

function SubjectSelect ({ onChange, subjects, defaultValue }) {
  //Data
  const options = useMemo(() => {
    return map(subjects, (subject) => ({
      label: get(subject, 'name'),
      value: get(subject, '_id')
    }));
  }, [subjects]);

  return (
    <Select
      options={options}
      onChange={onChange}
      placeholder="Select an subject"
      allowClear
      defaultValue={defaultValue}
    />
  );
}

export default SubjectSelect;
