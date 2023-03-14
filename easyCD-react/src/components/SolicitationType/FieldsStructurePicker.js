//React
import React , { useEffect, useState } from 'react';

//Antd
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Input, Select, Space } from 'antd';

//Lodash
import clone from 'lodash/clone';
import get from 'lodash/get';
import map from 'lodash/map';

function FieldsStructurePicker ({ defaultValue, onChange }){
  const [fieldsStructure, setFieldsStructure] = useState(defaultValue);

  //Handlers
  const addFielldsStructure = () => {
    const actualFieldsStructure = clone(fieldsStructure) || [];
    actualFieldsStructure.push({ name: null, type:null });
    setFieldsStructure(actualFieldsStructure);
  };

  const removeFieldsStructure = (index) => {
    const actualFieldsStructure = clone(fieldsStructure) || [];
    actualFieldsStructure.splice(index, 1);
    setFieldsStructure(actualFieldsStructure);
  };

  const onChangeProp = (index, field) => (value) => {
    const actualFieldsStructure = clone(fieldsStructure) || [];
    actualFieldsStructure[ index ][ field ] = value;
    setFieldsStructure(actualFieldsStructure);
  };

  //Hooks
  useEffect(() => {
    onChange(fieldsStructure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsStructure]);


  //Renders
  const renderFieldsStructure = () => {
    return map(fieldsStructure, (fieldStructure, index) => {
      return (
        <Space direction="horizontal" key={index}>
          <Input type="text"defaultValue={fieldStructure.name} onChange={(value) => onChangeProp(index, 'name')(get(value,'target.value'))}/>
          <Select
            options={['String', 'Number', 'Buffer', 'Boolean', 'ObjectId'].map((e)=>({
              label: e,
              value: e
            }))}
            style={{ minWidth: '150px' }}
            value={fieldStructure.type}
            onChange={onChangeProp(index, 'type')}
          />
          <Button icon={<DeleteOutlined/>} type="primary" danger onClick={() => removeFieldsStructure(index)}/>
        </Space>
      );
    });
  };

  return (
    <Space direction="vertical" size="large">
      {renderFieldsStructure()}
      <Button icon={<PlusCircleOutlined />} type="primary" onClick={addFielldsStructure} />
    </Space>
  );

}
export default FieldsStructurePicker;