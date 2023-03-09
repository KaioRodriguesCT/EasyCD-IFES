//React
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, Space, Switch } from 'antd';

//Actions
import { actions as courseActions } from '@redux/courses';
import { actions as curriculumGrideActions } from '@redux/curriculum-grides';

//Lodash
import clone from 'lodash/clone';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';

//Components
import ComponentSelect from '@src/components/SharedComponents/ComponentSelect';

import dayjs from 'dayjs';

//Handlers
import { handleInputChange, handleSelectChange, handleSwitchChange } from '@src/shared/handlers';

function UpdateForm ({ curriculumGride, closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux State
  const courses = useSelector((state) => state.courses.courses);

  //Local state
  const [newCurriculumGride, setNewCurriculumGride] = useState(curriculumGride);

  //Data
  const initialValues = useMemo(() => {
    const dtStart = get(curriculumGride, 'dtStart') || null;
    const dtEnd = get(curriculumGride, 'dtEnd') || null;
    return {
      ...curriculumGride,
      range:
        dtStart && dtEnd ? [dayjs(dtStart, 'YYYY-MM-DD'), dayjs(dtEnd, 'YYYY-MM-DD')] : undefined
    };
  }, [curriculumGride]);

  //Hooks
  useEffect(() => {
    dispatch(courseActions.listCourses());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNewCurriculumGride(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(curriculumGrideActions.updateCurriculumGride(newCurriculumGride));
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
      <Card title="Curriculum Gride - Update Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit} initialValues={initialValues}>
          <Form.Item
            name="name"
            label="Name:"
            rules={[{ required: true, message: 'Name is required !' }]}>
            <Input
              type="text"
              onChange={handleInputChange(newCurriculumGride, setNewCurriculumGride, 'name')}
            />
          </Form.Item>
          <Form.Item
            valuePropName="defaultValue"
            name="course"
            label="Course:"
            rules={[{ required: true, message: 'Course is required !' }]}>
            <ComponentSelect
              data={courses}
              mapOptions={(course) => ({
                label: course.name,
                value: course._id
              })}
              onChange={handleSelectChange(newCurriculumGride, setNewCurriculumGride, 'course')}
              placeholder="Select Course"
            />
          </Form.Item>
          <Form.Item
            name="range"
            label="Period:"
            rules={[{ required: true, message: 'Range is required !' }]}>
            <DatePicker.RangePicker onChange={handlePeriodChange} />
          </Form.Item>
          <Form.Item
            valuePropName="checked"
            name="isActive"
            label="Is Active:"
          >
            <Switch onChange={handleSwitchChange(newCurriculumGride, setNewCurriculumGride, 'isActive')}/>
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
