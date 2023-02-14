//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Form, Input, Space } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';

//Lodash
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';

//Actions
import { actions as peopleActions } from '@redux/people';
import { actions as courseActions } from '@redux/courses';

//Components
import CoordinatorSelect from '@src/components/Person/CoordinatorSelect';

//Handlers
import { handleInputChange, handleSelectChange } from '@src/shared/handlers';

function CreateForm ({ closeModal }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const peopleSlim = useSelector((state) => state.people.peopleSlim);
  const isLoading = useSelector((state) => state.people.isLoading);

  //Local state
  const [newCourse, setNewCourse] = useState();

  //Hooks
  useEffect(()=> {
    if(isNil(peopleSlim) && !isLoading){
      dispatch(peopleActions.listSlimPeople({ filters:{ role:'teacher' } }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[isLoading, peopleSlim]);

  //Handlers
  const onFormSubmit = async (values) => {
    await form.validateFields();
    dispatch(courseActions.createCourse(newCourse));
    if(isFunction(closeModal)){
      closeModal();
    }
  };

  const onCancel = () => {
    if(isFunction(closeModal)){
      closeModal();
      form.resetFields();
    }
  };

  //Renders
  const renderForm = () => {
    return (
      <Card title="Course - Create Form">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFormSubmit}
        >
          <Form.Item name="name" label="Name:" rules={[{ required: true, message:'Name is required !' }]}>
            <Input type="text" onChange={handleInputChange(newCourse, setNewCourse, 'name')}/>
          </Form.Item>
          <Form.Item name="coordinator" label="Coordinator:" rules={[{ required: true, message:'Coordinator is required !' }]}>
            <CoordinatorSelect peopleSlim={peopleSlim} onChange={handleSelectChange(newCourse, setNewCourse,'coordinator')} />
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