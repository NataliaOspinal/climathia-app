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
          <button className="bg-lime-200 text-gray-800 cursor-pointer font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-lime-300 transition-colors">
            Explícame
          </button>
        </div>
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
