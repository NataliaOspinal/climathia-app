import React from 'react';


const SobreSection = () => {
  return (
    // Contenedor principal con padding vertical
    <section className="py-20 px-4">
      
      {/* Contenedor centrado que controla el ancho máximo */}
      <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-12 md:gap-16">

        {/* --- Columna de Texto --- */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl font-bold text-green mb-6">
            Sobre Climathia
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Climathia es un proyecto que nació a partir de un reto de CoAfina, un hackathon internacional enfocado en impulsar soluciones científicas y educativas con impacto social real. 
            En este caso, el reto nos ha motivado a hacer datos dinámicos, comprensibles y accesibles para todos.
          </p>
        </div>

        {/* --- Columna de Imagen --- */}
        <div className="md:w-1/2">
          <img 
            src="src/assets/images/imgsobre.png"
            alt="Ilustración de personas cuidando el planeta"
            className="w-full max-w-md mx-auto" // Controla el tamaño de la imagen
          />
        </div>

      </div>
    </section>
  );
};

export default SobreSection;