// src/pages/DatosPage.jsx
import React from 'react';
import { Search } from 'lucide-react'; // Importa el ícono
import DatosBusqueda from '../components/DatosBusqueda';
import DatosAnalisis from '../components/DatosAnalisis';
import DatosMapSection from '../components/DatosMapSection';
import ClimaBot from '../components/ClimaBot';

const DatosPage = () => {
  return (
    <main>
        <DatosBusqueda />
        <DatosAnalisis />
        <DatosMapSection />
        <ClimaBot />
    </main>
    
  );
};

export default DatosPage;