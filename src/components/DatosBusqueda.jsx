// components/DatosBusqueda.jsx

import React from 'react';
import { Search } from 'lucide-react'; // Importa el ícono

// 1. Renombramos la función a "DatosBusqueda"
const DatosBusqueda = () => {
  return (
    // 2. Cambiamos <main> por <div>, ya que no es la página principal
    <div 
      className="
        flex flex-col items-center 
        w-full 
        bg-gris-fondo 
        py-20 px-4
        min-h-[60vh]
      "
    >
      
      {/* Título */}
      <h1 
        className="
          text-4xl md:text-5xl font-bold 
          text-green 
          mb-12 
          text-center
        "
      >
        Inserte título aquí
      </h1>

      {/* Contenedor de la barra de búsqueda (relativo) */}
      <div 
        className="
          relative w-full max-w-xl 
          flex items-center
        "
      >
        
        {/* Input de búsqueda */}
        <input 
          type="text" 
          placeholder="Busca por ubicación"
          className="
            w-full 
            py-4 pl-6 pr-12 
            text-lg text-gray-700 
            bg-white 
            rounded-full 
            shadow-md 
            focus:outline-none 
            focus:ring-2 focus:ring-verde-principal
          "
        />
        
        {/* Ícono (Absoluto) */}
        <Search 
          className="
            absolute right-5 
            top-1/2 -translate-y-1/2 
            h-6 w-6 
            text-gray-500
          " 
        />
      </div>

    </div>
  );
};

// 3. Exportamos "DatosBusqueda"
export default DatosBusqueda;