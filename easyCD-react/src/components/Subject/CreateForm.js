//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Card, Form, InputNumber, Input, Space, Button } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';

//Lodash
import isFunction from 'lodash/isFunction';

//Actions
import { actions as curriculumGrideActions } from '@redux/curriculum-grides';
import { actions as subjectActions } from '@redux/subjects';

//Handlers
import {
  handleInputChange,
  handleInputNumberChange,
  handleSelectChange
} from '@src/shared/handlers';

//Components
import ComponentSelect from '@src/components/SharedComponents/ComponentSelect';

function CreateForm ({ closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const curriculumGrides = useSelector((state) => state.curriculumGrides.curriculumGrides);

  //Local State
  const [newSubject, setNewSubject] = useState();

  //Hooks
  useEffect(() => {
    dispatch(curriculumGrideActions.listCurriculumGrides({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(subjectActions.createSubject(newSubject));
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

  //Renders
  const renderForm = () => {
    return (
      <Card title="Subject - Create Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
          <Form.Item
            name="name"
            label="Name:"
            rules={[{ required: true, message: 'Name is required !' }]}>
            <Input type="text" onChange={handleInputChange(newSubject, setNewSubject, 'name')} />
          </Form.Item>
          <Form.Item
            name="qtyHours"
            label="Qty Hours:"
            rules={[{ required: true, message: 'Qty Hours is required !' }]}>
            <InputNumber
              min={0}
              max={4}
              onChange={handleInputNumberChange(newSubject, setNewSubject, 'qtyHours')}
            />
          </Form.Item>
          <Form.Item
            name="curriculumGride"
            label="Curriculum Gride:"
            rules={[{ required: true, message: 'Curriculum Gride is required !' }]}>
            <ComponentSelect
              data={curriculumGrides}
              onChange={handleSelectChange(newSubject, setNewSubject, 'curriculumGride')}
              mapOptions={(curriculumGride) => ({
                label: curriculumGride.name,
                value: curriculumGride._id
              })}
              placeholder="Select curriculum gride"
            />
          </Form.Item>
          <Form.Item name="externalCod" label="Ext. Cod:">
            <Input
              type="text"
              onChange={handleInputChange(newSubject, setNewSubject, 'externalCod')}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              onChange={handleInputChange(newSubject, setNewSubject, 'description')}
            />
          </Form.Item>
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
        </Form>
      </Card>
    );
  };

  return <div>{renderForm()}</div>;
}
export default CreateForm;
