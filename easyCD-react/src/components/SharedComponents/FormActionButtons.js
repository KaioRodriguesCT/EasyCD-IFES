//React
import React from 'react';

//Antd
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Form, Space } from 'antd';

function FormActionButtons ({ onCancel }) {
  return (
    <Space direction="horizontal" size="small">
      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
          Save
        </Button>
      </Form.Item>
      <Form.Item>
        <Button onClick={onCancel} icon={<CloseOutlined />}>
          Cancel
        </Button>
      </Form.Item>
    </Space>
  );
}

export default FormActionButtons;
