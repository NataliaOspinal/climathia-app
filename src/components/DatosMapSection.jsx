// components/DatosMapSection.jsx

import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Search, Plus, MapPin } from 'lucide-react'; 
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';

// --- AÑADIMOS IMPORTS DE LEAFLET ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // Importamos 'L' para el icono personalizado

registerLocale('es', es);

// --- 1. DEFINE TU ICONO PERSONALIZADO ---
// (Asegúrate de tener esta imagen en tu carpeta 'public/images/')
const customIcon = L.icon({
  iconUrl: '/images/icon-estacion.png', // Ruta a tu icono personalizado
  iconSize: [38, 38], // Tamaño [ancho, alto]
  iconAnchor: [19, 38], // Punto del icono que ancla al mapa (mitad de ancho, fondo)
  popupAnchor: [0, -38] // Dónde debe salir el popup
});

// --- 2. DEFINE TUS PUNTOS (ESTACIONES) ---
// (Estas son coordenadas de ejemplo para Lima)
const sampleStations = [
  { id: 1, name: 'Estación Miraflores', position: [-12.1219, -77.0305] },
  { id: 2, name: 'Estación Barranco', position: [-12.1438, -77.0229] },
  { id: 3, name: 'Estación Chorrillos', position: [-12.1623, -77.0185] },
];

// --- 3. DEFINE EL CENTRO Y ZOOM DEL MAPA ---
// (He elegido un punto en Barranco/Chorrillos para centrar)
const mapCenter = [-12.1495, -77.0203]; 
const mapZoom = 14; // Nivel de zoom (más alto = más cerca)


const DatosMapSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // --- (Toda tu lógica de DatePicker se queda igual) ---
  const [dateRange, setDateRange] = useState([new Date(), null]);
  const [startDate, endDate] = dateRange;
  const minDate = new Date('2025-09-01');
  
  const handleDateChange = (dates) => {
    // ... (lógica de 7 días - sin cambios)
    const [start, end] = dates;
    if (start && end) {
      const diffDays = (end - start) / (1000 * 60 * 60 * 24);
      if (diffDays > 6) {
        const newEndDate = new Date(start);
        newEndDate.setDate(start.getDate() + 6);
        setDateRange([start, newEndDate]);
        return;
      }
    }
    setDateRange(dates);
  };
  // ---------------------------------------------------

  return (
    <section 
      ref={ref}
      className={`
        bg-gris-fondo py-20 px-4
        ${inView ? 'fade-in-top-normal' : 'opacity-0'}
      `}
    >
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold text-gray-800 mb-12">
          Airlinks
        </h2>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* === Columna Izquierda (Mapa) === */}
          {/* Este div padre debe ser 'relative' */}
          <div className="lg:w-1/2 bg-lime-100 p-4 rounded-lg shadow-lg relative h-[600px] overflow-hidden">
            
            {/* --- Controles del Mapa (sin cambios) --- */}
            {/* (Estos van por ENCIMA del mapa gracias a 'z-10') */}
            <div className="relative z-10">
              <input type="text" placeholder="Buscar..." className="w-full p-2 pr-10 rounded shadow" />
              <button className="absolute right-0 top-0 h-full px-3 text-gray-500"><Search size={20} /></button>
            </div>
            <button className="absolute top-16 right-4 z-10 bg-white p-2 rounded shadow"><Plus size={20} /></button>
            <button className="absolute bottom-4 right-4 z-10 bg-verde-principal text-white p-3 rounded-full shadow-lg"><MapPin size={24} /></button>
            
            {/* === AQUÍ VA EL MAPA REAL === */}
            {/* Reemplazamos el 'div' placeholder con 'MapContainer' */}
            {/* Lo ponemos con 'z-0' para que esté DEBAJO de los controles */}
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              className="absolute inset-0 w-full h-full z-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* --- 4. Mapeamos las estaciones para crear los Markers --- */}
              {sampleStations.map((station) => (
                <Marker 
                  key={station.id} 
                  position={station.position} 
                  icon={customIcon} // <-- Aplicamos el icono personalizado
                >
                  <Popup>
                    <b>{station.name}</b>
                    <br />
                    Ver datos de la estación.
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* === Columna Derecha (Datos) === */}
          <div className="lg:w-1/2">
            {/* ... (Toda la columna derecha de gráficos y el datepicker se queda igual) ... */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <h3 className="text-3xl font-bold text-gray-800">
                Estación: <span className="text-verde-principal">____</span>
              </h3>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
                minDate={minDate}
                locale="es"
                placeholderText="Selecciona un rango"
                dateFormat="dd/MM/yyyy"
                className="bg-gray-200 text-gray-700 p-2 rounded-lg text-center font-medium w-full sm:w-auto"
                calendarClassName="font-sans"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* ... (tus 4 placeholders de gráficos) ... */}
              <div className="bg-white p-4 rounded-lg shadow"><div className="bg-yellow-200 w-40 h-40 rounded-full mx-auto flex items-center justify-center text-gray-600 font-semibold">gráfico</div><p className="text-center font-medium text-gray-700 mt-2">título gráfico</p></div>
              <div className="bg-white p-4 rounded-lg shadow"><div className="h-40 w-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">(gráfico)</div><p className="text-center font-medium text-gray-700 mt-2">título gráfico</p></div>
              <div className="bg-white p-4 rounded-lg shadow"><div className="h-40 w-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">(gráfico)</div><p className="text-center font-medium text-gray-700 mt-2">título gráfico</p></div>
              <button className="bg-teal-500 text-white font-bold text-lg p-4 rounded-lg shadow hover:bg-teal-600 transition-colors max-h-14 flex items-center justify-center">Explícame</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DatosMapSection;