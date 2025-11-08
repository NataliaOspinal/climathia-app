import React from 'react';
import { useInView } from 'react-intersection-observer';


// Sal de 'components' (con ../), entra en 'assets', luego en 'images'
import gifHumedad from "/images/vapor.gif";
import gifPM from "/images/3a.png";
import gifTemp from "/images/temperature.gif";
import gifViento from '/images/clouds.gif';
import gifPrecipitacion from '/images/cloudsrain.gif';

// === 2. ACTUALIZA variablesData ===
const variablesData = [
  {
    iconSrc: gifHumedad, // Usa la variable importada
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Humedad',
    description: 'Presencia del vapor de agua',
  },
  {
    iconSrc: gifPM, // Usa la variable importada
    iconBgColor: 'bg-green-100', 
    iconColor: 'text-green-600',
    title: 'PM1, PM2.5 y PM10',
    description: 'Tamaño de las partículas en el aire',
  },
  {
    iconSrc: gifTemp, // Usa la variable importada
    iconBgColor: 'bg-red-100', 
    iconColor: 'text-red-600',
    title: 'Temperatura',
    description: 'Grado de calor o frío en el ambiente',
  },
  {
    iconSrc: gifViento, // Usa la variable importada
    iconBgColor: 'bg-blue-100', 
    iconColor: 'text-blue-600',
    title: 'Viento',
    description: 'Movimiento del aire con una dirección y velocidad',
  },
  {
    iconSrc: gifPrecipitacion, // Usa la variable importada
    iconBgColor: 'bg-gray-100', 
    iconColor: 'text-gray-600',
    title: 'Precipitaciones',
    description: 'Cualquier forma del agua que cae de las nubes',
  },
];

// === 3. SUB-COMPONENTE SIMPLIFICADO ===
const VariableCard = ({ variable }) => {
  // ¡Ya no necesitamos 'useRef' ni 'handle...'!

  return (
    <div 
      className="
        w-full sm:w-40 lg:w-50 
        bg-green /* Corregí 'bg-green' a tu color de tema */
        rounded-lg shadow-lg 
        p-6 text-center 
        flex flex-col items-center 
        transition-transform duration-300 hover:scale-105
      "
      // (¡Ya no necesitamos 'onMouseEnter' ni 'onMouseLeave'!)
    >
      <div 
        className={`
          ${variable.iconBgColor} 
          w-24 h-24 rounded-full 
          flex items-center justify-center 
          mb-6
          overflow-hidden
        `}
      >
        {/* === 4. USAREMOS UNA <img> === */}
        {variable.iconSrc ? (
          <img
            src={variable.iconSrc}
            alt={`Icono de ${variable.title}`} // Texto Alt para accesibilidad
            // Clases para mantener el tamaño:
            className="w-20 h-20 object-contain" 
          />
        ) : (
          // Placeholder por si falta un GIF
          <span className={`text-5xl ${variable.iconColor}`}>?</span>
        )}
      </div>

      <h3 className="text-xl font-semibold text-white mb-3">
        {variable.title}
      </h3>

      <p className="text-gray-200 text-sm">
        {variable.description}
      </p>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL (Sin cambios) ---
const VariablesSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section 
      ref={ref}
      className={`
        bg-white py-20 px-4
        ${inView ? 'fade-in-top-normal' : 'opacity-0'}
      `}
    >
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
          Variables consideradas
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          
          {variablesData.map((variable, index) => (
            <VariableCard key={index} variable={variable} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VariablesSection;