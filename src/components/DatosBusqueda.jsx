import React from "react";

const DatosBusqueda = () => {
  // Función que realiza el scroll hacia la sección indicada
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
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
        Análisis de datos
      </h1>

      {/* Botones de navegación */}
      <div className="flex flex-wrap justify-center gap-6">
        <button
          onClick={() => scrollToSection("DataMapSection")}
          className="
            bg-green text-white font-semibold
            py-3 px-6 rounded-full
            shadow-md hover:bg-green-700
            transition-all duration-300
          "
        >
          Airlinks
        </button>

        <button
          onClick={() => scrollToSection("DataSection2")}
          className="
            bg-blue-500 text-white font-semibold
            py-3 px-6 rounded-full
            shadow-md hover:bg-blue-600
            transition-all duration-300
          "
        >
          Vue+Air
        </button>

        <button
          onClick={() => scrollToSection("DataSection3")}
          className="
            bg-purple-500 text-white font-semibold
            py-3 px-6 rounded-full
            shadow-md hover:bg-purple-600
            transition-all duration-300
          "
        >
          PRO
        </button>
      </div>
    </div>
  );
};

export default DatosBusqueda;
