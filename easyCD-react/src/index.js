//Essentials
import reportWebVitals from '@src/reportWebVitals';

//React
import React from 'react';
import ReactDOM from 'react-dom/client';

//Redux
import { Provider } from 'react-redux';

//Redux Persist
import { PersistGate } from 'redux-persist/integration/react';

//Routes
import AppRoutes from '@src/appRoutes';

//Store
import { store, persistor } from '@src/redux/store';

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
