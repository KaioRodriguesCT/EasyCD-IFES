//React
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

//Antd
import { Card, Form, Input, Space, Switch } from 'antd';

//Lodash
import clone from 'lodash/clone';
import isFunction from 'lodash/isFunction';

//Actions
import { actions as stActions } from '@redux/solicitation-types';

//Handlers
import { handleInputChange, handleSwitchChange } from '@src/shared/handlers';

//Components
import FieldsStructurePicker from './FieldsStructurePicker';
import FormActionButtons from '../SharedComponents/FormActionButtons';

function UpdateForm ({ solicitationType, closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Local state
  const [newSolicitationType, setNewSolicitationType] = useState(solicitationType);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(stActions.updateSolicitationType(newSolicitationType));
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

  const handleInputChangeLocal = (field) =>
    handleInputChange(newSolicitationType, setNewSolicitationType, field);

  const handleSwitchChangeLocal = (field) =>
    handleSwitchChange(newSolicitationType, setNewSolicitationType, field);

  const handleFieldsStructurePickerChange = (fieldsStructure) => {
    const actualSolicitationtype = clone(newSolicitationType) || {};
    actualSolicitationtype.fieldsStructure = fieldsStructure;
    setNewSolicitationType(actualSolicitationtype);
  };

  //Renders
  const renderForm = () => {
    return (
      <Card title="Solicitation Type - Create Form">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFormSubmit}
          initialValues={solicitationType}>
          <Form.Item
            name="name"
            label="Name:"
            rules={[{ required: true, message: 'Name is required !' }]}>
            <Input type="text" onChange={handleInputChangeLocal('name')} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description:"
            rules={[{ required: true, message: 'Description is required !' }]}>
            <Input.TextArea onChange={handleInputChangeLocal('description')} />
          </Form.Item>
          <Space direction="horizontal">
            <Form.Item valuePropName="checked" name="requireTeacherApproval" label="Req. Teacher Approval">
              <Switch onChange={handleSwitchChangeLocal('requireTeacherApproval')} />
            </Form.Item>
            <Form.Item valuePropName="checked" name="requireCoordinatorApproval" label="Req. Coordinator Approval">
              <Switch onChange={handleSwitchChangeLocal('requireCoordinatorApproval')} />
            </Form.Item>
            <Form.Item valuePropName="checked" name="allowSubmitFile" label="Allow File">
              <Switch onChange={handleSwitchChangeLocal('allowSubmitFile')} />
            </Form.Item>
          </Space>
          <Form.Item valuePropName="defaultValue" name="fieldsStructure" label="Fields Structure:">
            <FieldsStructurePicker onChange={handleFieldsStructurePickerChange} />
          </Form.Item>
          {FormActionButtons({ onCancel })}
        </Form>
      </Card>
    );
  };

  return <>{renderForm()}</>;
}
export default UpdateForm;
