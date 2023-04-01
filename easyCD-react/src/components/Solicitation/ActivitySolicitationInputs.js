//React
import React from 'react';

//Antd
import { UploadOutlined } from '@ant-design/icons';
import { Button, InputNumber, Space, Upload } from 'antd';

//Lodash
import get from 'lodash/get';

//Components
import ComponentSelect from '../SharedComponents/ComponentSelect';

function ActivitySolicitationInputs ({ activityTypes, courses, handleMetaChange, meta }) {
  const mapFn = ({ name, _id }) =>({
    label: name,
    value: _id
  });

  return (
    <>
      <Space direction="vertical">
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
        <Space direction="horizontal" size="large">
          Activity Type:
          <ComponentSelect
            data={activityTypes}
            defaultValue={get(meta, 'complementaryActivityType')}
            mapOptions={mapFn}
            onChange={handleMetaChange('complementaryActivityType')}
            placeholder="Select activity type"
          />
        </Space>
        <Space direction="horizontal" size="large">
          Quantity:
          <InputNumber defaultValue={get(meta, 'quantity')} onChange={handleMetaChange('quantity')} />
        </Space>
        <Space direction="horizontal" size="large">
          Evidence:
          <Upload
            maxCount={1}
            beforeUpload={(file) => {
              const fReader = new FileReader();
              fReader.readAsDataURL(file);
              fReader.onload = () => handleMetaChange('evidence')(fReader.result);
              return false;
            }}>
            <Button icon={<UploadOutlined />} />
          </Upload>
        </Space>
      </Space>
    </>
  );
}
export default ActivitySolicitationInputs;
