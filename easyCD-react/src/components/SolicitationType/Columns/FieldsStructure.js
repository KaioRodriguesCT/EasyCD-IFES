//React
import React from 'react';

//Antd
import { Tag } from 'antd';

//Lodash
import map from 'lodash/map';

function FieldsStructure () {
  return {
    title: 'Fields Structure',
    dataIndex: 'fieldsStructure',
    render: (_, record) => {
      return map(_, (fieldStructure) => {
        return (
          <Tag>
            Name: {fieldStructure.name} - Type: {fieldStructure.type}
          </Tag>
        );
      });
    }
  };
}
export default FieldsStructure;
