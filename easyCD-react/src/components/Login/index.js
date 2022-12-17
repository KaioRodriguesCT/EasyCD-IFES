//React
import React from 'react';

//Antd
import { Button, Form, Input } from 'antd';
import { KeyOutlined, UserOutlined } from '@ant-design/icons';

//Style
import './index.css';
import { Link } from 'react-router-dom';

function Login () {
  //Handlers
  const handleSubmit = (formValues) => {
    console.log('Submit', formValues);
  };

  return (
    <div className="login">
      <div className="login_main">
        <div className="login_header">
          <label className="login_title">EasyCoord</label>
        </div>
        <div className="login_form">
          <Form name="login_form" layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="username"
              key="username"
              rules={[{ required: true, message: 'Please insert the username' }]}>
              <Input prefix={<UserOutlined />} type="text" placeholder="User" allowClear />
            </Form.Item>
            <Form.Item
              name="password"
              key="password"
              rules={[{ required: true, message: 'Please insert the password' }]}>
              <Input prefix={<KeyOutlined />} type="password" placeholder="Password" allowClear/>
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="ghost" className="login_button">
                Sign In
              </Button>
              <div className="forgot_password_button">
                <Link to={'/password-recovery'} className="forgot_password_button">
                  Forgot my password...
                </Link>
              </div>
            </Form.Item>
          </Form>
        </div>
        <div className="login-footer">
          <Link to={'/register'}>
            <Button type="ghost" className="register_button">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Login;
