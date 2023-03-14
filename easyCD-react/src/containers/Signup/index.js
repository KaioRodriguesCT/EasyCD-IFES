//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

//Antd
import { UserAddOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select, Space } from 'antd';

//Lodash
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

//Style
import './index.css';

//Handlers
import { handleInputChange, handleSelectChange } from '@src/shared/handlers';

//Actions
import { actions as userActions } from '@redux/user';

// eslint-disable-next-line max-lines-per-function, max-statements
function Signup () {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //Redux State
  // const isCreatingUser = useSelector((state) => get(state, 'user.isCreatingUser'));
  const userSuccessfullyCreated = useSelector((state) =>
    get(state, 'user.userSuccessfullyCreated')
  );

  //Local state
  const rowGutter = 12;
  const [newUser, setNewUser] = useState();

  ///Hooks
  useEffect(() => {
    if (userSuccessfullyCreated) {
      dispatch(userActions.changeField('userSuccessfullyCreated', false));
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSuccessfullyCreated]);

  //Handlers
  const handleSubmit = () => {
    dispatch(userActions.userCreate(newUser));
  };

  //Renders
  const renderUserInput = () => {
    const fieldName = 'username';
    return (
      <Form.Item name={fieldName} rules={[{ required: true, message: 'Username is required' }]}>
        <Input
          placeholder="Username"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };

  const renderPasswordInput = () => {
    const fieldName = 'password';
    return (
      <Form.Item name={fieldName} rules={[{ required: true, message: 'Password is required' }]}>
        <Input
          type="password"
          placeholder="Password"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };

  const renderNameInput = () => {
    const fieldName = 'firstname';
    return (
      <Form.Item name={fieldName} rules={[{ required: true, message: 'Firstname is required' }]}>
        <Input
          placeholder="Firstname"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };
  const renderSurnameInput = () => {
    const fieldName = 'surname';
    return (
      <Form.Item name={fieldName} rules={[{ required: true, message: 'Surname is required' }]}>
        <Input
          placeholder="Surname"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };

  const renderPhoneInput = () => {
    const fieldName = 'phone';
    return (
      <Form.Item name={fieldName}>
        <Input
          placeholder="Phone"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };

  const renderEmailInput = () => {
    const fieldName = 'email';
    return (
      <Form.Item name={fieldName} rules={[{ required: true, message: 'Email is required' }]}>
        <Input
          type="email"
          placeholder="Email"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };

  const renderAddressInput = () => {
    const fieldName = 'address';
    return (
      <Form.Item name={fieldName}>
        <Input
          placeholder="Address"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };

  const renderRoleSelect = () => {
    const fieldName = 'role';
    const options = [
      {
        label: 'Teacher',
        value: 'teacher'
      },
      {
        label: 'Student',
        value: 'student'
      }
    ];
    return (
      <Form.Item name={fieldName} rules={[{ required: true, message: 'Role is required' }]}>
        <Select
          options={options}
          onChange={handleSelectChange(newUser, setNewUser, 'role')}
          placeholder="Role"
          allowClear
        />
      </Form.Item>
    );
  };

  const renderSiapeInput = () => {
    const fieldName = 'siape';
    return (
      <Form.Item
        name={fieldName}
        rules={[
          {
            required: isEqual(get(newUser, 'role'), 'teacher'),
            message: 'Siape is required for teachers'
          }
        ]}>
        <Input
          placeholder="Siape"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };

  const renderCityInput = () => {
    const fieldName = 'city';
    return (
      <Form.Item name={fieldName}>
        <Input
          placeholder="City"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };

  const rendeUFInput = () => {
    const fieldName = 'uf';
    return (
      <Form.Item name={fieldName}>
        <Input
          placeholder="UF"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };

  const renderRegistrationInput = () => {
    const fieldName = 'registration';
    return (
      <Form.Item
        name={fieldName}
        rules={[
          {
            required: isEqual(get(newUser, 'role'), 'student'),
            message: 'Registration is required for students'
          }
        ]}>
        <Input
          placeholder="Registration"
          onChange={handleInputChange(newUser, setNewUser, fieldName)}
          allowClear
        />
      </Form.Item>
    );
  };

  const renderUserInformationSection = () => {
    return (
      <div className="signup_user_section">
        <Row style={{ marginBottom: '10px' }}>
          <Col span={24}>
            <label className="subtitle_label">User Information</label>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Row gutter={rowGutter}>
              <Col span={12}>
                <Row>
                  <Col span={24}>{renderUserInput()}</Col>
                </Row>
                <Row>
                  <Col span={24}>{renderRoleSelect()}</Col>
                </Row>
              </Col>
              <Col span={12}>
                <Row>
                  <Col span={24}>{renderPasswordInput()}</Col>
                </Row>
                <Row>
                  <Col span={24}>
                    {isEqual(get(newUser, 'role'), 'teacher') && renderSiapeInput()}
                    {isEqual(get(newUser, 'role'), 'student') && renderRegistrationInput()}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  const renderPersonalInformation = () => {
    return (
      <div className="signup_personal_section">
        <Row style={{ marginBottom: '10px' }}>
          <Col span={24}>
            <label className="subtitle_label">Personal Information</label>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Row gutter={rowGutter}>
              <Col span={12}>
                <Row>
                  <Col span={24}>{renderNameInput()}</Col>
                </Row>
                <Row>
                  <Col span={24}>{renderPhoneInput()}</Col>
                </Row>
                <Row>
                  <Col span={24}>{renderCityInput()}</Col>
                </Row>
              </Col>
              <Col span={12}>
                <Row>
                  <Col span={24}>{renderSurnameInput()}</Col>
                </Row>
                <Row>
                  <Col span={24}>{renderEmailInput()}</Col>
                </Row>
                <Row>
                  <Col span={24}>{rendeUFInput()}</Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={24}>{renderAddressInput()}</Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  const renderCancelButton = () => {
    return (
      <Form.Item>
        <Link to={'/login'}>
          {' '}
          <Button type="text" className="cancel_button">
            Cancel
          </Button>
        </Link>
      </Form.Item>
    );
  };

  const renderSignupButton = () => {
    return (
      <Form.Item>
        <Button htmlType="submit" className="signup_button">
          Signup
        </Button>
      </Form.Item>
    );
  };

  const renderForm = () => {
    return (
      <div className="signup_form">
        <Form name="signup-form" onFinish={handleSubmit}>
          <Row>
            <Col span={24}>{renderUserInformationSection()}</Col>
          </Row>
          <Row>
            <Col span={24}>{renderPersonalInformation()}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space direction="horizontal">
                {renderCancelButton()}
                {renderSignupButton()}
              </Space>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  return (
    <div className="signup">
      <Row className="signup_main">
        <Col span={24}>
          <Row>
            <Col span={24} className="signup_main_header">
              <Space direction="horizontal">
                <label className="title_label">EasyCoord - Signup</label>
                <UserAddOutlined className="title_icon" />
              </Space>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="signup_main_body">
              {renderForm()}
            </Col>
          </Row>
          <Row>
            <Col className="signup_main_footer"></Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
export default Signup;
