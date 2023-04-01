//React
import React from 'react';

//Antd
import { Space } from 'antd';

//Lodash
import get from 'lodash/get';

//Components
import ComponentSelect from '../SharedComponents/ComponentSelect';

function EnrollmentChangeSolicitiationInputs ({ classrooms, handleMetaChange, meta }) {
  const mapFn = ({ name, _id }) => ({
    label: name,
    value: _id
  });

  return (
    <>
      <Space direction="horizontal" size="large">
        Classroom to Unenroll:
        <ComponentSelect
          data={classrooms}
          defaultValue={get(meta, 'classroomToUnenroll')}
          placeholder="Select classroom to unenroll"
          onChange={handleMetaChange('classroomToUnenroll')}
          mapOptions={mapFn}
        />
      </Space>
      <Space direction="horizontal" size="large">
        Classroom to Enroll:
        <ComponentSelect
          data={classrooms}
          defaultValue={get(meta, 'classroomToEnroll')}
          placeholder="Select classroom to enroll"
          onChange={handleMetaChange('classroomToEnroll')}
          mapOptions={mapFn}
        />
      </Space>
    </>
  );
}

export default EnrollmentChangeSolicitiationInputs;
