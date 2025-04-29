import React from 'react';
import ReactDOM from 'react-dom/client';
// Import Bootstrap first
import 'bootstrap/dist/css/bootstrap.min.css';
// Then your consolidated CSS
import './App.css';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


