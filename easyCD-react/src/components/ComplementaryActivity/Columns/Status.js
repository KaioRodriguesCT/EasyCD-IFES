//React
import React from 'react';

//Antd
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

//Lodash
import get from 'lodash/get';

function Status () {
  return {
    title: 'Status',
    dataIndex: 'status',
    render: (value) => {
      const statusProps = {
        Accepted: {
          icon: <CheckCircleOutlined />,
          color: 'green'
        },
        Rejected: {
          icon: <CloseCircleOutlined />,
          color: 'red'
        }
      };
      const status = statusProps[ value ];
      return (
        <Tag color={get(status, 'color')}>
          {get(status, 'icon')} {value}
        </Tag>
      );
    }
  };
}
export default Status;
