// React
import React from 'react';
import { Outlet } from 'react-router-dom';

// Actions
import { unloggedRoutes, loggedRoutes } from '@src/shared/router-navigation-data';

//Components
import MenuBar from '../MenuBar';

// Style
import './index.css';

function App () {
  // Renders
  return (
    <div className="app">
      <MenuBar
        routerNavigationData={[...unloggedRoutes, ...loggedRoutes]}
      />
      <div className="app-content">
        <Outlet/>
      </div>
    </div>
  );
}

export default App;
