import React from 'react';
import { useSelector } from 'react-redux';
import './App.css';

function App () {
  const example = useSelector((state) => state.reducerExample.name);
  return (
    <div className="App">
      <header className="App-header">
        <h1>HELLO WORLD !! {example}</h1>
      </header>
    </div>
  );
}

export default App;
