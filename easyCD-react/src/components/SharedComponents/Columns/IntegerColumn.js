//React
import React from 'react';

//Lodash
import get from 'lodash/get';

function IntegerColumn ({ title, dataIndex }) {
  return {
    title,
    dataIndex,
    render: (_, record) => {
      return (
        <>
          {get(record, dataIndex)}
        </>
      );
    }
  };
}

export default IntegerColumn;