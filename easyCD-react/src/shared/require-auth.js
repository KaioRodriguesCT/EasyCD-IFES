//React
import { useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

//Lodash
import get from 'lodash/get';

function RequireAuth ({ children }) {
  const location = useLocation();
  const user = useSelector((state) => get(state, 'authentication.user'));

  //Check if exists user, if not user, return to login page
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}
export default RequireAuth;
