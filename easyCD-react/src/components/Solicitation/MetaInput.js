//React
import React, { useCallback, useEffect, useState } from 'react';

//Antd
import { Input, InputNumber, Space, Switch } from 'antd';

//Lodash
import get from 'lodash/get';
import map from 'lodash/map';

//Handlers
import {
  handleInputChange,
  handleInputNumberChange,
  handleSwitchChange
} from '@src/shared/handlers';

function MetaInput ({ solicitationType, defaultValue, onChange }) {
  const [meta, setMeta] = useState(defaultValue);

  //Hooks
  useEffect(() => {
    onChange(meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta]);

  //Handlers
  const handleInputChangeLocal = (field) => handleInputChange(meta, setMeta, field);
  const handleNumberChangeLocal = (field) => handleInputNumberChange(meta, setMeta, field);

  const getInput = useCallback(
    (field) => {
      switch (field.type) {
        case 'String':
        case 'ObjectId':
          return (
            <Input
              type="text"
              defaultValue={get(meta, field.name)}
              onChange={handleInputChangeLocal(field.name)}
            />
          );
        case 'Number':
          return (
            <InputNumber
              defaultValue={get(meta, field.name)}
              onChange={handleNumberChangeLocal(field.name)}
            />
          );
        case 'Boolean':
          return (
            <Switch
              checked={get(meta, field.name)}
              onChange={handleSwitchChange(meta, setMeta, field.name)}
            />
          );
        case 'Buffer':
          return (
            <Input.TextArea
              defaultValue={get(meta, field.name)}
              onChange={handleInputChangeLocal(field.name)}
            />
          );
        default:
          return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meta]
  );

  //Renders
  const renderSolicitationTypeInputs = () => {
    if (!solicitationType) {
      return null;
    }
    return map(solicitationType.fieldsStructure, (field) => {
      const input = getInput(field);
      return (
        <Space direction="horizontal">
          {`${ field.name }:`} {input}
        </Space>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return (
    <Space direction="vertical" size="large">
      {renderSolicitationTypeInputs()}
    </Space>
  );
}
export default MetaInput;
