/**
 * Servicio centralizado para conectar con la API de FastAPI
 * Maneja todas las llamadas HTTP y configuraciones base
 */

// Configuración base de la API
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

/**
 * Clase principal para manejar todas las llamadas a la API
 */
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultHeaders = API_CONFIG.headers;
  }

  /**
   * Método genérico para hacer peticiones HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: { ...this.defaultHeaders },
      timeout: API_CONFIG.timeout,
      ...options,
    };

    // Si hay body, convertir a JSON
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`🌐 API Request: ${config.method} ${url}`);
      
      const response = await fetch(url, config);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      // Intentar parsear JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ API Response: ${config.method} ${url}`, data);
        return data;
      } else {
        const text = await response.text();
        console.log(`✅ API Response (text): ${config.method} ${url}`, text);
        return text;
      }

    } catch (error) {
      console.error(`❌ API Error: ${config.method} ${url}`, error);
      throw new ApiError(error.message, endpoint, config.method);
    }
  }

  // Métodos HTTP específicos
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

/**
 * Clase personalizada para errores de API
 */
class ApiError extends Error {
  constructor(message, endpoint, method) {
    super(message);
    this.name = 'ApiError';
    this.endpoint = endpoint;
    this.method = method;
    this.timestamp = new Date().toISOString();
  }
}

// Instancia singleton del servicio
const apiService = new ApiService();

export default apiService;
export { ApiError };
