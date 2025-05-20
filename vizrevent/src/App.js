import React from 'react';
import DSController from './DataSettings/DSController';
import RECController from './RECommender/RECController';
import VPController from './ViewPanel/VPController';
import './App.scss'; // Import the SASS file
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
function App() {


  return (
    <div className="app-container">

      <header className='app-header'>
        <AppHeader />
      </header>
      <main className="app-body-container">
        <DSController />

        <RECController />

        <VPController />
      </main >
      <footer className='app-footer'>
        <AppFooter/>
      </footer>
    </div>
  );
}

export default App;