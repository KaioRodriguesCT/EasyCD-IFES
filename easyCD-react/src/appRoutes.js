//React
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

//Lodash
import map from 'lodash/map';

//Shared
import RequireAuth from '@shared/require-auth';

//Components
import NotFound from '@components/NotFound';
import Home from '@components/Home';
import App from './components/App/App';

//Navigation Data
import { unloggedRoutes, loggedRoutes } from '@shared/router-navigation-data';

function AppRoutes () {
  //This method will render the routes, using the array of routes passed.
  //It will check if the route needs authentication, if not, render it without the require auth component.
  //But if needs authentication, it'll take the roles and will validate if the user are logging and allowed to acces
  //That route, if not, will calculate to where redirect the user.
  const renderRouters = (routesArray) =>
    map(routesArray, (route) => {
      const { path, key, element, roles, noAuth } = route;
      if (noAuth) {
        return <Route path={path} key={key} element={element} />;
      }
      return (
        <Route
          path={path}
          key={key}
          element={<RequireAuth roles={roles}>{element}</RequireAuth>}
        />
      );
    });
  // The routes should be divide between thoes that require authentication, and the authentication required.
  // Embbed components will inherit the parent components, this way we can build the navigation bar for comum pages with that bar.
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
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
        {renderRouters(unloggedRoutes)}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRoutes;
