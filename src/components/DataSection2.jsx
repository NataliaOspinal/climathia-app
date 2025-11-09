import React, { useState } from 'react'; // <-- Importamos useState
import { MapPin } from 'lucide-react'; 
// Importamos PropTypes para que React sepa qué tipo de props espera (opcional, pero buena práctica)
// import PropTypes from 'prop-types'; 

// --- 1. DATOS DE LAS ESTACIONES (Sin cambios) ---
const vueStations = [
  {
    "station_id": 219668,
    "station_name": "RACIMO-SOCORROCONS4",
    "tipo_equipo": "VUE+AIR",
    "lat": 6.461252,
    "lon": -73.25759
  },
  {
    "station_id": 219666,
    "station_name": "RACiMo BarbosaCONS2",
    "tipo_equipo": "VUE+AIR",
    "lat": 5.949394,
    "lon": -73.60563
  },
  {
    "station_id": 219664,
    "station_name": "Barranca-RacimoOrquidea",
    "tipo_equipo": "VUE+AIR",
    "lat": 7.068842,
    "lon": -73.85138
  },
  {
    "station_id": 219667,
    "station_name": "RACiMo MalagaCONS3",
    "tipo_equipo": "VUE+AIR",
    "lat": 6.700839,
    "lon": -72.727615
  }
];


const DataSection2 = ({ selectedDate }) => {
  // --- 2. ESTADO PARA LA ESTACIÓN SELECCIONADA ---
  const [selectedVueStationId, setSelectedVueStationId] = useState(vueStations[0].station_id);

  const handleStationClick = (id) => {
    setSelectedVueStationId(id);
    // TODO: Si necesitas que el clic en esta sección actualice los gráficos PM,
    // debes llamar a una función que se pase como prop desde DatosMapSection.
    console.log(`Estación seleccionada: ${id}`);
  };

  return (
    <section className="bg-cyan-100 py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        
        <div className="flex flex-col lg:flex-row gap-8">

          {/* --- Columna Izquierda (Gráficos Placeholders) (Sin cambios) --- */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl font-bold text-gray-800">Vue + Air</h3>
              <div className="bg-white p-2 rounded-md shadow text-gray-700 font-medium">
                {selectedDate.toLocaleDateString("es-ES", { day: 'numeric', month: 'long' })}
              </div>
            </div>

            {/* Grid de 6 gráficos (Placeholders) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* ... (Tus 6 placeholders de gráficos se quedan aquí) ... */}
              
              <div className="bg-white p-4 rounded-lg shadow text-center"><div className="bg-blue-400 w-40 h-40 rounded-full mx-auto flex items-center justify-center text-white font-semibold">gráfico</div><p className="text-center font-medium text-gray-700 mt-2">título gráfico</p></div>
              <div className="bg-white p-4 rounded-lg shadow text-center"><div className="h-40 w-full flex items-end justify-center gap-2 p-2"><div className="w-1/4 bg-green-700" style={{height: '60%'}}></div><div className="w-1/4 bg-gray-600" style={{height: '30%'}}></div><div className="w-1/4 bg-cyan-300" style={{height: '80%'}}></div><div className="w-1/4 bg-lime-300" style={{height: '70%'}}></div></div><p className="text-center font-medium text-gray-700 mt-2">título gráfico</p></div>
              <div className="bg-white p-4 rounded-lg shadow text-center"><div className="h-40 w-full flex items-end justify-center gap-2 p-2"><div className="w-1/4 bg-cyan-500" style={{height: '50%'}}></div><div className="w-1/4 bg-yellow-400" style={{height: '75%'}}></div><div className="w-1/4 bg-green-700" style={{height: '40%'}}></div><div className="w-1/4 bg-orange-500" style={{height: '65%'}}></div></div><p className="text-center font-medium text-gray-700 mt-2">título gráfico</p></div>
              <div className="bg-white p-4 rounded-lg shadow text-center"><div className="h-40 w-full rounded-md border border-gray-200 text-gray-400 flex items-center justify-center">(gráfico)</div><p className="text-center font-medium text-gray-700 mt-2">título gráfico</p></div>
              <div className="bg-white p-4 rounded-lg shadow text-center"><div className="bg-yellow-400 w-40 h-40 rounded-full mx-auto flex items-center justify-center text-white font-semibold">gráfico</div><p className="text-center font-medium text-gray-700 mt-2">título gráfico</p></div>
              <div className="bg-white p-4 rounded-lg shadow text-center"><div className="bg-orange-500 w-40 h-40 rounded-full mx-auto flex items-center justify-center text-white font-semibold">gráfico</div><p className="text-center font-medium text-gray-700 mt-2">título gráfico</p></div>

            </div>

            {/* Botón Explícame (de la imagen) */}
            <div className="mt-8 flex justify-center">
              <button className="bg-lime-200 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-lime-300 transition-colors">
                Explícame
              </button>
            </div>
          </div>

          {/* --- 3. COLUMNA DERECHA (Convertida a Botones Resaltables) --- */}
          <div className="lg:w-1/3 bg-white/50 p-6 rounded-lg shadow-inner">
            <div className="space-y-4">
              
              {vueStations.map((station, index) => {
                const isSelected = station.station_id === selectedVueStationId;
                const isFirst = index === 0;
                
                return (
                  // --- Usamos <button> en lugar de <div> ---
                  <button 
                    key={station.station_id} 
                    onClick={() => handleStationClick(station.station_id)}
                    className={`
                      w-full text-left transition-all duration-200 block rounded-lg pb-4 
                      ${isFirst && isSelected 
                        ? 'bg-green text-white p-4 shadow-lg' // Primer botón seleccionado (Fondo oscuro)
                        : isSelected
                          ? 'bg-green text-white p-4 shadow-md' // Otro botón seleccionado (Fondo claro)
                          : isFirst // Primer botón NO seleccionado
                            ? 'bg-transparent text-gray-800 p-4 border-b border-gray-400 hover:bg-gray-100' 
                            : 'border-b border-gray-400 pt-0 hover:bg-gray-50' // Otros botones NO seleccionados
                      }
                      
                      ${!isFirst && 'p-4'} {/* Agregamos padding a los demás para que el texto se vea bien */}
                    `}
                  >
                    <h4 className={`text-xl font-bold mb-1 ${isSelected ? '' : 'text-gray-700'}`}>
                      Estación {index + 1}: <span className={`font-semibold ${isSelected ? '' : 'text-gray-900'}`}>{station.station_name}</span>
                    </h4>
                    
                    <div className={`flex items-center gap-2 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                      <MapPin size={16} />
                      <span className="text-sm">Ubicación: {station.lat}, {station.lon}</span>
                    </div>
                    
                    <p className={`text-sm mt-1 ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                      Descripción: {station.tipo_equipo}
                    </p>
                  </button>
                );
              })}

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DataSection2;