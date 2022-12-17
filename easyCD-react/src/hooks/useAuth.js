//React
import { useContext } from 'react';

import AuthContext from '@src/shared/auth-provider';

const useAuth = () => useContext(AuthContext);

export default useAuth;