//React
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

//Antd
import { Menu } from 'antd';
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

//Lodash
import filter from 'lodash/filter';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import map from 'lodash/map';
import find from 'lodash/find';

//Actions
import { actions as authenticationActions } from '@redux/authentication';

//Style
import './index.css';

function MenuBar ({ routerNavigationData }) {
  //Local state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);

  //Redux
  const user = useSelector((state) => state.authentication.user);

  //Handlers
  const handleCollapse = () => setCollapsed(!collapsed);

  const handleItemClick = (e) => {
    const key = get(e, 'key');

    if (isEqual(key, 'collpase-button')) {
      return handleCollapse();
    }
    if(isEqual(key,'logout-button')){
      dispatch(authenticationActions.userLogout());
      navigate('/login');
    }
    const router = find(routerNavigationData, { key: key });
    navigate(get(router, 'path'));
  };

  //Data
  const buildMenuItem = useCallback(
    ({ key, roles, icon, label }) => {
      const allowedToSeeMenuItem =
        includes(roles, get(user, 'role')) || isEqual(get(user, 'role'), 'admin');
      if (allowedToSeeMenuItem) {
        return {
          key,
          icon,
          label
        };
      }
      return null;
    },
    [user]
  );

  const menuItems = useMemo(() => {
    const items = map(routerNavigationData, (navigationItem) => buildMenuItem(navigationItem));
    const routerItems = filter(items, (item) => !isNil(item));
    const collapseItem = {
      key: 'collpase-button',
      label: collapsed ? 'Open' : 'Close',
      icon: collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
    };

    const logoutItem = {
      key: 'logout-button',
      label:'Logout',
      icon: <LogoutOutlined />
    };


    return [collapseItem, ...routerItems, logoutItem];
  }, [buildMenuItem, collapsed, routerNavigationData]);

  return (
    <div className="menu-app">
      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        items={menuItems}
        style={{ height: '100%' }}
        onClick={handleItemClick}
        className="menu-component"
        onBlur={() => setCollapsed(true)}
      />
    </div>
  );
}
export default MenuBar;
