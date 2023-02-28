//React
import React from 'react';

//Lodash
import find from 'lodash/find';
import get from 'lodash/get';

function CurriculumGride ({ curriculumGrides }) {
  return {
    title: 'Curriculum Gride',
    dataIndex: 'curriculumGride',
    render: (_, record) => {
      const curriculumGride = find(curriculumGrides, { _id: get(record, 'curriculumGride') });
      return <>{get(curriculumGride, 'name')}</>;
    }
  };
}

export default CurriculumGride;
