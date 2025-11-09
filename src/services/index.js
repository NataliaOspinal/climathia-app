/**
 * Índice de servicios - Exporta todos los servicios de la aplicación
 * Punto de entrada centralizado para importar servicios en componentes
 */

// Servicio base
export { default as apiService, ApiError } from './apiService';

// Servicios específicos
export { default as chatbotService } from './chatbotService';
export { default as stationsService } from './stationsService';

// Hooks personalizados
export { default as useApi } from './hooks/useApi';
export { default as useChatbot } from './hooks/useChatbot';

/**
 * Configuración global de servicios
 */
export const servicesConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

/**
 * Utilidades para servicios
 */
export const serviceUtils = {
  /**
   * Formatear fecha para API
   */
  formatDateForApi: (date) => {
    return date instanceof Date ? date.toISOString() : date;
  },

  /**
   * Validar respuesta de API
   */
  validateApiResponse: (response) => {
    return response && typeof response === 'object' && !response.error;
  },

  /**
   * Manejar errores de API de forma consistente
   */
  handleApiError: (error, fallbackMessage = 'Error de conexión') => {
    console.error('API Error:', error);
    
    if (error.name === 'ApiError') {
      return {
        message: error.message,
        endpoint: error.endpoint,
        method: error.method,
        timestamp: error.timestamp
      };
    }
    
    return {
      message: fallbackMessage,
      originalError: error.message,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Crear parámetros de consulta
   */
  createQueryParams: (params) => {
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    return new URLSearchParams(filtered).toString();
  }
};
