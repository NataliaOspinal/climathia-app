import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import axios from 'axios'; 
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet'; 
import iconoLocationURL from './location.png'; // Asumiendo que está en la misma carpeta

// !! RECORDATORIO VITAL (CSS) !!
// Asegúrate de que 'import "leaflet/dist/leaflet.css";' esté en tu 'src/main.jsx'
// --------------------------------------------------------

// --- ICONO PERSONALIZADO ---
const customIcon = L.icon({
  iconUrl: iconoLocationURL,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

// --- 1. FUNCIÓN HELPER: ¿Es hoy? ---
function isToday(someDate) {
  if (!someDate) return false;
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
         someDate.getMonth() === today.getMonth() &&
         someDate.getFullYear() === today.getFullYear();
}

// --- FUNCIÓN HELPER: Calcular Promedios ---
// (Esta función toma las filas de un día y calcula el promedio)
function calculateAveragesFromRows(rows, columnsToAverage) {
  const sums = {};
  const counts = {};
  columnsToAverage.forEach(key => {
    sums[key] = 0;
    counts[key] = 0;
  });

  for (const row of rows) {
    for (const key of columnsToAverage) {
      // Comprueba si el valor existe y es un número
      if (row[key] !== null && typeof row[key] !== 'undefined' && !isNaN(row[key])) {
        sums[key] += Number(row[key]);
        counts[key]++;
      }
    }
  }

  const averages = {};
  columnsToAverage.forEach(key => {
    averages[key] = counts[key] > 0 ? (sums[key] / counts[key]) : null;
  });
  return averages;
}


// --- 3. FUNCIÓN HELPER: Buscar en el ÍNDICE (Rápido) ---
// (Esta función usa el índice pre-calculado para encontrar datos)
function findDataInIndex(date, stationId, historicDataIndex) {
  // 1. Formatea la fecha a YYYY-MM-DD
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  console.log(`Buscando en ÍNDICE para el POPUP por fecha: ${dateString} y ID: ${stationId}`);
  
  // 2. Búsqueda instantánea en el índice
  const rowsForDay = historicDataIndex[String(stationId)]?.[dateString] || [];

  if (rowsForDay.length === 0) {
    console.log("No se encontraron filas en ÍNDICE para ese día y estación.");
    return null;
  }

  console.log(`Filas encontradas (índice): ${rowsForDay.length}. Calculando promedio...`);

  // --- 3. Nombres de columna de tu CSV (¡Asegúrate que coincidan!) ---
  const columnsToAverage = [
    'ica', 'humedad', 'pm_1', 'pm_2_5', 'pm_10'
  ];
  
  const averages = calculateAveragesFromRows(rowsForDay, columnsToAverage);

  // 4. Normaliza los nombres para que el JSX los entienda
  return {
    hum: averages.humedad,
    hum_out: null, // (No lo usamos)
    pm_1p0: averages.pm_1,
    pm_2p5: averages.pm_2_5,
    pm_10p0: averages.pm_10,
    ica: averages.ica,
    ts: null // Es un promedio
  };
}


// --- 4. HELPER: Componente para manejar NA ---
function RenderValue({ label, value, unit, decimals = 1 }) {
  const isInvalid = (value === null || typeof value === 'undefined' || isNaN(value));
  return (
    <p style={{ margin: '2px 0' }}>
      {label}: <b>
        {isInvalid ? (
          <span style={{ color: '#888' }}>NA</span>
        ) : (
          `${value.toFixed(decimals)}${unit}`
        )}
      </b>
    </p>
  );
}


// --- 5. COMPONENTE DE CONTENIDO (Lógica de API vs CSV) ---
// (Recibe el índice 'historicDataIndex')
function PopupContent({ stationId, name, selectedDate, historicDataIndex }) {
  const [stationData, setStationData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setStationData(null);

      if (isToday(selectedDate)) {
        // --- A. ES HOY: Llamar a la API para datos ACTUALES ---
        console.log(`[${name}] Fecha es HOY. Llamando a API /current...`);
        try {
          const response = await axios.get(`http://localhost:3001/api/current/${stationId}`);
          if (response.data.data) {
            setStationData(response.data.data);
          } else {
            setError(response.data.message || "Estación en línea, pero no reporta datos.");
          }
        } catch (err) {
          console.error(`[${name}] ¡Error llamando al proxy!`, err);
          if (err.code === "ERR_NETWORK") { setError("Error de red. ¿El servidor proxy (node server.js) está corriendo?"); }
          else if (err.response) { setError(`Error del Servidor: ${err.response.data.message || err.message}`); }
          else { setError("Error al cargar datos."); }
        }

      } else {
        // --- B. ES FECHA PASADA: Leer del ÍNDICE ---
        console.log(`[${name}] Fecha es HISTÓRICA. Buscando en ÍNDICE...`);
        if (!historicDataIndex) { // Comprueba si el índice está listo
          setError("Datos históricos (Índice) no están cargados.");
          setIsLoading(false);
          return;
        }
        
        // Llama a nuestra función helper (la que usa el índice)
        const csvData = findDataInIndex(selectedDate, stationId, historicDataIndex);
        
        if (csvData) {
          setStationData(csvData);
        } else {
          setError("No se encontraron datos en el CSV para este día y esta estación.");
        }
      }
      setIsLoading(false);
    };
    loadData();
    
  }, [stationId, name, selectedDate, historicDataIndex]); // Dependencia actualizada

  // --- RENDERIZADO DE DATOS (Simplificado) ---
  return (
    <div>
      <b>{name}</b>
      <hr style={{ margin: '8px 0' }} />
      {isLoading && <p>Cargando datos...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>} 
      
      {stationData && (
        <div>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            {stationData.ts ? 'Datos Actuales:' : 'Promedio del Día:'}
          </p>
          <RenderValue label="ICA Promedio" value={stationData.ica} unit="" decimals={1} />
          <RenderValue label="Humedad" value={stationData.hum} unit="%" decimals={1} />
          <RenderValue label="PM1" value={stationData.pm_1p0} unit=" µg/m³" decimals={2} />
          <RenderValue label="PM2.5" value={stationData.pm_2p5} unit=" µg/m³" decimals={2} />
          <RenderValue label="PM10" value={stationData.pm_10p0} unit=" µg/m³" decimals={2} />
          
          {/* El timestamp SÓLO se muestra si es de la API (datos actuales) */}
          {stationData.ts && (
            <p style={{ fontSize: '0.8em', color: '#555', margin: '10px 0 0 0' }}>
              Última act: {new Date(stationData.ts * 1000).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// --- 6. COMPONENTE MARCADOR (Pasa 'historicDataIndex') ---
function AirQualityMarker({ stationId, position, name, icon, selectedDate, historicDataIndex }) {
  return (
    <Marker position={position} icon={icon}>
      <Tooltip>{name}</Tooltip>
      <Popup>
        <PopupContent 
          stationId={stationId} 
          name={name} 
          selectedDate={selectedDate}
          historicDataIndex={historicDataIndex} // <-- Prop actualizado
        />
      </Popup>
    </Marker>
  );
}

// --- 7. COMPONENTE "ARREGLADOR" DEL MAPA ---
function MapFix({ bounds }) {
  const map = useMap(); 

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [map, bounds]); 

  return null;
}

// --- 8. COMPONENTE PRINCIPAL (Exportado) ---
const MapComponent = ({ stations, selectedDate, historicDataIndex }) => {
  
  let mapBounds = null;
  if (stations && stations.length > 0) {
    const markerCoords = stations.map(station => [station.lat, station.lon]);
    mapBounds = L.latLngBounds(markerCoords);
  } else {
    mapBounds = L.latLngBounds([ [7.13, -73.12], [6.0, -73.8] ]);
  }

  return (
    <div className="lg:w-1/2 bg-lime-100 p-4 rounded-lg shadow-lg relative h-[600px] overflow-hidden">
      
      <button className="absolute bottom-4 right-4 z-10 bg-green text-white p-3 rounded-full shadow-lg"><MapPin size={24} /></button>

      <MapContainer
        center={[7.13, -73.12]}
        zoom={10}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          height: '100%', 
          width: '100%', 
          zIndex: 0 
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapFix bounds={mapBounds} />

        {stations.map((station) => (
          <AirQualityMarker
            key={`${station.station_id}-${station.tipo_equipo}`} 
            stationId={station.station_id}
            position={[station.lat, station.lon]} 
            name={station.station_name} 
            icon={customIcon} 
            selectedDate={selectedDate}
            historicDataIndex={historicDataIndex} // <-- Prop actualizado
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;