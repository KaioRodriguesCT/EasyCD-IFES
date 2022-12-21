//React
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

//Lodash
import map from 'lodash/map';

//Shared
import RequireAuth from '@shared/require-auth';

//Components
import Signup from '@src/components/Signup';
import NotFound from '@components/NotFound';
import Home from '@components/Home';
import Login from '@components/Login';
import Navbar from '@components/Navbar';

function AppRoutes () {
  //This method will render the routes, using the array of routes passed.
  //It will check if the route needs authentication, if not, render it without the require auth component.
  //But if needs authentication, it'll take the roles and will validate if the user are logging and allowed to acces
  //That route, if not, will calculate to where redirect the user.
  const renderRouters = (routesArray) =>
    map(routesArray, (route) => {
      const { path, key, element, roles, noAuth } = route;
      if (noAuth) {
        return <Route path={path} element={element} key={key} />;
      }
      return (
        <Route path={path} element={<RequireAuth roles={roles}>{element}</RequireAuth>} key={key} />
      );
    });

  /*Expected object on array of routes:
  {
    path: URL to the page.
    key: The route key,
    element: Function that will build the component.
    role: Array of roles that are required for access that page.,
    noAuth: Boolean, says that no need auth for that route
  }*/

  //The Unlogged routes will not share the navbar layout.
  const unloggedRoutes = [
    {
      path: '/login',
      key: 'login',
      element: <Login />,
      roles: [],
      noAuth: true
    },
    {
      path: '/signup',
      key: 'signup',
      element: <Signup />,
      roles: [],
      noAuth: true
    }
  ];

  //The logged routes will share the nav bar layout
  const loggedRoutes = [
    // {
    //   path: '/home',
    //   key: 'home',
    //   element: Home,
    //   roles: []
    // }
  ];

  // The routes should be divide between thoes that require authentication, and the authentication required.
  // Embbed components will inherit the parent components, this way we can build the navigation bar for comum pages with that bar.
  return (
    <BrowserRouter>
      <Routes>
        {renderRouters(unloggedRoutes)}
        <Route path="/" element={<Navbar />}>
          <Route
            index
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          {renderRouters(loggedRoutes)}
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRoutes;
