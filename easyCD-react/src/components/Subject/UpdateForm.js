//React
import React, { useEffect,  useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Form, Input, InputNumber, Space } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';

//Actions
import { actions as curriculumGrideActions } from '@redux/curriculum-grides';
import { actions as subjectsActions } from '@redux/subjects';

//Lodash
import isFunction from 'lodash/isFunction';

//Handlers
import {
  handleInputChange,
  handleInputNumberChange,
  handleSelectChange
} from '@src/shared/handlers';

//Components
import CurriculumGrideSelect from '../CurriculumGride/CurriculumGrideSelect';

function UpdateForm ({ subject, closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const curriculumGrides = useSelector((state) => state.curriculumGrides.curriculumGrides);

  //Local state
  const [newSubject, setNewSubject] = useState(subject);

  //Hooks
  useEffect(() => {
    dispatch(curriculumGrideActions.listCurriculumGrides({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(subjectsActions.updateSubject(newSubject));
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
      <Card title="Subject - Update Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit} initialValues={subject}>
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
            valuePropName="defaultValue"
            name="curriculumGride"
            label="Curriculum Gride:"
            rules={[{ required: true, message: 'Curriculum Gride is required !' }]}>
            <CurriculumGrideSelect
              curriculumGrides={curriculumGrides}
              onChange={handleSelectChange(newSubject, setNewSubject, 'curriculumGride')}
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
export default UpdateForm;
