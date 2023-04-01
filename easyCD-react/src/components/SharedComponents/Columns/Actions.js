//React
import React from 'react';

//Antd
import { Button, Space } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

//Lodash
import isFunction from 'lodash/isFunction';

function Actions ({
  onEditClick,
  onDeleteClick,
  showDelete = true,
  showEdit = true,
  showEditFn = null
}) {
  return {
    title: 'Actions',
    dataIndex: 'actions',
    width: '10%',
    render: (_, record) => {
      const showEditByFn = isFunction(showEditFn) ? showEditFn(record) : true;
      return (
        <Space direction="horizontal">
          {showEdit && showEditByFn ? (
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
