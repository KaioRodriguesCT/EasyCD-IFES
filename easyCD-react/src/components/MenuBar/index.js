//React
import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

//Antd
import { Menu } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

//Lodash
import filter from 'lodash/filter';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import map from 'lodash/map';

//Style
import './index.css';

function MenuBar ({ routerNavigationData }) {

  //Local state
  const [collapsed, setCollapsed] = useState(false);

  //Redux
  const user = useSelector((state) => state.authentication.user);

  //Handlers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCollapse = (value) => setCollapsed(isNil(value) ? value : !collapsed);

  //Data
  const buildMenuItem = useCallback(
    ({ path, key, roles, icon, label }) => {
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
      key: 'collpase',
      label: '',
      icon: (
        <div onClick={handleCollapse}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      ),
      disabled: true
    };
    return [collapseItem, ...routerItems];
  }, [buildMenuItem, collapsed, handleCollapse, routerNavigationData]);

  return (
    <div className="menu-app">
      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        items={menuItems}
        style={{ height: '100%' }}
        className="menu-component"
      />
    </div>
  );
}
export default MenuBar;
