//React
import React from 'react';

//Antd
import { Button, Space } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

function Actions ({ onEditClick, onDeleteClick }){
  return {
    title:'Actions',
    dataIndex: 'actions',
    width:'10%',
    render:(_, record) => {
      return (
        <Space direction="horizontal">
          <Button type="primary" icon={<EditOutlined/>} onClick={()=> onEditClick(record)}/>
          <Button type="primary" danger icon={<DeleteOutlined/>} onClick={() => onDeleteClick(record)}/>
        </Space>
      );
    }
  };

}

export default Actions;