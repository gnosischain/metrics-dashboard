// App.js - Updated to use new modular CSS structure
import React from 'react';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
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
