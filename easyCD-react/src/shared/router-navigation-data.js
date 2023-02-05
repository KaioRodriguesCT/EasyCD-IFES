//Antd
import { ExperimentOutlined, TeamOutlined } from '@ant-design/icons';

//Components
import Courses from '@src/containers/Courses';
import Login from '@src/containers/Login';
import People from '@src/containers/People';
import Signup from '@src/containers/Signup';

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
  {
    path: '/courses',
    key: 'courses-list',
    label: 'Courses',
    element: <Courses />,
    icon: <ExperimentOutlined />,
    roles: ['teacher']
  },
  {
    path: '/people',
    key: 'people-list',
    label: 'People',
    element: <People />,
    icon: <TeamOutlined />,
    roles: ['admin']
  }
];
