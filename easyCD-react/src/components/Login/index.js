//React
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

//Antd
import { Button, Form, Input } from 'antd';
import { KeyOutlined, UserOutlined } from '@ant-design/icons';

//Actions
import { actions as authenticationActions } from '@redux/authentication';

//Lodash
import get from 'lodash/get';
import clone from 'lodash/clone';

//Style
import './index.css';

function Login () {
  const dispatch = useDispatch();
  const [user, setUser] = useState();

  //Handlers
  const handleInputChange = (field) => (value) => {
    const fieldText = get(value, 'target.value');
    const newUser = clone(user) || {};
    newUser[ field ] = fieldText;
    setUser(newUser);
  };

  const handlePassword = (value) => {
    const password = get(value, 'target.value');
    //const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
    const newUser = clone(user) || {};
    newUser.password = password;
    setUser(newUser);
  };

  const handleSubmit = async () => {
    dispatch(authenticationActions.userLogin(user));
  };

  return (
    <div className="login">
      <div className="login_main">
        <div className="login_main_header">
          <label className="login_main_header_title">EasyCoord</label>
        </div>
        <div className="login_main_form">
          <Form name="login_form" layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="username"
              key="username"
              rules={[{ required: true, message: 'Please insert the username' }]}>
              <Input prefix={<UserOutlined />} type="text" placeholder="User" allowClear onChange={handleInputChange('username')} />
            </Form.Item>
            <Form.Item
              name="password"
              key="password"
              rules={[{ required: true, message: 'Please insert the password' }]}>
              <Input prefix={<KeyOutlined />} type="password" placeholder="Password" allowClear onChange={handlePassword}/>
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
        <div className="login_main_footer">
          <Link to={'/signup'}>
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
