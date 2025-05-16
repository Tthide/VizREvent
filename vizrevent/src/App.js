import React from 'react';
import DSController from './DataSettings/DSController';
import RECController from './RECommender/RECController';
import VPController from './ViewPanel/VPController';
import './App.scss'; // Import the SASS file
import AppHeader from './AppHeader';

function App() {


  return (
    <div className="app-container">

      <div className='header'>
        <AppHeader />
      </div>
      <div className="row-container">
        <div className="column">
          <DSController />
        </div>
        <div className="column">
          <RECController />
        </div>
        <div className="column">
          <VPController />
        </div>
      </div>
    </div>
  );
}

export default App;