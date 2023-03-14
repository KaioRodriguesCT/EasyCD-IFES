//React
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

//Antd
import { Card, Divider, Form, Input, Space } from 'antd';

//Lodash
import isFunction from 'lodash/isFunction';

//Actions
import { actions as peopleActions } from '@redux/people';

//Components
import FormActionButtons from '../SharedComponents/FormActionButtons';

//Handlers
import { handleInputChange } from '@src/shared/handlers';

function UpdateForm ({ person, closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Local state
  const [newPerson, setNewPerson] = useState(person);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(peopleActions.updatePerson(newPerson));
    if (isFunction(closeModal)) {
      closeModal();
    }
    await form.resetFields();
  };

  const onCancel = async () => {
    if (isFunction(closeModal)) {
      closeModal();
    }
    await form.resetFields();
  };

  const handleInputChangeLocal = (field) => handleInputChange(newPerson, setNewPerson, field);

  //Renders
  const renderForm = () => {
    return (
      <Card title="Person - Update Form" style={{ overflow: 'auto' }}>
        <Form form={form} layout="vertical" onFinish={onFormSubmit} initialValues={person}>
          <Form.Item
            name="firstname"
            label="First Name:"
            rules={[{ required: true, message: 'First name is required !' }]}>
            <Input onChange={handleInputChangeLocal('firstname')} />
          </Form.Item>
          <Form.Item
            name="surname"
            label="Surname:"
            rules={[{ required: true, message: 'Surname is required !' }]}>
            <Input onChange={handleInputChangeLocal('surname')} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email:"
            rules={[{ required: true, message: 'Email is required !' }]}>
            <Input type="email" onChange={handleInputChangeLocal('email')} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone:"
            rules={[{ required: true, message: 'Phone is required !' }]}>
            <Input placeholder="(99) 9 9999 9999" onChange={handleInputChangeLocal('phone')} />
          </Form.Item>
          <Space direction="horizontal" size="large">
            <Form.Item name="city" label="City:">
              <Input onChange={handleInputChangeLocal('city')} />
            </Form.Item>
            <Form.Item name="uf" label="UF:">
              <Input onChange={handleInputChangeLocal('uf')} />
            </Form.Item>
          </Space>
          <Divider />
          {FormActionButtons({ onCancel })}
        </Form>
      </Card>
    );
  };

  return <>{renderForm()}</>;

}
export default UpdateForm;