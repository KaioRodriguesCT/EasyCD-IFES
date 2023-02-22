//React
import React from 'react';

//Antd
import { Switch } from 'antd';

//Lodash
import get from 'lodash/get';

function BooleanColumn ({ title, dataIndex }) {
  return {
    title,
    dataIndex,
    render: (_, record) => {
      return (
        <>
          <Switch checked={get(record, dataIndex)} disabled />
        </>
      );
    }
  };
}

export default BooleanColumn;