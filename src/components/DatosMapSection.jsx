import React, { useState, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import MapComponent from './MapComponent'; 
import Papa from 'papaparse'; 
import { Listbox } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react'; 
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';

// --- 1. IMPORTAMOS TU COMPONENTE (con tu nombre) ---
import DataSection2 from './DataSection2'; // (Asumiendo que se llama así)

registerLocale('es', es);

// --- TU LISTA DE 6 ESTACIONES (Sin cambios) ---
const allStations = [
  { "station_id": 219677, "station_name": "RACiMo BucSanAIR5", "tipo_equipo": "AIR", "lat": 7.1386485, "lon": -73.122185 },
  { "station_id": 219678, "station_name": "RACiMo BucGuatiAIR5.1", "tipo_equipo": "AIR", "lat": 6.994449, "lon": -73.066086 },
  { "station_id": 219679, "station_name": "RACiMo BarrancaAIR1.1", "tipo_equipo": "AIR", "lat": 7.077814, "lon": -73.85829 },
  { "station_id": 219680, "station_name": "RACiMo BarbosaAir2.1", "tipo_equipo": "AIR", "lat": 5.92901, "lon": -73.61547 },
  { "station_id": 219681, "station_name": "RACiMo SocConvAir4.1", "tipo_equipo": "AIR", "lat": 6.4681354, "lon": -73.25675 },
  { "station_id": 219682, "station_name": "RACiMo MalagaAIR3.1", "tipo_equipo": "AIR", "lat": 6.698055, "lon": -72.73542 }
];

// --- Formateador de Hora (Helper) ---
const formatXAxis = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// --- GRÁFICO PM (PmScatterChart) (Sin cambios) ---
const PmScatterChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid />
        <XAxis dataKey="timestamp" tickFormatter={formatXAxis} type="number" domain={['dataMin', 'dataMax']} name="Hora" />
        <YAxis type="number" name="Valor (µg/m³)" label={{ value: 'µg/m³', angle: -90, position: 'insideLeft', offset: 10 }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [value, name]} labelFormatter={(label) => formatXAxis(label)} />
        <Legend />
        <Scatter name="PM1" data={data} dataKey="pm_1" fill="#8884d8" />
        <Scatter name="PM2.5" data={data} dataKey="pm_2_5" fill="#82ca9d" />
        <Scatter name="PM10" data={data} dataKey="pm_10" fill="#ffc658" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

// --- GRÁFICO HUMEDAD (HumidityLineChart) (Sin cambios) ---
const HumidityLineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart 
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(tick) => formatXAxis(tick).split(':')[0] + 'h'}
          type="number" 
          domain={['dataMin', 'dataMax']} 
          padding={{ left: 10, right: 10 }}
        />
        <YAxis 
          type="number" 
          domain={['dataMin - 2', 'dataMax + 2']} 
          unit="%"
        />
        <Tooltip 
          labelFormatter={(label) => new Date(label).toLocaleTimeString()} 
          formatter={(value) => [`${value.toFixed(1)}%`, "Humedad"]}
        />
        <Line type="monotone" dataKey="humedad" name="Humedad" stroke="#3498db" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// --- GRÁFICO ICA (IcaLineChart) (Sin cambios) ---
const IcaLineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart 
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(tick) => formatXAxis(tick).split(':')[0] + 'h'}
          type="number" 
          domain={['dataMin', 'dataMax']} 
          padding={{ left: 10, right: 10 }}
        />
        <YAxis 
          type="number" 
          domain={['dataMin - 5', 'dataMax + 5']}
        />
        <Tooltip 
          labelFormatter={(label) => new Date(label).toLocaleTimeString()} 
          formatter={(value) => [`${value.toFixed(1)}`, "ICA"]}
        />
        <Line type="monotone" dataKey="ica" name="ICA" stroke="#f39c12" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// === Temperatura ===
const TemperatureLineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={(tick) => formatXAxis(tick).split(':')[0] + 'h'} type="number" domain={['dataMin', 'dataMax']} />
      <YAxis unit="°C" />
      <Tooltip labelFormatter={(l) => new Date(l).toLocaleTimeString()} formatter={(v) => [`${v.toFixed(1)}°C`, "Temperatura"]} />
      <Line type="monotone" dataKey="temperatura" stroke="#e74c3c" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// === Presión Atmosférica ===
const PressureLineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={(tick) => formatXAxis(tick).split(':')[0] + 'h'} type="number" domain={['dataMin', 'dataMax']} />
      <YAxis unit="hPa" />
      <Tooltip labelFormatter={(l) => new Date(l).toLocaleTimeString()} formatter={(v) => [`${v.toFixed(1)} hPa`, "Presión"]} />
      <Line type="monotone" dataKey="presion" stroke="#9b59b6" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// === Velocidad del viento ===
const WindSpeedChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={(tick) => formatXAxis(tick).split(':')[0] + 'h'} type="number" domain={['dataMin', 'dataMax']} />
      <YAxis unit="m/s" />
      <Tooltip labelFormatter={(l) => new Date(l).toLocaleTimeString()} formatter={(v) => [`${v.toFixed(1)} m/s`, "Velocidad viento"]} />
      <Line type="monotone" dataKey="vel_viento" stroke="#16a085" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// === Dirección del viento ===
const WindDirectionChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={(tick) => formatXAxis(tick).split(':')[0] + 'h'} type="number" domain={['dataMin', 'dataMax']} />
      <YAxis domain={[0, 360]} unit="°" />
      <Tooltip labelFormatter={(l) => new Date(l).toLocaleTimeString()} formatter={(v) => [`${v.toFixed(0)}°`, "Dirección viento"]} />
      <Line type="monotone" dataKey="dir_viento" stroke="#2980b9" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// --- FUNCIÓN PARA INDEXAR EL CSV (Sin cambios) ---
const processAndIndexCsv = (rows) => {
  const index = {};
  if (!rows || rows.length === 0) return index;

  for (const row of rows) {
    if (!row.timestamp || !row.station_id) continue;
    
    const id = String(row.station_id).trim();
    const date = new Date(row.timestamp);
    if (isNaN(date.getTime())) continue;
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    if (!index[id]) index[id] = {};
    if (!index[id][dateString]) index[id][dateString] = [];

    index[id][dateString].push({
      ...row,
      timestamp: date.getTime()
    });
  }
  console.log("CSV Indexado:", index);
  return index;
};

// --- COMPONENTE PRINCIPAL (DatosMapSection) ---
const DatosMapSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // --- Estados ---
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const minDate = new Date('2025-09-01');
  const [selectedStationId, setSelectedStationId] = useState(allStations[0].station_id); 
  const [historicDataIndex, setHistoricDataIndex] = useState(null);
  
  // --- 2. ELIMINAMOS el estado 'showExplain' ---
  // const [showExplain, setShowExplain] = useState(false); 

  const selectedStationObject = allStations.find(s => String(s.station_id) === String(selectedStationId)) || allStations[0];

  // --- Cargar el CSV y construir el ÍNDICE (Sin cambios) ---
  useEffect(() => {
    const csvFilePath = '/promedios.csv'; 
    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const indexedData = processAndIndexCsv(results.data);
        setHistoricDataIndex(indexedData);
      },
      error: (err) => console.error("Error al parsear el CSV:", err)
    });
  }, []); 

  // --- OBTENER DATOS PARA GRÁFICOS (con 'useMemo', sin cambios) ---
  const graphData = useMemo(() => {
    if (!historicDataIndex) return []; 

    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    console.log(`Buscando en ÍNDICE para GRÁFICOS por ID: ${selectedStationId} y Fecha: ${dateString}`);
    
    const dataForChart = historicDataIndex[String(selectedStationId)]?.[dateString] || [];
    
    if (dataForChart.length > 0) {
      console.log(`Datos (del índice) para el gráfico: ${dataForChart.length} filas.`);
    } else {
      console.log("No se encontraron datos en el índice para el gráfico.");
    }
    
    return dataForChart;
  }, [selectedDate, selectedStationId, historicDataIndex]);
  
  return (
    // Usamos React.Fragment para tener múltiples secciones
    <>
      <section 
        ref={ref} 
        className={`bg-gris-fondo py-20 px-4 ${inView ? 'fade-in-top-normal' : 'opacity-0'}`}
      >
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">Airlinks</h2>
          
          {/* --- CONTENIDO PRINCIPAL (Mapa y Gráficos) --- */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            <MapComponent 
              stations={allStations} 
              selectedDate={selectedDate}
              historicDataIndex={historicDataIndex}
            />

            {/* === Columna Derecha (Datos) (Sin cambios) === */}
            <div className="lg:w-1/2">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                
                {/* --- Selector de Estación (Listbox) --- */}
                <Listbox value={selectedStationId} onChange={setSelectedStationId}>
                  <div className="relative w-full sm:w-auto flex-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-200 text-gray-700 p-2 pr-10 text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green font-medium">
                      <span className="block truncate">{selectedStationObject.station_name}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm z-20">
                      {allStations.map((station) => (
                        <Listbox.Option
                          key={station.station_id}
                          value={station.station_id}
                          className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${ active ? 'bg-green text-white' : 'text-gray-900' }`}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{station.station_name}</span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green"><Check className="h-5 w-5" aria-hidden="true" /></span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
                
                {/* --- DatePicker --- */}
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)} 
                  minDate={minDate}
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                  className="bg-gray-200 text-gray-700 p-2 rounded-lg text-center font-medium w-full sm:w-auto"
                />
              </div>
              
              {/* --- GRÁFICOS (Sin cambios) --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="bg-white p-4 rounded-lg shadow col-span-1 sm:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">PM vs. Hora</h4>
                  {graphData.length > 0 ? ( <PmScatterChart data={graphData} /> ) : ( <div className="h-[250px] flex items-center justify-center text-gray-500">No hay datos de PM para mostrar en esta fecha.</div> )}
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Humedad (%) vs. Hora</h4>
                  {graphData.length > 0 ? ( <HumidityLineChart data={graphData} /> ) : ( <div className="h-40 flex items-center justify-center text-gray-500">No hay datos de humedad para mostrar.</div> )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">ICA vs. Hora</h4>
                  {graphData.length > 0 ? ( <IcaLineChart data={graphData} /> ) : ( <div className="h-40 flex items-center justify-center text-gray-500">No hay datos de ICA para mostrar.</div> )}
                </div>
                
              </div>
            </div>
          </div>
          
          {/* --- 3. BOTÓN "EXPLÍCAME" (Sin onClick) --- */}
          <div className="mt-12 flex justify-center">
            <button 
              // onClick={() => setShowExplain(!showExplain)} // <-- Sin acción
              className="bg-white text-gray-800 font-semibold text-lg py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
            >
              Explícame
            </button>
          </div>

        </div>
      </section>

      {/* --- 4. NUEVA SECCIÓN (Renderizado permanente) --- */}
      <DataSection2 selectedDate={selectedDate} />
    </>
  );
};

export default DatosMapSection;