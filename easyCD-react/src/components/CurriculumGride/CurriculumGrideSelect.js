//React
import React, { useMemo } from 'react';

//Antd
import { Select } from 'antd';

//Lodash
import get from 'lodash/get';
import map from 'lodash/map';

function CurriculumGrideSelect ({ onChange, curriculumGrides, defaultValue }) {
  //Data
  const options = useMemo(() => {
    return map(curriculumGrides, (curriculumGride) => ({
      label: get(curriculumGride, 'name'),
      value: get(curriculumGride, '_id')
    }));
  }, [curriculumGrides]);

  return (
    <Select
      options={options}
      onChange={onChange}
      placeholder="Select curriculum gride"
      allowClear
      defaultValue={defaultValue}
    />
  );
}

export default CurriculumGrideSelect;
