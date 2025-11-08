import React from 'react';

const Banner = () => {
  return (
    <main className="flex justify-center mt-10 px-4">
      {/* MÓVIL (default): flex-col, padding p-8, texto centrado
        DESKTOP (md:): flex-row, padding p-20, texto a la izquierda
      */}
      <div 
        className="
          w-full max-w-4xl  /* Ancho 100% pero con máximo */
          bg-green      /* Fondo verde */
          p-8 md:p-20       /* Padding más pequeño en móvil */
          rounded-lg shadow-lg
          flex flex-col md:flex-row /* col -> row */
          items-center      /* Centra los items en ambos layouts */
          md:justify-around /* Espaciado en desktop */
        "
      >
        
        {/* Imagen */}
        <img 
          src="src/assets/images/airquality.png" 
          alt="Monitor de calidad de aire"
          className="
            max-h-40          /* Imagen más pequeña en móvil */
            md:max-h-60       /* tamaño original para desktop */
            mb-6 md:mb-0      /* Espacio solo en móvil (debajo de la img) */
            pulsate-fwd-normal  /* Animación de vibrar */
          "
        />
        
        {/* Texto */}
        <h1 
          className="
            text-2xl text-center      /* Texto más pequeño y centrado en móvil */
            md:text-4xl md:text-left  /* Tamaño original y alineación en desktop */
            md:ml-12                  /* Margen para separar la imagen en desktop */
            font-medium text-white tracking-wide
          "
        >
          Monitorea el aire que <span className='bg-gradient-to-l from-blue-500 via-teal-500 to-green-500 text-transparent bg-clip-text'> respiras</span>
        </h1>

      </div>
    </main>
  );
};

export default Banner;