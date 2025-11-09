// src/pages/DatosPage.jsx
import React from 'react';
import { Search } from 'lucide-react'; // Importa el ícono
import DatosBusqueda from '../components/DatosBusqueda';
import DatosAnalisis from '../components/DatosAnalisis';
import DatosMapSection from '../components/DatosMapSection';
import ClimaBot from '../components/ClimaBot';
import DataSection3 from '../components/DataSection3';
import DataSection2 from '../components/DataSection2';

const DatosPage = () => {
  return (
    <main>
        <DatosBusqueda />
        <DatosAnalisis />
        <DatosMapSection />
        <DataSection2 />
        <DataSection3 />
        <ClimaBot />
    </main>
    
  );
};

export default DatosPage;