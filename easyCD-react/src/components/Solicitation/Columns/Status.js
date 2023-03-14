//React
import React from 'react';

//Antd
import { CheckOutlined, ClockCircleOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

//LOdash
import get from 'lodash/get';

function Status () {
  return {
    title: 'Status',
    dataIndex: 'status',
    render: (value) => {
      const statusIcons = {
        Deferred: { icon: <CheckOutlined />, color: 'green' },
        Undeferred: { icon: <CloseOutlined />, color: 'red' },
        Pending: { icon: <ClockCircleOutlined />, color: 'yellow' },
        Canceled: { icon: <StopOutlined />, color: 'gray' }
      };
      const status = statusIcons[ value ];

      return (
        <Tag color={get(status, 'color')}>
          {get(status, 'icon')} {value}
        </Tag>
      );
    }
  };
}
export default Status;
