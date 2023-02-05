//React
import React from 'react';

//Antd
import { Button, Card, Form, Input, Space } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';

//Lodash
import isFunction from 'lodash/isFunction';

//Components
import CoordinatorSelect from '@src/components/Person/CoordinatorSelect';

function CreateForm ({ closeModal }) {
  const [form] = Form.useForm();

  //Handlers
  const onFormSubmit = () => {};

  const onChangeCoordinator = (e) => {
    console.log(e);
  };

  const onChangeName = (e) => {
    console.log(e);
  };

  const onCancel = () => {
    if(isFunction(closeModal)){
      closeModal();
      form.resetFields();
    }
  };

  //Renders
  const renderForm = () => {
    return (
      <Card title="Course - Create Form">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFormSubmit}
        >
          <Form.Item name="name" label="Name:" rules={[{ required: true, message:'Name is required !' }]}>
            <Input type="text" onChange={onChangeName}/>
          </Form.Item>
          <Form.Item name="coordinator" label="Coordinator:" rules={[{ required: true, message:'Coordinator is required !' }]}>
            <CoordinatorSelect onChange={onChangeCoordinator} />
          </Form.Item>
          <Space direction="horizontal" size="small">
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined/>}>Save</Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={onCancel} icon={<CloseOutlined/>}>Cancel</Button>

            </Form.Item>
          </Space>
        </Form>
      </Card>
    );
  };


  return <div>{renderForm()}</div>;
}

export default CreateForm;