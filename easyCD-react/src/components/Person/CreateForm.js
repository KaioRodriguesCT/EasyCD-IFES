//React
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

//Antd
import { Card, Divider, Form, Input, Select, Space } from 'antd';

//Actions
import { actions as peopleActions } from '@redux/people';

//Lodash
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import isFunction from 'lodash/isFunction';

//Components
import FormActionButtons from '../SharedComponents/FormActionButtons';

//Handlers
import { handleInputChange, handleSelectChange } from '@src/shared/handlers';

function CreateForm ({ closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Local state
  const [newPerson, setNewPerson] = useState();

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(peopleActions.createPerson(newPerson));
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
      <Card title="Person - Create Form" style={{ overflow: 'auto' }}>
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
          <Divider>Person Information</Divider>
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
          <Divider> User Information</Divider>
          <Space direction="horizontal">
            <Form.Item
              name="username"
              label="Username:"
              rules={[{ required: true, message: 'Username is required !' }]}>
              <Input onChange={handleInputChangeLocal('username')} />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password:"
              rules={[{ required: true, message: 'Password is required !' }]}>
              <Input type="password" onChange={handleInputChangeLocal('password')} />
            </Form.Item>
          </Space>
          <Space direction="horizontal">
            <Form.Item
              name="role"
              label="Role:"
              rules={[{ required: true, message: 'Role is required !' }]}>
              <Select
                options={[
                  {
                    label: 'Teacher',
                    value: 'teacher'
                  },
                  {
                    label: 'Student',
                    value: 'student'
                  },
                  {
                    label: 'Admin',
                    value: 'admin'
                  }
                ]}
                onChange={handleSelectChange(newPerson, setNewPerson, 'role')}
                placeholder="Select role"
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
            {isEqual(get(newPerson, 'role'), 'student') ? (
              <Form.Item
                name="registration"
                label="Registration:"
                rules={[{ required: true, message: 'Registration is required for Students !' }]}>
                <Input onChange={handleInputChangeLocal('registration')} />
              </Form.Item>
            ) : null}

            {isEqual(get(newPerson, 'role'), 'teacher') ? (
              <Form.Item
                name="siape"
                label="Siape:"
                rules={[{ required: true, message: 'Siape is required for Students !' }]}>
                <Input onChange={handleInputChangeLocal('siape')} />
              </Form.Item>
            ) : null}
          </Space>
          <Divider />
          {FormActionButtons({ onCancel })}
        </Form>
      </Card>
    );
  };

  return <>{renderForm()}</>;
}

export default CreateForm;
