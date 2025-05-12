import React from 'react';
import { Dashboard } from './components';
import './styles.css';
import './dark-mode.css';

/**
 * Main App component
 * @returns {JSX.Element} App component
 */
function App() {
  return (
    <div className="app">
      <Dashboard />
    </div>
  );
}

export default App;