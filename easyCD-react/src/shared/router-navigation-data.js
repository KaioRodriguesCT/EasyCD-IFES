//Antd
import { ContainerOutlined, ExperimentOutlined, FireOutlined, HddOutlined, IdcardOutlined, ReadOutlined, TagOutlined, TeamOutlined } from '@ant-design/icons';

//Components
import Courses from '@src/containers/Courses';
import CurriculumGride from '@src/containers/CurriculumGride';
import Login from '@src/containers/Login';
import People from '@src/containers/People';
import Signup from '@src/containers/Signup';
import Subjects from '@src/containers/Subjects';
import Classrooms from '@src/containers/Classrooms';
import Enrollments from '@src/containers/Enrollments';
import SolicitationTypes from '@src/containers/SolicitationTypes';
import Solicitations from '@src/containers/Solicitations';

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
    roles: ['admin']
  },
  {
    path: '/people',
    key: 'people-list',
    label: 'People',
    element: <People />,
    icon: <TeamOutlined />,
    roles: ['admin']
  },
  {
    path: '/curriculum-grids',
    key: 'curriculum-grid',
    label: 'Curriculum Grid',
    element: <CurriculumGride />,
    icon: <HddOutlined />,
    roles: ['admin']
  },
  {
    path: '/subjects',
    key: 'subjects',
    label: 'Subjects',
    element: <Subjects />,
    icon: <ReadOutlined />,
    roles: ['admin']
  },
  {
    path: '/classrooms',
    key: 'classrooms',
    label: 'Classrooms',
    element: <Classrooms />,
    icon: <ContainerOutlined />,
    roles: ['admin']
  },
  {
    path: '/enrollments',
    key: 'enrollments',
    label: 'Enrollments',
    element: <Enrollments />,
    icon: <IdcardOutlined />,
    roles: ['admin']
  },
  {
    path: '/solicitation-types',
    key: 'solicitation-types',
    label: 'Solicitation Types',
    element: <SolicitationTypes />,
    icon: <TagOutlined />,
    roles: ['admin']
  },
  {
    path: '/solicitations',
    key: 'solicitations',
    label: 'Solicitations',
    element: <Solicitations />,
    icon: <FireOutlined />,
    roles: ['admin']
  }
];
