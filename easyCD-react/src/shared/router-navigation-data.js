//Components
import Login from '@src/components/Login';
import Signup from '@src/components/Signup';

/*Expected object on array of routes:
  {
    path: URL to the page.
    key: The route key,
    element: Function that will build the component.
    role: Array of roles that are required for access that page.,
    noAuth: Boolean, says that no need auth for that route
  }*/
//The Unlogged routes will not share the navbar layout.
export const unloggedRoutes = [
  {
    path: '/login',
    key: 'login',
    label: 'Login',
    element: <Login />,
    roles: [],
    noAuth: true
  },
  {
    path: '/signup',
    key: 'signup',
    label: 'Signup',
    element: <Signup />,
    roles: [],
    noAuth: true
  }
];

//The logged routes will share the nav bar layout
export const loggedRoutes = [
];
