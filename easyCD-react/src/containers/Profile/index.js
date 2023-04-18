//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Copmponents
import ComponentFooter from '@src/components/ComponentFooter';
import ComponentHeader from '@src/components/ComponentHeader';

//Redux
import { Card, Col, Divider, Form, Input, Row, Tooltip } from 'antd';

//Lodash
import clone from 'lodash/clone';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';

//Handlers
import { handleInputChange } from '@src/shared/handlers';

//Components
import FormActionButtons from '@src/components/SharedComponents/FormActionButtons';

//Actions
import { actions as userActions } from '@redux/user';

//Style
import './index.css';
function Profile () {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [updatedUser, setUpdatedUser] = useState();
  const [updatedPerson, setUpdatedPerson] = useState();

  //Redux state
  const user = useSelector((state) => state.authentication.user);

  useEffect(() => {
    if (user) {
      setUpdatedUser(user);
      setUpdatedPerson(user.person);
      handleResetDefaultForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  //Dat
  const getInitialValues = () => {
    return { ...getUserInitialValues(), ...getPersonInitialValues() };
  };

  const getUserInitialValues = () => {
    const fields = ['username', 'registration', 'siape'];
    return pick(user, fields);
  };
  const getPersonInitialValues = () => {
    const fields = ['firstname', 'surname', 'email', 'phone', 'city', 'uf', 'address'];
    return pick(get(user, 'person'), fields);
  };

  //Handlers
  const handleSubmit = async () => {
    await form.validateFields();
    const newUser = clone(updatedUser) || {};
    if(updatedPerson){
      newUser.person = { ...updatedPerson, _id: get(user,'person._id') };
    }
    dispatch(userActions.updateUserAndPerson({ ...newUser, _id: get(user, '_id') }));
    await form.resetFields();
  };

  const handleResetDefaultForm = async () => {
    await form.setFieldsValue({
      ...getUserInitialValues(),
      ...getPersonInitialValues()
    });
  };

  const handleCancel = async () => {
    await form.resetFields();
    await handleResetDefaultForm();
  };

  const handleInputChangeL = (field, obj) => {
    switch (obj) {
      case 'user':
        return handleInputChange(updatedUser, setUpdatedUser, field);
      case 'person':
        return handleInputChange(updatedPerson, setUpdatedPerson, field);
      default:
        return null;
    }
  };

  ///Renders
  const renderForm = () => {
    return (
      <Card style={{ position: 'unset' }}>
        <Form
          form={form}
          layout="horizontal"
          initialValues={getInitialValues()}
          onFinish={handleSubmit}
          style={{ position:'unset !important' }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Divider orientation="left">Personal information</Divider>
              <Form.Item
                label="Firstname"
                name="firstname"
                rules={[{ required: true, message: 'Firstname is required' }]}
              >
                <Input
                  placeholder="Firstname"
                  onChange={handleInputChangeL('firstname', 'person')}
                />
              </Form.Item>
              <Form.Item
                label="Surname"
                name="surname"
                rules={[{ required: true, message: 'Surname is required' }]}
              >
                <Input placeholder="Surname" onChange={handleInputChangeL('surname', 'person')} />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: 'Email is required' }]}
              >
                <Input
                  type="email"
                  placeholder="Email"
                  onChange={handleInputChangeL('email', 'person')}
                />
              </Form.Item>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: 'Phone is required' }]}
              >
                <Input placeholder="Phone" onChange={handleInputChangeL('phone', 'person')} />
              </Form.Item>
              <Form.Item label="City" name="city">
                <Input placeholder="City" onChange={handleInputChangeL('city', 'person')} />
              </Form.Item>
              <Form.Item label="Address" name="address">
                <Input placeholder="Address" onChange={handleInputChangeL('address', 'person')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Divider orientation="left">User information</Divider>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Username is required' }]}
              >
                <Input placeholder="Username" disabled />
              </Form.Item>
              {isEqual(get(user, 'role'), 'student') ? (
                <Form.Item label="Registration" name="registration">
                  <Input
                    placeholder="Registration"
                    onChange={handleInputChangeL('registration', 'user')}
                  />
                </Form.Item>
              ) : null}
              {isEqual(get(user, 'role'), 'teacher') ? (
                <Form.Item label="Siape" name="siape">
                  <Input placeholder="Siape" onChange={handleInputChangeL('siape', 'user')} />
                </Form.Item>
              ) : null}
              <Tooltip title="For update passowrd, confirm the previous password and the new one">
                <Form.Item label="Old password" name="password">
                  <Input
                    placeholder="Insert here your actual password"
                    onChange={handleInputChangeL('password', 'user')}
                  />
                </Form.Item>
                <Form.Item label="New Password" name="newPassword">
                  <Input.Password
                    placeholder="Insert here the new password"
                    onChange={handleInputChangeL('newPassword', 'user')}
                  />
                </Form.Item>
                <Form.Item
                  label="Password Confirmation"
                  name="confirmPassword"
                  rules={[
                    {
                      required: true,
                      validator: (rules, value, callback) => {
                        if (isEqual(updatedUser.newPassword, value)) {
                          return Promise.resolve(true);
                        }
                        return callback('New passwords do not match');
                      }
                    }
                  ]}
                >
                  <Input.Password placeholder="Confirm your new password" />
                </Form.Item>
              </Tooltip>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              {FormActionButtons({ onCancel: handleCancel })}
            </Col>
          </Row>
        </Form>
      </Card>
    );
  };
  return (
    <>
      <div className="container_home">
        <ComponentHeader title="Profile" />
        <div className="container_body">{renderForm()}</div>
        <ComponentFooter />
      </div>
    </>
  );
}
export default Profile;
