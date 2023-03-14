//React
import React from 'react';

//Antd
import { Space, Tag } from 'antd';

//Lodash
import map from 'lodash/map';

function Meta () {
  return {
    title: 'Meta',
    dataIndex: 'meta',
    render: (value) => (
      <Space direction="vertical" >
        {map(value, (value, key) => (
          <Tag>
            {key}: {value}
          </Tag>
        ))}
      </Space>
    )
  };
}
export default Meta;
