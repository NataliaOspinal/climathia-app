import React, { useState, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import MapComponent from './MapComponent'; 
import { Listbox } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react'; 
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';
import { stationsService, chatbotService } from '../services';

// --- 1. IMPORTAMOS TU COMPONENTE (con tu nombre) ---
import DataSection2 from './DataSection2'; // (Asumiendo que se llama así)

registerLocale('es', es);


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
  const [allStations, setAllStations] = useState([]); // Para el mapa (todas las estaciones)
  const [airLinkStations, setAirLinkStations] = useState([]); // Para selector y gráficos (solo AirLink)
  const [selectedStationId, setSelectedStationId] = useState(null); 
  const [graphData, setGraphData] = useState([]);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Estados para el chatbot
  const [isExplaining, setIsExplaining] = useState(false);
  const [chatbotResponse, setChatbotResponse] = useState(null);
  const [showChatbotResponse, setShowChatbotResponse] = useState(false);
  const [currentContext, setCurrentContext] = useState(null);
  const [showOptionSelector, setShowOptionSelector] = useState(false);

  const selectedStationObject = airLinkStations.find(s => String(s.station_id || s.id) === String(selectedStationId)) || airLinkStations[0];

  // --- Función para obtener resumen de tipos de equipo ---
  const getEquipmentSummary = (stations) => {
    const summary = stations.reduce((acc, station) => {
      const tipo = station.tipo_equipo || 'Unknown';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(summary)
      .map(([tipo, count]) => `${tipo}: ${count}`)
      .join(', ');
  };

  // --- Función para manejar el botón "Explícame" ---
  const handleExplainData = async () => {
    if (!selectedStationObject || !graphData || graphData.length === 0) {
      alert('No hay datos disponibles para analizar. Selecciona una estación y fecha con datos.');
      return;
    }

    // Preparar contexto robusto para el chatbot
    const context = {
      stationId: selectedStationObject.station_id,
      stationName: selectedStationObject.station_name,
      location: {
        lat: selectedStationObject.lat,
        lon: selectedStationObject.lon
      },
      dateRange: {
        start: stationsService.formatDateForApi(selectedDate),
        end: stationsService.formatDateForApi(selectedDate)
      },
      dataType: 'comprehensive', // Datos completos
      chartData: graphData,
      averages: calculateAverages(graphData),
      trends: calculateTrends(graphData)
    };

    // Guardar contexto y mostrar selector de opciones
    setCurrentContext(context);
    setShowOptionSelector(true);
    setChatbotResponse(null);
    setShowChatbotResponse(false);
  };

  // --- Función para manejar la selección de una opción específica ---
  const handleOptionSelection = async (optionNumber) => {
    if (!currentContext) {
      alert('Error: No hay contexto disponible. Intenta de nuevo.');
      return;
    }

    setIsExplaining(true);
    setShowOptionSelector(false);

    try {
      console.log(`🎯 Enviando opción ${optionNumber} al chatbot`);

      // Enviar pregunta específica al chatbot
      const result = await chatbotService.explainSpecificOption(currentContext, optionNumber);

      if (result.success) {
        setChatbotResponse(result);
        setShowChatbotResponse(true);
        console.log('✅ Respuesta específica del chatbot recibida');
      } else {
        console.error('❌ Error del chatbot:', result.error);
        alert('Error obteniendo explicación del chatbot: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error enviando opción al chatbot:', error);
      alert('Error conectando con el chatbot. Inténtalo de nuevo.');
    } finally {
      setIsExplaining(false);
    }
  };

  // --- Función auxiliar para calcular promedios ---
  const calculateAverages = (data) => {
    if (!data || data.length === 0) return {};

    const validData = data.filter(d => d);
    const averages = {};

    ['pm_1', 'pm_2_5', 'pm_10', 'humedad', 'ica', 'temperatura', 'presion', 'vel_viento', 'precipitacion'].forEach(key => {
      const values = validData.map(d => d[key]).filter(v => v !== null && v !== undefined && !isNaN(v));
      if (values.length > 0) {
        averages[key] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
    });

    return averages;
  };

  // --- Función auxiliar para calcular tendencias ---
  const calculateTrends = (data) => {
    if (!data || data.length < 2) return {};

    const trends = {};
    ['pm_1', 'pm_2_5', 'pm_10', 'humedad', 'ica', 'temperatura'].forEach(key => {
      const values = data.map(d => d[key]).filter(v => v !== null && v !== undefined && !isNaN(v));
      if (values.length >= 2) {
        const first = values[0];
        const last = values[values.length - 1];
        const change = ((last - first) / first) * 100;
        
        if (Math.abs(change) > 5) {
          trends[key] = change > 0 ? 'Tendencia al alza' : 'Tendencia a la baja';
        } else {
          trends[key] = 'Estable';
        }
      }
    });

    return trends;
  };

  // --- Métodos auxiliares para cargar datos específicos por gráfico ---
  const loadSpecificChartData = async (chartType) => {
    if (!selectedStationId) return [];
    
    try {
      const dateStr = stationsService.formatDateForApi(selectedDate);
      
      switch (chartType) {
        case 'pm':
          return await stationsService.getPmChartData(selectedStationId, dateStr);
        case 'humidity':
          return await stationsService.getHumidityChartData(selectedStationId, dateStr);
        case 'ica':
          return await stationsService.getIcaChartData(selectedStationId, dateStr);
        case 'temperature':
          return await stationsService.getTemperatureChartData(selectedStationId, dateStr);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error cargando datos de gráfico ${chartType}:`, error);
      return [];
    }
  };

  // --- Cargar estaciones desde la API ---
  useEffect(() => {
    const loadStations = async () => {
      setIsLoadingStations(true);
      try {
        console.log('Cargando todas las estaciones y estaciones AirLink...');
        
        // Cargar todas las estaciones para el mapa
        const allStationsData = await stationsService.getAllStations();
        console.log('Todas las estaciones obtenidas:', allStationsData);
        
        // Cargar solo estaciones AirLink para selector y gráficos
        const airLinkData = await stationsService.getAirLinkStations();
        console.log('Estaciones AirLink obtenidas:', airLinkData);
        
        if (allStationsData && allStationsData.length > 0) {
          // Filtrar estaciones por ID único para evitar duplicados en el mapa
          const uniqueStations = allStationsData.reduce((acc, station) => {
            const existingStation = acc.find(s => s.station_id === station.station_id);
            if (!existingStation) {
              // Si no existe, agregar la estación
              acc.push(station);
            } else {
              // Si existe, mantener la que tenga más tipos de equipo (VUE+AIR > AIR)
              if (station.tipo_equipo && station.tipo_equipo.includes('VUE')) {
                const index = acc.findIndex(s => s.station_id === station.station_id);
                acc[index] = station;
              }
            }
            return acc;
          }, []);
          
          console.log(`Estaciones filtradas: ${allStationsData.length} -> ${uniqueStations.length} únicas`);
          setAllStations(uniqueStations);
        }
        
        if (airLinkData && airLinkData.length > 0) {
          setAirLinkStations(airLinkData);
          // Seleccionar la primera estación AirLink por defecto
          const firstAirLinkId = airLinkData[0].station_id || airLinkData[0].id;
          setSelectedStationId(firstAirLinkId);
        } else {
          setError('No se encontraron estaciones AirLink disponibles');
        }
      } catch (err) {
        console.error('Error cargando estaciones:', err);
        setError('Error cargando la lista de estaciones');
      } finally {
        setIsLoadingStations(false);
      }
    };
    
    loadStations();
  }, []); 

  // --- Cargar datos para gráficos desde el nuevo endpoint ---
  useEffect(() => {
    const loadGraphData = async () => {
      if (!selectedStationId) return;
      
      setIsLoadingData(true);
      try {
        const dateStr = stationsService.formatDateForApi(selectedDate);
        console.log(`Cargando datos detallados para estación ${selectedStationId} en fecha ${dateStr}`);
        
        const result = await stationsService.getStationDetailedData(selectedStationId, dateStr);
        
        if (result.success && result.data?.data?.measurements) {
          // Los datos ya vienen en el formato correcto para los gráficos
          const measurements = result.data.data.measurements;
          console.log(`Datos detallados cargados: ${measurements.length} mediciones`);
          setGraphData(measurements);
          setLastUpdate(new Date());
          setError(null); // Limpiar errores previos
        } else {
          console.log('No hay datos detallados disponibles para esta fecha');
          setGraphData([]);
          setError('No hay datos disponibles para la fecha seleccionada');
        }
      } catch (error) {
        console.error('Error cargando datos detallados:', error);
        setGraphData([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadGraphData();
  }, [selectedDate, selectedStationId]);
  
  return (
    // Usamos React.Fragment para tener múltiples secciones
    <>
      <section 
        id="DataMapSection"
        ref={ref} 
        className={`bg-gris-fondo py-20 px-4 ${inView ? 'fade-in-top-normal' : 'opacity-0'}`}
      >
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">Airlinks</h2>
          
          {/* --- Mostrar errores si los hay --- */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* --- Mostrar estado de carga de estaciones --- */}
          {isLoadingStations && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span>Cargando estaciones disponibles...</span>
              </div>
            </div>
          )}

          {/* --- Mostrar información de estaciones cargadas --- */}
          {!isLoadingStations && (allStations.length > 0 || airLinkStations.length > 0) && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-6 text-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>
                    📍 <strong>{allStations.length}</strong> estaciones únicas en el mapa | 
                    🔗 <strong>{airLinkStations.length}</strong> estaciones AirLink para gráficos
                  </span>
                  {lastUpdate && (
                    <span className="text-xs opacity-75">
                      Última actualización: {lastUpdate.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {allStations.length > 0 && (
                  <div className="text-xs opacity-80">
                    Tipos de equipo: {getEquipmentSummary(allStations)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- CONTENIDO PRINCIPAL (Mapa y Gráficos) --- */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            <MapComponent 
              stations={allStations} 
              selectedDate={selectedDate}
            />

            {/* === Columna Derecha (Datos) (Sin cambios) === */}
            <div className="lg:w-1/2">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                
                {/* --- Selector de Estación AirLink (Listbox) --- */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">Estación AirLink:</label>
                  <Listbox value={selectedStationId} onChange={setSelectedStationId}>
                  <div className="relative w-full sm:w-auto flex-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-200 text-gray-700 p-2 pr-10 text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green font-medium">
                      <span className="block truncate">{selectedStationObject?.station_name || selectedStationObject?.name || 'Seleccionar estación'}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm z-20">
                      {airLinkStations.map((station) => (
                        <Listbox.Option
                          key={station.station_id || station.id}
                          value={station.station_id || station.id}
                          className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${ active ? 'bg-green text-white' : 'text-gray-900' }`}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{station.station_name || station.name}</span>
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
                </div>
                
                {/* --- DatePicker --- */}
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)} 
                  minDate={minDate}
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                  className="bg-gray-200 text-gray-700 p-2 rounded-lg text-center font-medium w-full sm:w-auto cursor-pointer"
                />
              </div>
              
              {/* --- GRÁFICOS (Sin cambios) --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                
                <div className="bg-white p-4 rounded-lg shadow col-span-1 sm:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">PM vs. Hora</h4>
                  {isLoadingData ? (
                    <div className="h-[250px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-600">Cargando datos...</span>
                    </div>
                  ) : graphData.length > 0 ? ( 
                    <PmScatterChart data={graphData} /> 
                  ) : ( 
                    <div className="h-[250px] flex items-center justify-center text-gray-500">No hay datos de PM para mostrar en esta fecha.</div> 
                  )}
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Humedad (%) vs. Hora</h4>
                  {isLoadingData ? (
                    <div className="h-40 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-600">Cargando...</span>
                    </div>
                  ) : graphData.length > 0 ? ( 
                    <HumidityLineChart data={graphData} /> 
                  ) : ( 
                    <div className="h-40 flex items-center justify-center text-gray-500">No hay datos de humedad para mostrar.</div> 
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">ICA vs. Hora</h4>
                  {isLoadingData ? (
                    <div className="h-40 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-600">Cargando...</span>
                    </div>
                  ) : graphData.length > 0 ? ( 
                    <IcaLineChart data={graphData} /> 
                  ) : ( 
                    <div className="h-40 flex items-center justify-center text-gray-500">No hay datos de ICA para mostrar.</div> 
                  )}
                </div>
                
              </div>
            </div>
          </div>
          
          {/* --- 3. BOTÓN "EXPLÍCAME" (Con funcionalidad) --- */}
          <div className="mt-12 flex justify-center">
            <button 
              // onClick={() => setShowExplain(!showExplain)} // <-- Sin acción
              className="bg-green text-white font-semibold text-lg py-3 px-6 rounded-lg shadow-md hover:bg-green/90 cursor-pointer transition-colors"
            >
              {isExplaining ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                  Analizando con IA...
                </div>
              ) : (
                '🤖 Explícame'
              )}
            </button>
          </div>

          {/* --- 4. SELECTOR DE OPCIONES INTERACTIVO --- */}
          {showOptionSelector && currentContext && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-blue-800 flex items-center">
                  🤖 ¿Qué aspecto quieres que analice la IA?
                </h3>
                <button
                  onClick={() => setShowOptionSelector(false)}
                  className="text-blue-600 hover:text-blue-800 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Información del contexto */}
              <div className="bg-white rounded-lg p-4 mb-6 text-sm">
                <h4 className="font-semibold text-gray-700 mb-2">📊 Datos a Analizar:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div><strong>Estación:</strong> {currentContext.stationName}</div>
                  <div><strong>Fecha:</strong> {currentContext.dateRange.start}</div>
                  <div><strong>Mediciones:</strong> {currentContext.chartData.length}</div>
                  <div><strong>Variables:</strong> {Object.keys(currentContext.averages || {}).length}</div>
                </div>
              </div>

              {/* Opciones de análisis */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 mb-4">Selecciona el tipo de análisis:</h4>
                
                <button
                  onClick={() => handleOptionSelection(1)}
                  className="w-full text-left bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">🔍</span>
                    <div>
                      <h5 className="font-semibold text-blue-800">1. Evaluación de Calidad del Aire</h5>
                      <p className="text-sm text-gray-600">Interpretación técnica de cada variable y su significado para la salud pública</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleOptionSelection(2)}
                  className="w-full text-left bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">📈</span>
                    <div>
                      <h5 className="font-semibold text-blue-800">2. Análisis de Patrones y Tendencias</h5>
                      <p className="text-sm text-gray-600">Identificación de valores preocupantes y factores causantes</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleOptionSelection(3)}
                  className="w-full text-left bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">💡</span>
                    <div>
                      <h5 className="font-semibold text-blue-800">3. Recomendaciones Específicas</h5>
                      <p className="text-sm text-gray-600">Consejos prácticos para población y autoridades ambientales</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleOptionSelection(4)}
                  className="w-full text-left bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">📊</span>
                    <div>
                      <h5 className="font-semibold text-blue-800">4. Comparación con Estándares</h5>
                      <p className="text-sm text-gray-600">Evaluación según escalas de la OMS y EPA</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleOptionSelection(5)}
                  className="w-full text-left bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 border border-indigo-300 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">🌟</span>
                    <div>
                      <h5 className="font-semibold text-indigo-800">5. Análisis Completo</h5>
                      <p className="text-sm text-indigo-600">Evaluación integral que incluye todos los aspectos anteriores</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* --- 5. RESPUESTA DEL CHATBOT --- */}
          {showChatbotResponse && chatbotResponse && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-blue-800 flex items-center">
                  🤖 Análisis IA - Opción {chatbotResponse.selectedOption}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowChatbotResponse(false);
                      setShowOptionSelector(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    ← Volver al menú
                  </button>
                  <button
                    onClick={() => setShowChatbotResponse(false)}
                    className="text-blue-600 hover:text-blue-800 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* Información del contexto */}
              <div className="bg-white rounded-lg p-4 mb-4 text-sm">
                <h4 className="font-semibold text-gray-700 mb-2">📊 Datos Analizados:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div><strong>Estación:</strong> {chatbotResponse.context.stationName}</div>
                  <div><strong>Fecha:</strong> {chatbotResponse.context.dateRange.start}</div>
                  <div><strong>Mediciones:</strong> {chatbotResponse.context.chartData.length}</div>
                  <div><strong>Variables:</strong> {Object.keys(chatbotResponse.context.averages || {}).length}</div>
                </div>
              </div>

              {/* Respuesta del chatbot */}
              <div className="bg-white rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  {chatbotResponse.response?.data?.response ? (
                    <div className="whitespace-pre-wrap text-gray-800">
                      {chatbotResponse.response.data.response}
                    </div>
                  ) : (
                    <div className="text-gray-600 italic">
                      Respuesta del chatbot no disponible
                    </div>
                  )}
                </div>
              </div>

              {/* Pregunta enviada (colapsible) */}
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-700 font-medium hover:text-blue-900">
                  📝 Ver pregunta enviada al chatbot
                </summary>
                <div className="mt-2 bg-gray-100 rounded-lg p-3 text-sm">
                  <pre className="whitespace-pre-wrap text-gray-700 text-xs">
                    {chatbotResponse.question}
                  </pre>
                </div>
              </details>
            </div>
          )}

        </div>
      </section>
    </>
  );
};

export default DatosMapSection;