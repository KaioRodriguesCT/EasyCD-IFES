//React
import React from 'react';
import ReactDOM from 'react-dom/client';

//Redux
import { Provider } from 'react-redux';

//Redux Persist
import { PersistGate } from 'redux-persist/integration/react';

//Store
import { store, persistor } from '@src/redux/store';

//Routes
import AppRoutes from '@src/appRoutes';

//Default styles
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppRoutes/>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);