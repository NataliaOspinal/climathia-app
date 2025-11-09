import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { MapPin, Calendar } from "lucide-react";
import { chatbotService } from '../services';

// --- Estaciones ---
const vueStations = [
  {
    station_id: 219668,
    station_name: "RACIMO-SOCORROCONS4",
    tipo_equipo: "VUE+AIR",
    lat: 6.461252,
    lon: -73.25759,
  },
  {
    station_id: 219666,
    station_name: "RACiMo BarbosaCONS2",
    tipo_equipo: "VUE+AIR",
    lat: 5.949394,
    lon: -73.60563,
  },
  {
    station_id: 219664,
    station_name: "Barranca-RacimoOrquidea",
    tipo_equipo: "VUE+AIR",
    lat: 7.068842,
    lon: -73.85138,
  },
  {
    station_id: 219667,
    station_name: "RACiMo MalagaCONS3",
    tipo_equipo: "VUE+AIR",
    lat: 6.700839,
    lon: -72.727615,
  },
];

// --- Formateo de horas ---
const formatXAxis = (tick) => {
  const date = new Date(tick);
  return date.getHours().toString().padStart(2, "0") + ":00";
};

// === COMPONENTES DE GRÁFICOS ===
const TemperatureLineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={formatXAxis} type="number" domain={["dataMin", "dataMax"]} />
      <YAxis unit="°C" />
      <Tooltip labelFormatter={(l) => new Date(l).toLocaleTimeString()} formatter={(v) => [`${v.toFixed(1)}°C`, "Temperatura"]} />
      <Line type="monotone" dataKey="temp" stroke="#e74c3c" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const PressureLineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={formatXAxis} type="number" domain={["dataMin", "dataMax"]} />
      <YAxis unit="hPa" />
      <Tooltip labelFormatter={(l) => new Date(l).toLocaleTimeString()} formatter={(v) => [`${v.toFixed(1)} hPa`, "Presión"]} />
      <Line type="monotone" dataKey="presion" stroke="#9b59b6" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const WindSpeedChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={formatXAxis} type="number" domain={["dataMin", "dataMax"]} />
      <YAxis unit="m/s" />
      <Tooltip labelFormatter={(l) => new Date(l).toLocaleTimeString()} formatter={(v) => [`${v.toFixed(1)} m/s`, "Velocidad viento"]} />
      <Line type="monotone" dataKey="viento_vel" stroke="#16a085" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const WindDirectionChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={formatXAxis} type="number" domain={["dataMin", "dataMax"]} />
      <YAxis domain={[0, 360]} unit="°" />
      <Tooltip labelFormatter={(l) => new Date(l).toLocaleTimeString()} formatter={(v) => [`${v.toFixed(0)}°`, "Dirección viento"]} />
      <Line type="monotone" dataKey="viento_dir" stroke="#2980b9" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const HumedadChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={formatXAxis} type="number" domain={["dataMin", "dataMax"]} />
      <YAxis unit="%" />
      <Tooltip labelFormatter={(l) => new Date(l).toLocaleTimeString()} formatter={(v) => [`${v.toFixed(1)}%`, "Humedad"]} />
      <Line type="monotone" dataKey="humedad" stroke="#3B82F6" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const PMChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={formatXAxis} type="number" domain={["dataMin", "dataMax"]} />
      <YAxis unit="µg/m³" />
      <Tooltip labelFormatter={(l) => new Date(l).toLocaleTimeString()} />
      <Legend />
      <Line type="monotone" dataKey="pm_1" stroke="#34D399" strokeWidth={2} dot={false} name="PM 1" />
      <Line type="monotone" dataKey="pm_2_5" stroke="#F59E0B" strokeWidth={2} dot={false} name="PM 2.5" />
      <Line type="monotone" dataKey="pm_10" stroke="#EF4444" strokeWidth={2} dot={false} name="PM 10" />
    </LineChart>
  </ResponsiveContainer>
);

// === COMPONENTE PRINCIPAL ===
const DataSection2 = () => {
  const [selectedVueStationId, setSelectedVueStationId] = useState(vueStations[0].station_id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [graphData, setGraphData] = useState([]);
  
  // Estados para el chatbot
  const [isExplaining, setIsExplaining] = useState(false);
  const [chatbotResponse, setChatbotResponse] = useState(null);
  const [showChatbotResponse, setShowChatbotResponse] = useState(false);
  const [currentContext, setCurrentContext] = useState(null);
  const [showOptionSelector, setShowOptionSelector] = useState(false);

  // Cargar datos desde promedios.csv
  useEffect(() => {
    Papa.parse("/promedios.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const filtered = results.data
          .filter(
            (row) =>
              parseInt(row.station_id) === selectedVueStationId &&
              new Date(row.timestamp).toDateString() === selectedDate.toDateString()
          )
          .map((row) => ({
            timestamp: new Date(row.timestamp).getTime(),
            temp: parseFloat(row.temp),
            presion: parseFloat(row.presion),
            viento_vel: parseFloat(row.viento_vel),
            viento_dir: parseFloat(row.viento_dir),
            humedad: parseFloat(row.humedad),
            pm_1: parseFloat(row.pm_1) || 0,
            pm_2_5: parseFloat(row.pm_2_5) || 0,
            pm_10: parseFloat(row.pm_10) || 0,
          }));

        setGraphData(filtered);
      },
    });
  }, [selectedVueStationId, selectedDate]);

  // --- Función para obtener la estación seleccionada ---
  const selectedStationObject = vueStations.find(s => s.station_id === selectedVueStationId) || vueStations[0];

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
        start: formatDateForApi(selectedDate),
        end: formatDateForApi(selectedDate)
      },
      dataType: 'vue_air', // Datos de VUE+AIR
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

    ['temp', 'presion', 'viento_vel', 'viento_dir', 'humedad', 'pm_1', 'pm_2_5', 'pm_10'].forEach(key => {
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
    ['temp', 'presion', 'viento_vel', 'humedad', 'pm_1', 'pm_2_5', 'pm_10'].forEach(key => {
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

  // --- Función para formatear fecha para la API ---
  const formatDateForApi = (date) => {
    if (!date) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  return (
    <section className="bg-lime-200 py-20 px-4" id="DataSection2">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- COLUMNA IZQUIERDA --- */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-gray-800">Vue + Air</h3>

              {/* Calendario */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-md shadow">
                <Calendar size={20} className="text-gray-600" />
                <input
                  type="date"
                  className="border-0 focus:outline-none text-gray-700"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
              </div>
            </div>

            {/* --- GRÁFICOS --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <ChartCard title="Temperatura (°C)">
                <TemperatureLineChart data={graphData} />
              </ChartCard>
              <ChartCard title="Presión (hPa)">
                <PressureLineChart data={graphData} />
              </ChartCard>
              <ChartCard title="Vel. Viento (m/s)">
                <WindSpeedChart data={graphData} />
              </ChartCard>
              <ChartCard title="Dir. Viento (°)">
                <WindDirectionChart data={graphData} />
              </ChartCard>
              <ChartCard title="Humedad (%)">
                <HumedadChart data={graphData} />
              </ChartCard>
              <ChartCard title="PM (µg/m³)">
                <PMChart data={graphData} />
              </ChartCard>
            </div>

            <div className="mt-8 flex justify-center">
              <button 
                onClick={handleExplainData}
                disabled={isExplaining || !selectedStationObject || graphData.length === 0}
                className={`font-semibold py-3 px-6 rounded-lg shadow-md transition-colors ${
                  isExplaining || !selectedStationObject || graphData.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-lime-300 text-gray-800 cursor-pointer hover:bg-green-500/30'
                }`}
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
          </div>

          {/* --- COLUMNA DERECHA (Botones de estaciones) --- */}
          <div className="lg:w-1/3 bg-white/50 p-6 rounded-lg shadow-inner">
            <div className="space-y-4">
              {vueStations.map((station, index) => {
                const isSelected = station.station_id === selectedVueStationId;
                return (
                  <button
                    key={station.station_id}
                    onClick={() => setSelectedVueStationId(station.station_id)}
                    className={`w-full text-left transition-all duration-200 block rounded-lg p-4 ${
                      isSelected
                        ? "bg-green-500/30 text-teal-900 shadow-md cursor-pointer"
                        : "bg-transparent hover:bg-green-500/10 border-b border-gray-400 text-gray-800 cursor-pointer"
                    }`}
                  >
                    <h4 className="text-xl font-bold mb-1">
                      Estación {index + 1}:{" "}
                      <span className="font-semibold">{station.station_name}</span>
                    </h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span className="text-sm">
                        {station.lat}, {station.lon}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-gray-600">{station.tipo_equipo}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- SELECTOR DE OPCIONES INTERACTIVO --- */}
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

        {/* --- RESPUESTA DEL CHATBOT --- */}
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
  );
};

// --- COMPONENTE AUXILIAR ---
const ChartCard = ({ title, children }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h4 className="text-lg font-semibold text-gray-700 mb-2">{title}</h4>
    {children}
  </div>
);

export default DataSection2;
