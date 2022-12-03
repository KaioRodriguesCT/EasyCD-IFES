import { Button } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';

import { actions as testeActions } from '@redux/redux-with-saga-example';

function App () {
  const dispatch = useDispatch();
  const example = useSelector((state) => state.reducerExample.name);
  return (
    <div className="App">
      <header className="App-header">
        <h1>HELLO WORLD !! {example}</h1>
        <Button
          onClick={() => {
            dispatch(testeActions.actionExample());
          }}
        ></Button>
      </header>
    </div>
  );
}

export default App;
