//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Form, Input, Space } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';

//Lodash
import isFunction from 'lodash/isFunction';

//Actions
import { actions as peopleActions } from '@redux/people';
import { actions as courseActions } from '@redux/courses';

//Components
import ComponentSelect from '@src/components/SharedComponents/ComponentSelect';

//Handlers
import { handleInputChange, handleSelectChange } from '@src/shared/handlers';

function CreateForm ({ closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const peopleSlim = useSelector((state) => state.people.peopleSlim);

  //Local state
  const [newCourse, setNewCourse] = useState();

  //Hooks
  useEffect(() => {
    dispatch(peopleActions.listSlimPeopleByRole({ role: 'teacher' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(courseActions.createCourse(newCourse));
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
      <Card title="Course - Create Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
          <Form.Item
            name="name"
            label="Name:"
            rules={[{ required: true, message: 'Name is required !' }]}>
            <Input type="text" onChange={handleInputChange(newCourse, setNewCourse, 'name')} />
          </Form.Item>
          <Form.Item
            name="coordinator"
            label="Coordinator:"
            rules={[{ required: true, message: 'Coordinator is required !' }]}>
            <ComponentSelect
              data={peopleSlim}
              onChange={handleSelectChange(newCourse, setNewCourse, 'coordinator')}
              mapOptions={(coordinator) => ({
                label: coordinator.name,
                value: coordinator._id
              })}
              placeholder="Select coordinator"
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

export default CreateForm;
