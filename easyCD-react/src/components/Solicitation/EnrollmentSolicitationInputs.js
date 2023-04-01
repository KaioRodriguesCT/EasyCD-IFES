//React
import React from 'react';

//Antd
import { Space } from 'antd';

//Lodash
import get from 'lodash/get';

//Components
import ComponentSelect from '../SharedComponents/ComponentSelect';

function EnrollmentSolicitationInputs ({ classrooms, handleMetaChange, meta }) {
  return (
    <>
      <Space direction="horizontal" size={'large'}>
        <ComponentSelect
          data={classrooms}
          defaultValue={get(meta, 'classroom')}
          placeholder="Select classroom"
          onChange={handleMetaChange('classroom')}
          mapOptions={({ name, _id }) => ({
            label: name,
            value: _id
          })
          }
        />
      </Space>
    </>
  );
}
export default EnrollmentSolicitationInputs;
