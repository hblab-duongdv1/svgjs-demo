import React from 'react';
import { createRoot } from 'react-dom/client';

import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.panzoom.js';

import App from './App';
import './styles/editor.css';

const container = document.getElementById('root');
if (!container) throw new Error('Missing root element');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
