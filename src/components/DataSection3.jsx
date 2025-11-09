import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { chatbotService } from '../services';

// === CONFIGURACIÓN DE LA ESTACIÓN POR DEFECTO ===
const defaultStation = {
  station_id: 84759,
  station_name: "Halley UIS",
  tipo_equipo: "PRO",
  lat: 7.13908,
  lon: -73.12137,
};

// === FORMATEO DEL EJE X ===
const formatXAxis = (tick) => {
  const date = new Date(tick);
  return date.getHours().toString().padStart(2, "0") + ":00";
};

// === COMPONENTES DE GRÁFICOS ===
const TemperatureChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
      <YAxis unit="°C" />
      <Tooltip
        labelFormatter={(l) => new Date(l).toLocaleTimeString()}
        formatter={(v) => [`${v.toFixed(1)} °C`, "Temperatura"]}
      />
      <Line type="monotone" dataKey="temp" stroke="#e74c3c" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const HumidityChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
      <YAxis unit="%" />
      <Tooltip
        labelFormatter={(l) => new Date(l).toLocaleTimeString()}
        formatter={(v) => [`${v.toFixed(1)} %`, "Humedad"]}
      />
      <Line type="monotone" dataKey="humedad" stroke="#3498db" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const PressureChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
      <YAxis unit="hPa" />
      <Tooltip
        labelFormatter={(l) => new Date(l).toLocaleTimeString()}
        formatter={(v) => [`${v.toFixed(1)} hPa`, "Presión"]}
      />
      <Line type="monotone" dataKey="presion" stroke="#9b59b6" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const WindSpeedChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
      <YAxis unit="m/s" />
      <Tooltip
        labelFormatter={(l) => new Date(l).toLocaleTimeString()}
        formatter={(v) => [`${v.toFixed(1)} m/s`, "Velocidad del viento"]}
      />
      <Line type="monotone" dataKey="viento_vel" stroke="#16a085" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// === COMPONENTE PRINCIPAL ===
const DataSection3 = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [graphData, setGraphData] = useState([]);
  
  // Estados para el chatbot
  const [isExplaining, setIsExplaining] = useState(false);
  const [chatbotResponse, setChatbotResponse] = useState(null);
  const [showChatbotResponse, setShowChatbotResponse] = useState(false);
  const [currentContext, setCurrentContext] = useState(null);
  const [showOptionSelector, setShowOptionSelector] = useState(false);

  useEffect(() => {
    Papa.parse("/promedios.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const filtered = results.data
          .filter(
            (row) =>
              parseInt(row.station_id) === defaultStation.station_id &&
              new Date(row.timestamp).toDateString() === selectedDate.toDateString()
          )
          .map((row) => ({
            timestamp: new Date(row.timestamp).getTime(),
            temp: parseFloat(row.temp),
            humedad: parseFloat(row.humedad),
            presion: parseFloat(row.presion),
            viento_vel: parseFloat(row.viento_vel),
          }));

        setGraphData(filtered);
      },
    });
  }, [selectedDate]);

  // --- Función para manejar el botón "Explícame" ---
  const handleExplainData = async () => {
    if (!defaultStation || !graphData || graphData.length === 0) {
      alert('No hay datos disponibles para analizar. Selecciona una fecha con datos.');
      return;
    }

    // Preparar contexto robusto para el chatbot
    const context = {
      stationId: defaultStation.station_id,
      stationName: defaultStation.station_name,
      location: {
        lat: defaultStation.lat,
        lon: defaultStation.lon
      },
      dateRange: {
        start: formatDateForApi(selectedDate),
        end: formatDateForApi(selectedDate)
      },
      dataType: 'pro', // Datos de estación PRO
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

    ['temp', 'humedad', 'presion', 'viento_vel'].forEach(key => {
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
    ['temp', 'humedad', 'presion', 'viento_vel'].forEach(key => {
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
    <section className="bg-white py-16 px-6" id="DataSection3">
      <div className="max-w-6xl mx-auto">
        {/* --- ENCABEZADO --- */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold text-gray-800">
            {defaultStation.station_name} ({defaultStation.tipo_equipo})
          </h3>

          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            locale={es}
            dateFormat="d 'de' MMMM"
            className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-gray-300 text-center cursor-pointer hover:bg-gray-50 transition"
          />
        </div>

        {/* --- GRÁFICOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <ChartCard title="Temperatura (°C)">
            <TemperatureChart data={graphData} />
          </ChartCard>
          <ChartCard title="Humedad (%)">
            <HumidityChart data={graphData} />
          </ChartCard>
          <ChartCard title="Presión Atmosférica (hPa)">
            <PressureChart data={graphData} />
          </ChartCard>
          <ChartCard title="Velocidad del Viento (m/s)">
            <WindSpeedChart data={graphData} />
          </ChartCard>
        </div>

        {/* --- BOTÓN EXPLÍCAME --- */}
        <div className="mt-10 flex justify-center">
          <button 
            onClick={handleExplainData}
            disabled={isExplaining || !defaultStation || graphData.length === 0}
            className={`font-semibold py-3 px-6 rounded-lg shadow-md transition-colors ${
              isExplaining || !defaultStation || graphData.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-lime-200 text-gray-800 cursor-pointer hover:bg-lime-300'
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
                    <h5 className="font-semibold text-blue-800">1. Evaluación de Condiciones Meteorológicas</h5>
                    <p className="text-sm text-gray-600">Interpretación técnica de cada variable meteorológica y su significado</p>
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
                    <p className="text-sm text-gray-600">Consejos prácticos basados en las condiciones meteorológicas</p>
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
                    <p className="text-sm text-gray-600">Evaluación según rangos meteorológicos normales</p>
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

// === CARD AUXILIAR PARA CADA GRÁFICO ===
const ChartCard = ({ title, children }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h4 className="text-lg font-semibold text-gray-700 mb-2">{title}</h4>
    {children}
  </div>
);

export default DataSection3;
