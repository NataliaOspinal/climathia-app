import React, { useState } from 'react'; 
import { useInView } from 'react-intersection-observer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Datos organizados en "páginas" de 4 tarjetas cada una (array de arrays)
//    Cada array interno es una "página" de 4 tarjetas
const allAnalysisData = [
  // Página 1 (índice 0)
  [
    { title: 'Variable1', avg: '...', desc: '...', meaning: '...' },
    { title: 'Variable2', avg: '...', desc: '...', meaning: '...' },
    { title: 'Variable3', avg: '...', desc: '...', meaning: '...' },
    { title: 'Variable4', avg: '...', desc: '...', meaning: '...' },
  ],
  // Página 2 (índice 1)
  [
    { title: 'Variable5', avg: '...', desc: '...', meaning: '...' },
    { title: 'Variable6', avg: '...', desc: '...', meaning: '...' },
    { title: 'Variable7', avg: '...', desc: '...', meaning: '...' },
    { title: 'Variable8', avg: '...', desc: '...', meaning: '...' },
  ],
];

const DatosAnalisis = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Estado para guardar la página actual
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = allAnalysisData.length;

  // Funciones para cambiar de página
  const handleNext = () => {
    // (página + 1) % total -> (0+1)%2 = 1 -> (1+1)%2 = 0 (vuelve al inicio)
    setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
  };

  const handlePrev = () => {
    // (página - 1 + total) % total -> (0-1+2)%2 = 1 (va al final)
    setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
  };

  return (
    <section 
      ref={ref}
      className={`
        bg-green py-20 px-4 text-white
        ${inView ? 'fade-in-top-normal' : 'opacity-0'}
      `}
    >
      <h2 className="text-4xl font-bold text-center mb-16">
        Análisis general
      </h2>

      <div className="container mx-auto max-w-5xl flex items-center justify-center gap-4">
        
        {/* 5. Botón Izquierda con onClick */}
        <button 
          onClick={handlePrev}
          disabled={totalPages <= 1} // Se deshabilita si solo hay 1 página
          className="
            text-white hover:text-gray-300 transition-colors p-2 rounded-full
            disabled:opacity-25 disabled:cursor-not-allowed
          "
        >
          <ChevronLeft size={40} />
        </button>

        {/* Cuadrícula de tarjetas con animación
            - Añadimos un 'key' para forzar a React a re-renderizar
              y ejecutar la animación de 'fade-in-simple'
        */}
        <div 
          key={currentPage} // <-- La clave para la animación
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full fade-in-simple"
        >
          
          {/* Mapeamos solo los 4 items de la pag actual */}
          {allAnalysisData[currentPage].map((item, index) => (
            <div 
              key={index}
              className="
                bg-cyan-100 
                rounded-2xl shadow-lg p-6 
                flex flex-col sm:flex-row items-center gap-6
              "
            >
              {/* Placeholder de Imagen */}
              <div 
                className="
                  bg-lime-300 
                  w-32 h-32 
                  rounded-lg 
                  shrink-0
                  flex items-center justify-center text-gray-600
                "
              >
                imagen
              </div>

              {/* Contenido de Texto */}
              <div className="text-gray-700">
                <h3 className="text-2xl font-bold text-green mb-2">
                  {item.title}
                </h3>
                <p className="text-sm font-medium">{item.avg}</p>
                <p className="text-sm">{item.desc}</p>
                <p className="text-sm">{item.meaning}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 8. Botón Derecha con onClick */}
        <button 
          onClick={handleNext}
          disabled={totalPages <= 1}
          className="
            text-white hover:text-gray-300 transition-colors p-2 rounded-full
            disabled:opacity-25 disabled:cursor-not-allowed
          "
        >
          <ChevronRight size={40} />
        </button>

      </div>
    </section>
  );
};

export default DatosAnalisis;