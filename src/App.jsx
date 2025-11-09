import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 2. Importa tus componentes de "layout"
import Header from './components/Header';
import Footer from './components/Footer';
import LeafCursor from './components/LeafCursor';

// 3. Importa tus NUEVAS páginas
import HomePage from './pages/HomePage';
import DatosPage from './pages/DatosPage';

const App = () => {
  return (
    <>
      <LeafCursor />
      <Header />
      
      {/* 4. Aquí ocurre la magia */}
      <Routes>
        {/* Ruta para la página de inicio */}
        <Route path="/" element={<HomePage />} />
        
        {/* Ruta para la página de datos */}
        <Route path="/datos" element={<DatosPage />} />
        
        {/* (Puedes añadir más rutas aquí) */}
      </Routes>
      
      <Footer />
    </>
  );
};

export default App;
