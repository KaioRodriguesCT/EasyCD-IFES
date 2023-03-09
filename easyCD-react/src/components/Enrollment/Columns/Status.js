//React
import React from 'react';

//Antd
import { CheckOutlined, ClockCircleOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

//Lodash
import get from 'lodash/get';

function Status (){
  return {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (_, record) => {
      const status = {
        Canceled: {
          icon: <StopOutlined />,
          color: '#d8d8d8'
        },
        'In Progress': { icon:<ClockCircleOutlined />, color: '#3CBBFE' },
        Approved: { icon: <CheckOutlined />, color: '#00DF5F' },
        Repproved: { icon: <CloseOutlined />, color: '#FF0000' }
      };
      const enrollmentStatus = get(status, record.status);

      return <Tag color={enrollmentStatus.color}>{enrollmentStatus.icon}{' '} {record.status}</Tag>;
    }
  };
}
export default Status;
