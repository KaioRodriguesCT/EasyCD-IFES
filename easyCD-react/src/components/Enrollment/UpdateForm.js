//React
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Form, Input, Space } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';

//Lodash
import isFunction from 'lodash/isFunction';

//Actions
import { actions as clasroomActions } from '@redux/classrooms';
import { actions as peopleActions } from '@redux/people';
import { actions as enrollmentActions } from '@redux/enrollments';

//Components
import ComponentSelect from '@src/components/SharedComponents/ComponentSelect';
import StatusSelect from './StatusSelect';

//Handlers
import { handleInputChange, handleSelectChange } from '@src/shared/handlers';

function UpdateForm ({ closeModal, enrollment }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const classrooms = useSelector((state) => state.classrooms.classrooms);
  const students = useSelector((state) => state.people.peopleSlim);

  //Local state
  const [newEnrollment, setNewEnrollment] = useState(enrollment);

  //Hooks
  useEffect(() => {
    dispatch(clasroomActions.listClassrooms());
    dispatch(peopleActions.listSlimPeopleByRole({ role: 'student' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(enrollmentActions.updateEnrollment(newEnrollment));
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
      <Card title="Enrollment - Update Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit} initialValues={enrollment}>
          <Form.Item
            valuePropName="defaultValue"
            name="classroom"
            label="Classroom:"
            rules={[{ required: true, message: 'Classroom is required !' }]}>
            <ComponentSelect
              data={classrooms}
              placeholder="Select Classroom"
              onChange={handleSelectChange(newEnrollment, setNewEnrollment, 'classroom')}
              mapOptions={(classroom) => ({
                label: classroom.name,
                value: classroom._id
              })}

            />
          </Form.Item>
          <Form.Item
            valuePropName="defaultValue"
            name="student"
            label="Student:"
            rules={[{ required: true, message: 'Student is required !' }]}>
            <ComponentSelect
              data={students}
              mapOptions={(student)=> ({
                label: student.name,
                value: student._id
              })}
              onChange={handleSelectChange(newEnrollment, setNewEnrollment, 'student')}
              placeholder="Select student"
            />
          </Form.Item>
          <Form.Item valuePropName="defaultValue" name="status" label="Status">
            <StatusSelect
              onChange={handleSelectChange(newEnrollment, setNewEnrollment, 'status')}
            />
          </Form.Item>
          <Form.Item name="observation" label="Observation:">
            <Input.TextArea
              onChange={handleInputChange(newEnrollment, setNewEnrollment, 'observation')}
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
