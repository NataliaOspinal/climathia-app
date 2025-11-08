import React from 'react';

// Array para los datos, así no repetimos código
const objectivesData = [
  {
    number: '1',
    text: 'Crear una herramienta de visualización sencilla, gratuita y comprensible.',
  },
  {
    number: '2',
    text: 'Diseñar una interfaz que muestre al público datos recopilados por la Red Ambiental Ciudadana de Monitoreo mediante gráficos dinámicos y atractivos.',
  },
  {
    number: '3',
    text: 'Hacer que la información ambiental sea transparente y accesible para todos.',
  },
];

const ObjectivesSection = () => {
  return (
    // Sección con fondo verde
    <section className="bg-green py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* 2. Título principal */}
        <h2 className="text-4xl font-bold text-center text-white mb-20">
          ¿Cuáles son nuestros <span className="text-green-300">objetivos</span>?
        </h2>

        {/* 3. Contenedor de las tarjetas
            - Mobile: flex-col (apiladas)
            - Desktop: md:flex-row (lado a lado)
        */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-24 md:gap-8 mt-12">
          
          {/* 4. Mapeamos el array de datos */}
          {objectivesData.map((obj) => (
            
            // Contenedor individual (PADRE RELATIVO)
            <div 
              key={obj.number} 
              className="relative flex flex-col items-center text-center md:w-1/3"
            >
              
              {/* 5. Círculo del Número (HIJO ABSOLUTO)
              */}
              <div 
                className="
                  absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-16 h-16
                  rounded-full
                  flex items-center justify-center
                  text-white text-3xl font-bold
                  shadow-lg
                  z-10
                "
                style={{ backgroundColor: '#1a4c5c' }} // Un tono más oscuro que tu verde
              >
                {obj.number}
              </div>

              {/* 6. Contenido de la Tarjeta
                  - mt-8 para dejar espacio para el círculo
              */}
              <div 
                className="
                  rounded-2xl
                  shadow-lg
                  p-6
                  pt-12 /* Padding superior para el espacio del círculo */
                  w-full
                  h-full /* Hace que todas las tarjetas tengan la misma altura */
                "
                style={{ backgroundColor: '#dcf8ff' }} // Un cian muy claro
              >
                <p className="text-gray-700 text-lg leading-relaxed">
                  {obj.text}
                </p>
              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default ObjectivesSection;