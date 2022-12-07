// React
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Antd
import { Button } from 'antd';

// Actions
import { actions as testeActions } from '@redux/redux-with-saga-example';

// Components
import UnloggedHome from '@src/components/UnloggedHome';

// Style
import './App.css';

function App () {
  const dispatch = useDispatch();

  // Redux state
  const example = useSelector((state) => state.reducerExample.name);
  const user = useSelector((state) => state.authentication.user);

  // Renders
  const renderUnloggedHome = () => {
    return (
      <>
        <UnloggedHome />
      </>
    );
  };

  const renderLoggedHome = () => {
    return null;
  };

  const renderHelloWorld = () => {
    return (
      <header className="App-header">
        <h1>HELLO WORLD !! {example}</h1>
        <Button
          onClick={() => {
            dispatch(testeActions.actionExample());
          }}
        ></Button>
      </header>
    );
  };

  const renderApp = () => {
    if (user) {
      return renderLoggedHome();
    }
    return renderUnloggedHome();
  };

  return (
    <div className="App">
      {/* {renderApp()} */}
      {renderHelloWorld()}
    </div>
  );
}

export default App;
