// React
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Antd
import { Button } from 'antd';

//Lodash
import get from 'lodash/get';

// Actions
import { actions as testeActions } from '@redux/redux-with-saga-example';

// Components
import UnloggedHome from '@src/components/UnloggedHome';

// Style
import './App.css';
import { Outlet } from 'react-router-dom';

function App () {
  const dispatch = useDispatch();

  // Redux state
  const example = useSelector((state) => state.reducerExample.name);
  //const user = useSelector((state) => get(state, 'authentication.user'));

  // Renders
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

  return (
    <div className="App">
      {renderHelloWorld()}
      <Outlet/>
    </div>
  );
}

export default App;
