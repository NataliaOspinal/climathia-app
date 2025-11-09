// /server/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors'); 

const app = express();
const port = 3001;
app.use(cors()); 

const WL_API_KEY = "yplz8fyxe7hj1ci9iiedzpmrwzi3gez2";
const WL_API_SECRET = "h6nmlepbac1bolv9lbxch21qlc2snzbn";
const WL_BASE_URL = "https://api.weatherlink.com/v2";

// --- ÚNICO ENDPOINT: DATOS ACTUALES ---
app.get('/api/current/:stationId', async (req, res) => {
  const { stationId } = req.params;
  console.log(`\n--- PROXY: Petición CURRENT recibida para ${stationId} ---`);

  try {
    console.log(`PROXY: Llamando a WeatherLink /current para ${stationId}...`);
    const response = await axios.get(`${WL_BASE_URL}/current/${stationId}`, {
      params: { 'api-key': WL_API_KEY },
      headers: { 'X-Api-Secret': WL_API_SECRET }
    });
    
    console.log(`PROXY: Éxito. Enviando datos de WeatherLink a React.`);
    res.json(response.data); // Simplemente reenvía la respuesta

  } catch (error) {
    console.error(`PROXY ERROR para ${stationId}:`);
    if (error.response) {
      console.error('Datos del error (WeatherLink):', error.response.data);
      res.status(error.response.status).json({ 
          message: `Error de WeatherLink: ${error.response.data.message || 'Error desconocido'}` 
      });
    } else {
      console.error('Error (Proxy):', error.message);
      res.status(500).json({ message: "Error interno del proxy", details: error.message });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor proxy (v. SOLO-CURRENT) corriendo en http://localhost:${port}`);
});