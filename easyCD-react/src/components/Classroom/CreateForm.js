//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Form, Input, InputNumber, Space, Switch } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';

//Actions
import { actions as subjectActions } from '@redux/subjects';
import { actions as clasroomActions } from '@redux/classrooms';
import { actions as peopleActions } from '@redux/people';

//Lodash
import clone from 'lodash/clone';
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';

//Components
import SubjectSelect from '../Subject/SubjectSelect';
import ClassTimesPicker from './ClassTimesPicker';
import PeopleSelect from '../Person/PeopleSelect';

//Handlers
import {
  handleInputChange,
  handleInputNumberChange,
  handleSelectChange,
  handleSwitchChange
} from '@src/shared/handlers';

function CreateForm ({ closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const subjects = useSelector((state) => state.subjects.subjects);
  const peopleSlim = useSelector((state) => state.people.peopleSlim);

  //Local state
  const [newClassroom, setNewClassroom] = useState();

  //Hooks
  useEffect(() => {
    if (isNil(subjects)) {
      dispatch(subjectActions.listSubjects({}));
    }
    if(isNil(peopleSlim)){
      dispatch(peopleActions.listSlimPeopleByRole({ role: 'teacher' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(clasroomActions.createClassroom(newClassroom));
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

  const handleInputChangeLocal = (field) => handleInputChange(newClassroom, setNewClassroom, field);

  const handleInputNumberChangeLocal = (field) =>
    handleInputNumberChange(newClassroom, setNewClassroom, field);

  const handleSwitchChangeLocal = (field) => handleSwitchChange(newClassroom,setNewClassroom,field);

  const handleClassTimesPickerChange = (classTimes) => {
    const actualClassroom = clone(newClassroom) || {};
    actualClassroom.classTimes = classTimes;
    setNewClassroom(actualClassroom);
  };

  //Renders
  const renderForm = () => {
    return (
      <Card title="Classroom - Create Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
          <Form.Item
            name="subject"
            label="Subject:"
            rules={[{ required: true, message: 'Subject is required !' }]}>
            <SubjectSelect
              subjects={subjects}
              onChange={handleSelectChange(newClassroom, setNewClassroom, 'subject')}
            />
          </Form.Item>
          <Form.Item
            name="semester"
            label="Semester:"
            rules={[
              {
                pattern: new RegExp(/^\d{4}\/([12])$/),
                required: true,
                message: 'Wrong Format !'
              },
              {
                required: true,
                message: 'Semester is Required'
              }
            ]}>
            <Input
              placeholder="Example: 2023/01"
              type="text"
              onChange={handleInputChangeLocal('semester')}
            />
          </Form.Item>
          <Space direction="horizontal" size="large">
            <Form.Item
              name="enrollmentsLimit"
              label="Enrollments Limit:"
            >
              <InputNumber min={0} onChange={handleInputNumberChangeLocal('enrollmentsLimit')}/>
            </Form.Item>
            <Form.Item
              name="allowExceedLimit"
              label="Allow Exceed Limit:"
            >
              <Switch onChange={handleSwitchChangeLocal('allowExceedLimit')} defa/>
            </Form.Item>
          </Space>
          <Form.Item
            name="classTimes"
            label="Class Times:"
          >
            <ClassTimesPicker onChange={handleClassTimesPickerChange}/>
          </Form.Item>
          <Form.Item
            name="teacher"
            label="Teacher:"
            rules={[{ required: true, message: 'Teacher is required !' }]}>
            <PeopleSelect
              peopleSlim={peopleSlim}
              onChange={handleSelectChange(newClassroom, setNewClassroom, 'teacher')}
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
