import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet'; 
import iconoLocationURL from './location.png'; // Asumiendo que está en la misma carpeta
import { stationsService } from '../services';

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


// --- COMPONENTE DE CONTENIDO DEL POPUP ---
function PopupContent({ stationId, name, selectedDate }) {
  const [stationData, setStationData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setStationData(null);

      try {
        const dateStr = stationsService.formatDateForApi(selectedDate);
        console.log(`[${name}] Obteniendo datos para fecha: ${dateStr}`);
        
        const result = await stationsService.getStationDailyAverages(stationId, dateStr);
        
        if (result.success && result.data?.data) {
          setStationData(result.data.data);
        } else {
          setError(result.error || "No hay datos disponibles para esta fecha");
        }
      } catch (error) {
        console.error(`[${name}] Error cargando datos:`, error);
        setError("Error de conexión con el servidor");
      }
      setIsLoading(false);
    };
    loadData();
    
  }, [stationId, name, selectedDate]);

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

// --- COMPONENTE MARCADOR ---
function AirQualityMarker({ stationId, position, name, icon, selectedDate }) {
  return (
    <Marker position={position} icon={icon}>
      <Tooltip>{name}</Tooltip>
      <Popup>
        <PopupContent 
          stationId={stationId} 
          name={name} 
          selectedDate={selectedDate}
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

// --- COMPONENTE PRINCIPAL (Exportado) ---
const MapComponent = ({ stations, selectedDate }) => {
  
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
            key={station.station_id} 
            stationId={station.station_id}
            position={[station.lat, station.lon]} 
            name={`${station.station_name} (${station.tipo_equipo})`} 
            icon={customIcon} 
            selectedDate={selectedDate}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;