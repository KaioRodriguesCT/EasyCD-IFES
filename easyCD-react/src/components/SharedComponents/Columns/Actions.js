//React
import React from 'react';

//Antd
import { Button, Space } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

function Actions ({ onEditClick, onDeleteClick, showDelete = true, showEdit = true }) {
  return {
    title: 'Actions',
    dataIndex: 'actions',
    width: '10%',
    render: (_, record) => {
      return (
        <Space direction="horizontal">
          {showEdit ? (
            <Button type="primary" icon={<EditOutlined />} onClick={() => onEditClick(record)} />
          ) : null}
          {showDelete ? (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDeleteClick(record)}
            />
          ) : null}
        </Space>
      );
    }
  };
}

export default Actions;
