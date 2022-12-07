//React
import React from 'react';
import { Router  } from 'react-router-dom';

//History
import history from './history';

//App
import App from '@components/App/App';

function Routes (){
  return (
    <Router location={history}>
      <App>
      </App>
    </Router>
  );
}
export default Routes;