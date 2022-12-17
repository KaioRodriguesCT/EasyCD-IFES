//React
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

//Lodash
import get from 'lodash/get';

function RequireAuth () {
  const location = useLocation();
  const user = useSelector((state) => get(state, 'authentication.user'));

  //Check if exists user, if not user, return to login page
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}
export default RequireAuth;
