//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Form, Input, Space } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';

//Actions
import { actions as peopleActions } from '@redux/people';
import { actions as courseActions } from '@redux/courses';

//Lodash
import isFunction from 'lodash/isFunction';

//Components
import CoordinatorSelect from '@components/Person/CoordinatorSelect';

//Handlers
import { handleInputChange, handleSelectChange } from '@src/shared/handlers';

function UpdateForm ({ course, closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const peopleSlim = useSelector((state) => state.people.peopleSlim);

  //Local state
  const [newCourse, setNewCourse] = useState(course);

  //Hooks
  useEffect(() => {
    dispatch(peopleActions.listSlimPeopleByRole({ role: 'teacher' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNewCourse(course);
  }, [course]);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(courseActions.updateCourse(newCourse));
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
      <Card title="Course - Update Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit} initialValues={course}>
          <Form.Item
            name="name"
            label="Name:"
            rules={[{ required: true, message: 'Name is required !' }]}>
            <Input type="text" onChange={handleInputChange(newCourse, setNewCourse, 'name')} />
          </Form.Item>
          <Form.Item
            valuePropName="defaultValue"
            name="coordinator"
            label="Coordinator:"
            rules={[{ required: true, message: 'Coordinator is required !' }]}>
            <CoordinatorSelect
              peopleSlim={peopleSlim}
              onChange={handleSelectChange(newCourse, setNewCourse, 'coordinator')}
            />
          </Form.Item>
          <Form.Item name="description" label="Description:">
            <Input.TextArea onChange={handleInputChange(newCourse, setNewCourse, 'description')} />
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
