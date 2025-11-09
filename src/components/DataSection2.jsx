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

  return (
    <section className="bg-cyan-100 py-20 px-4" id="DataSection2">
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
              <button className="bg-lime-200 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-lime-300 transition-colors">
                Explícame
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
                        ? "bg-teal-100 text-teal-900 shadow-md"
                        : "bg-transparent hover:bg-gray-50 border-b border-gray-400 text-gray-800"
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
