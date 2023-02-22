//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, Space } from 'antd';

//Lodash
import clone from 'lodash/clone';
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';

//Handlers
import { handleInputChange, handleSelectChange } from '@src/shared/handlers';

//Actions
import { actions as courseActions } from '@redux/courses';
import { actions as curriculumGrideActions } from '@redux/curriculum-grides';

//Components
import CourseSelect from '@components/Course/CourseSelect';

function CreateForm ({ closeModal }){
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const courses = useSelector((state) => state.courses.courses);

  //Local state
  const [newCurriculumGride, setNewCurriculumGride] = useState();

  //Hooks
  useEffect(() => {
    if(isNil(courses)){
      dispatch(courseActions.listCourses({}));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(curriculumGrideActions.createCurriculumGride(newCurriculumGride));
    if(isFunction(closeModal)){
      closeModal();
    }
    await form.resetFields();
  };

  const onCancel = async () => {
    if(isFunction(closeModal)){
      closeModal();
    }
    await form.resetFields();
  };

  const handlePeriodChange = (range) => {
    const [start, end] = range || [];
    const actualCurriculumGride = clone(newCurriculumGride) || {};
    actualCurriculumGride[ 'dtStart' ] = start ? start.format('YYYY-MM-DD') : null;
    actualCurriculumGride[ 'dtEnd' ] = end ? end.format('YYYY-MM-DD') : null;
    setNewCurriculumGride(actualCurriculumGride);
  };

  //Renders
  const renderForm = () => {
    return (
      <Card title="Curriculum Gride - Create Form">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFormSubmit}
        >
          <Form.Item name="name" label="Name:" rules={[{ required: true, message: 'Name is required !' }]}>
            <Input type="text" onChange={handleInputChange(newCurriculumGride, setNewCurriculumGride, 'name')}/>
          </Form.Item>
          <Form.Item name="course" label="Course:" rules={[{ required: true, message: 'Course is required !' }]}>
            <CourseSelect courses={courses} onChange={handleSelectChange(newCurriculumGride, setNewCurriculumGride, 'course')}/>
          </Form.Item>
          <Form.Item name="range" label="Period:" rules={[{ required: true, message: 'Range is required !' }]}>
            <DatePicker.RangePicker onChange={handlePeriodChange}/>
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