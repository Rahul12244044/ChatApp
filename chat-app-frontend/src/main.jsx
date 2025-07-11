import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer';
import process from 'process';
window.Buffer = Buffer;
window.process = process;
import './index.css'
import App from './App.jsx'
import React from "react";
import { BrowserRouter } from 'react-router-dom';
createRoot(document.getElementById('root')).render(
   <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
