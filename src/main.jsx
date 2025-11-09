// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'react-datepicker/dist/react-datepicker.css';
import { BrowserRouter } from 'react-router-dom' // <--- 1. Importa el Router
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <--- 2. Envuelve tu App */}
      <App />
    </BrowserRouter> {/* <--- 3. Cierra el Router */}
  </React.StrictMode>,
)