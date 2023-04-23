//Antd
import {
  AuditOutlined,
  ContainerOutlined,
  ExperimentOutlined,
  FileDoneOutlined,
  FireOutlined,
  HddOutlined,
  HomeOutlined,
  IdcardOutlined,
  ReadOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';

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
import ComplementaryActivityType from '@src/containers/ComplementaryActivityType';
import ComplementaryActivity from '@src/containers/ComplementaryActivity';
import Home from '@src/containers/Home';
import Profile from '@src/containers/Profile';
import StudentEnrollments from '@src/containers/Enrollments/StudentEnrollments';
import StudentComplementaryActivity from '@src/containers/ComplementaryActivity/StudentComplementaryActivity';
import StudentSolicitations from '@src/containers/Solicitations/StudentSolicitations';
import TeacherClassrooms from '@src/containers/Classrooms/TeacherClassrooms';
import CoordinatorCourses from '@src/containers/Courses/CoordinatorCourses';

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
    path: '/',
    key: 'home',
    label: 'Home',
    element: <Home />,
    icon: <HomeOutlined />,
    roles: ['student', 'admin', 'teacher']
  },
  {
    path: '/profile',
    key: 'profile',
    label: 'Profile',
    element: <Profile/>,
    icon: <UserOutlined />,
    roles: ['student', 'admin', 'teacher']
  },
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
  },
  {
    path: '/complementary-activity-types',
    key: 'complementary-activity-types',
    label: 'CA Types',
    element: <ComplementaryActivityType />,
    icon: <AuditOutlined />,
    roles: ['admin']
  },
  {
    path: '/complementary-activities',
    key: 'complementary-activities',
    label: 'C. Activities',
    element: <ComplementaryActivity />,
    icon: <FileDoneOutlined />,
    roles: ['admin']
  },
  //Students menu items
  {
    path: '/student/enrollments',
    key: 'student-enrollments',
    label: 'Enrollments',
    element: <StudentEnrollments/>,
    icon: <IdcardOutlined/>,
    roles: ['student']
  },
  {
    path: '/student/complementary-activities',
    key: 'student-complementary-activities',
    label: 'C. Activities',
    element: <StudentComplementaryActivity/>,
    icon: <FileDoneOutlined/>,
    roles: ['student']
  },
  {
    path: '/student/solicitations',
    key: 'student-solicitations',
    label: 'Solicitations',
    element: <StudentSolicitations/>,
    icon: <FireOutlined/>,
    roles: ['student']
  },
  //Teacher menu items
  {
    path: '/teacher/classrooms',
    key: 'teacher-classrooms',
    label: 'Classrooms',
    element: <TeacherClassrooms/>,
    icon: <ContainerOutlined/>,
    roles: ['teacher']
  },
  {
    path: '/teacher/courses',
    key: 'teacher-courses',
    label: 'Courses',
    element: <CoordinatorCourses/>,
    icon: <ExperimentOutlined/>,
    roles: ['teacher']
  },
  {
    path: '/teacher/solictations',
    key: 'teacher-solictations',
    label: 'Solicitations',
    element: null,
    icon: <FireOutlined/>,
    roles: ['teacher']
  }
];
