import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Block iOS pinch-zoom only (touchend preventDefault breaks Android scrolling).
['gesturestart', 'gesturechange', 'gestureend'].forEach((evt) =>
  document.addEventListener(evt, (e) => e.preventDefault(), { passive: false })
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 