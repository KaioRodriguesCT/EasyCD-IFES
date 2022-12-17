//React
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

//Lodash
import map from 'lodash/map';

//App
import App from '@components/App/App';

//Components
import Register from '@components/Register';
import NotFound from '@components/NotFound';

function AppRoutes () {
  const routesObject = [
    {
      path: '/register',
      key: 'register',
      element: Register,
      roles: []
    }
  ];
  // The routes should be divide between thoes that require authentication, and the authentication required.
  // Embbed components will inherit the parent components, this way we can build the navigation bar for comum pages with that bar.

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Routes>
            {map(routesObject, (object) => {
              const { path, key, element } = object;
              return <Route path={path} element={element()} key={key} />;
            })}
          </Routes>
        </Route>
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
export default AppRoutes;
