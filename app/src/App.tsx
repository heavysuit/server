import { HStack, Spacer } from '@chakra-ui/react';
import React from 'react';
import './App.css';
import logo from './logo.svg';
import { User } from './User';

function App() {
  return (
    <div className="App">
      <HStack px="4" py="2">
        <Spacer />
        <User />
      </HStack>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
