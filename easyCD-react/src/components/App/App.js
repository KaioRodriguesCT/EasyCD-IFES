// React
import React from 'react';
import { Outlet } from 'react-router-dom';

// Actions
import { unloggedRoutes, loggedRoutes } from '@src/shared/router-navigation-data';

//Components
import MenuBar from '../MenuBar';

// Style
import './App.css';

function App () {
  // Renders


  return (
    <div className="app">
      <div className="app-content">
        <div className="app-navbar">
          <MenuBar
            routerNavigationData={[...unloggedRoutes, ...loggedRoutes]}
          />
        </div>
        <div className="app-body">
          <Outlet/>
        </div>
      </div>
    </div>
  );
}

export default App;
