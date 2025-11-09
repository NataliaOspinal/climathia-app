import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import MapComponent from './MapComponent'; 
import Papa from 'papaparse'; // Importamos PapaParse

registerLocale('es', es);

// --- TU LISTA DE 6 ESTACIONES ---
const allStations = [
  { "station_id": 219677, "station_name": "RACiMo BucSanAIR5", "tipo_equipo": "AIR", "lat": 7.1386485, "lon": -73.122185 },
  { "station_id": 219678, "station_name": "RACiMo BucGuatiAIR5.1", "tipo_equipo": "AIR", "lat": 6.994449, "lon": -73.066086 },
  { "station_id": 219679, "station_name": "RACiMo BarrancaAIR1.1", "tipo_equipo": "AIR", "lat": 7.077814, "lon": -73.85829 },
  { "station_id": 219680, "station_name": "RACiMo BarbosaAir2.1", "tipo_equipo": "AIR", "lat": 5.92901, "lon": -73.61547 },
  { "station_id": 219681, "station_name": "RACiMo SocConvAir4.1", "tipo_equipo": "AIR", "lat": 6.4681354, "lon": -73.25675 },
  { "station_id": 219682, "station_name": "RACiMo MalagaAIR3.1", "tipo_equipo": "AIR", "lat": 6.698055, "lon": -72.73542 }
];

const DatosMapSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // --- Estados ---
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const minDate = new Date('2025-09-01');
  
  const [historicData, setHistoricData] = useState([]); // Almacena el CSV completo
  const [graphData, setGraphData] = useState(null); // Datos para los gráficos
  const [selectedStation, setSelectedStation] = useState("____"); 

  // --- Cargar el CSV al inicio ---
  useEffect(() => {
    // El archivo debe estar en /public/promedios.csv
    const csvFilePath = '/promedios.csv'; 
    
    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        console.log("CSV cargado y parseado:", results.data);
        setHistoricData(results.data);
        // Opcional: Cargar datos para los gráficos del día de hoy
        findDataForGraphs(new Date(), results.data); 
      },
      error: (err) => {
        console.error("Error al parsear el CSV:", err);
      }
    });
  }, []); // El array vacío [] asegura que esto solo se ejecute una vez

  // --- Función para los GRÁFICOS (TÚ DEBES IMPLEMENTAR ESTO) ---
  const findDataForGraphs = (date, data) => {
    // TODO: Implementa tu lógica para filtrar el CSV
    // y actualizar los gráficos de la derecha.
    // Esta función se activa cuando cambia el calendario.
    console.log("Buscando datos para los gráficos de la derecha...");
    // const dateString = date.toISOString().split('T')[0];
    // const dataForDay = data.find(row => row.fecha === dateString);
    // setGraphData(dataForDay);
  };

  // --- El calendario actualiza la fecha y los gráficos ---
  const handleDateChange = (date) => {
    setSelectedDate(date);
    findDataForGraphs(date, historicData); 
  };
  
  return (
    <section 
      ref={ref} 
      className={`bg-gris-fondo py-20 px-4 ${inView ? 'fade-in-top-normal' : 'opacity-0'}`}
    >
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold text-gray-800 mb-12">Airlinks</h2>
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- Pasamos los datos del CSV y la fecha al Mapa --- */}
          <MapComponent 
            stations={allStations} 
            selectedDate={selectedDate}
            historicData={historicData} // <-- Prop con los datos del CSV
          />

          {/* === Columna Derecha (Datos) === */}
          <div className="lg:w-1/2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <h3 className="text-3xl font-bold text-gray-800">
                Estación: <span className="text-verde-principal">{selectedStation}</span>
              </h3>
              
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange} 
                minDate={minDate}
                locale="es"
                placeholderText="Selecciona un día"
                dateFormat="dd/MM/yyyy"
                className="bg-gray-200 text-gray-700 p-2 rounded-lg text-center font-medium w-full sm:w-auto"
                calendarClassName="font-sans"
              />
            </div>
            
            {/* --- GRÁFICOS (CONECTADOS A 'graphData') --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                {graphData ? (
                  <div>
                    <p><b>Datos de Gráfico (Ejemplo)</b></p>
                    <p>PM2.5 Avg: <b>{graphData.pm25_avg}</b></p>
                    <p>PM10 Avg: <b>{graphData.pm10_avg}</b></p>
                  </div>
                ) : <p>Selecciona una fecha para ver los gráficos.</p>}
              </div>
              <div className="bg-white p-4 rounded-lg shadow"><div className="h-40 w-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">(gráfico 2)</div></div>
              <div className="bg-white p-4 rounded-lg shadow"><div className="h-40 w-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">(gráfico 3)</div></div>
              <button className="bg-teal-500 text-white font-bold text-lg p-4 rounded-lg shadow hover:bg-teal-600 transition-colors max-h-14 flex items-center justify-center">Explícame</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DatosMapSection;