//React
import React, { useEffect, useState } from'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Form, Input, Space } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';

//Lodash
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';

//Actions
import { actions as clasroomActions } from '@redux/classrooms';
import { actions as peopleActions } from '@redux/people';
import { actions as enrollmentActions } from '@redux/enrollments';

//Components
import ClassroomSelect from '../Classroom/ClassroomSelect';
import PeopleSelect from '../Person/PeopleSelect';

//Handlers
import { handleInputChange, handleSelectChange } from '@src/shared/handlers';

function CreateForm ({ closeModal }){
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const classrooms = useSelector((state) => state.classrooms.classrooms);
  const students = useSelector((state) => state.people.peopleSlim);

  //Local state
  const [newEnrollment, setNewEnrollment] = useState();

  //Hooks
  useEffect(() => {
    if (isNil(clasroomActions)) {
      dispatch(clasroomActions.listClassrooms({}));
    }
    dispatch(peopleActions.listSlimPeopleByRole({ role: 'student' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(enrollmentActions.createEnrollment(newEnrollment));
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
      <Card title="Enrollment - Create Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
          <Form.Item
            name="classroom"
            label="Classroom:"
            rules={[{ required: true, message: 'Classroom is required !' }]}>
            <ClassroomSelect
              classrooms={classrooms}
              onChange={handleSelectChange(newEnrollment, setNewEnrollment, 'classroom')}
            />
          </Form.Item>
          <Form.Item
            name="student"
            label="Student:"
            rules={[{ required: true, message: 'Student is required !' }]}>
            <PeopleSelect
              peopleSlim={students}
              onChange={handleSelectChange(newEnrollment, setNewEnrollment, 'student')}
            />
          </Form.Item>
          <Form.Item name="observation" label="Observation">
            <Input.TextArea
              onChange={handleInputChange(newEnrollment, setNewEnrollment, 'observation')}
            />
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