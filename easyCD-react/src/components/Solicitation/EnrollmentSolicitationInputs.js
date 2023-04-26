//React
import React from 'react';

//Antd
import { Space } from 'antd';

//Lodash
import get from 'lodash/get';

//Components
import ComponentSelect from '../SharedComponents/ComponentSelect';

function EnrollmentSolicitationInputs ({ courses, classrooms, handleMetaChange, meta }) {
  const mapFn = ({ name, _id }) =>({
    label: name,
    value: _id
  });

  return (
    <>
      <Space direction="vertical" size="large">
        <Space direction="horizontal" size="large">
          Course:
          <ComponentSelect
            data={courses}
            defaultValue={get(meta, 'course')}
            mapOptions={mapFn}
            onChange={handleMetaChange('course')}
            placeholder="Select course"
          />
        </Space>
        {meta?.course
      && <Space direction="horizontal" size={'large'}>
        Classroom:
        <ComponentSelect
          data={classrooms}
          defaultValue={get(meta, 'classroom')}
          placeholder="Select classroom"
          onChange={handleMetaChange('classroom')}
          mapOptions={mapFn}
        />
      </Space>}
      </Space>
    </>
  );
}
export default EnrollmentSolicitationInputs;
