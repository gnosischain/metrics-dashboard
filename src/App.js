// App.js - Updated to use new modular CSS structure
import React from 'react';
import { Dashboard } from './components';
import './styles/index.css'; // Single import for all styles

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