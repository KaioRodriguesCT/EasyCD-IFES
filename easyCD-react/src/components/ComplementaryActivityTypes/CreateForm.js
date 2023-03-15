//React
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

//Antd
import { Card, Form, Input, InputNumber, Space } from 'antd';

//Lodash
import isFunction from 'lodash/isFunction';

//Actions
import { actions as caTypeActions } from '@redux/complementary-activity-types';

//Handlers
import {
  handleInputChange,
  handleInputNumberChange,
  handleSelectChange
} from '@src/shared/handlers';

//Components
import UnitSelect from './UnitSelect';
import AxleSelect from './AxleSelect';
import FormActionButtons from '../SharedComponents/FormActionButtons';

function CreateForm ({ closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Local state
  const [newCAType, setNewCAType] = useState();

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(caTypeActions.createCaType(newCAType));
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

  const handleInputLocal = (field) => handleInputChange(newCAType, setNewCAType, field);

  const handleInputNumberLocal = (field) => handleInputNumberChange(newCAType, setNewCAType, field);
  const handleSelectLocal = (field) => handleSelectChange(newCAType, setNewCAType, field);
  //Renders
  const renderForm = () => {
    return (
      <Card title="CA Type - Create Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
          <Form.Item
            name="name"
            label="Name:"
            rules={[{ required: true, message: 'Name is required !' }]}>
            <Input type="text" onChange={handleInputLocal('name')} />
          </Form.Item>
          <Space direction="horizontal" size="large">
            <Form.Item
              name="unit"
              label="Unit:"
              rules={[{ required: true, message: 'Unit is required !' }]}>
              <UnitSelect onChange={handleSelectLocal('unit')} />
            </Form.Item>
            <Form.Item
              name="score"
              label="Score:"
              rules={[{ required: true, message: 'Score is required !' }]}>
              <InputNumber min={0} onChange={handleInputNumberLocal('score')} />
            </Form.Item>
          </Space>
          <Form.Item
            name="axle"
            label="Axle:"
            rules={[{ required: true, message: 'Axle is required !' }]}>
            <AxleSelect onChange={handleSelectLocal('axle')} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description:"
            rules={[{ required: true, message: 'Name is required !' }]}>
            <Input.TextArea onChange={handleInputLocal('description')} />
          </Form.Item>
          {FormActionButtons({ onCancel })}
        </Form>
      </Card>
    );
  };
  return <>{renderForm()}</>;
}

export default CreateForm;
