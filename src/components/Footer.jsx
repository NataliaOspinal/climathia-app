import React from 'react';
import climathiaLogo from '/images/logoclimathia.png'; 
import { Github, Youtube, ArrowRight } from 'lucide-react'; // Importa ArrowRight

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Para el año dinámico en el copyright

  return (
    <footer className="bg-green py-10 px-4 text-white">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

        {/* --- Columna Izquierda: Logo y Copyright --- */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          {/* Logo */}
          <div className="flex items-center mb-4">
            <img 
              src={climathiaLogo} 
              alt="Logo de Climathia" 
              className="h-10 mr-3" 
            />
            <span className="text-3xl font-bold">Climathia</span>
          </div>
          {/* Texto de Licencia */}
          <p className="text-sm text-gray-200">
            © {currentYear} Climathia. Libre licencia de uso de datos.
          </p>
        </div>

        {/* --- Columna Central: Enlace a RACiMo --- */}
        <div className="flex flex-col items-center md:items-start md:mt-4">
          <a 
            href="https://class.redclara.net/halley/moncora/intro.html" // Reemplaza con la URL real de RACiMo
            target="_blank" 
            rel="noopener noreferrer"
            className="
              flex items-center gap-2 
              text-lg font-semibold text-white 
              hover:text-gray-300 transition-colors duration-200
            "
          >
            Visita RACiMo 
            <ArrowRight className="h-5 w-5" /> {/* Icono de flecha */}
          </a>
        </div>


        {/* --- Columna Derecha: Iconos Sociales --- */}
        <div className="flex items-center space-x-6 md:mt-4">
          <a 
            href="https://github.com/NataliaOspinal/climathia-app"
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-white hover:text-gray-300 transition-colors duration-200"
          >
            <Github className="h-7 w-7" />
          </a>
          <a 
            href="https://youtube.com/tu-canal" // Reemplaza con tu URL de YouTube
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="text-white hover:text-gray-300 transition-colors duration-200"
          >
            <Youtube className="h-7 w-7" />
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;