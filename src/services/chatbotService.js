/**
 * Servicio específico para el Chatbot Nubi ☁️
 * Maneja todas las interacciones con los endpoints del chatbot
 */

import apiService from './apiService';

class ChatbotService {
  constructor() {
    this.basePath = '/api/chatbot';
  }

  /**
   * Enviar mensaje al chatbot (Sistema Híbrido)
   * @param {string} message - Mensaje del usuario
   * @returns {Promise<Object>} Respuesta del chatbot
   */
  async sendMessage(message) {
    try {
      const response = await apiService.post(`${this.basePath}/message`, {
        message: message.trim()
      });
      
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error enviando mensaje al chatbot:', error);
      return {
        success: false,
        error: error.message,
        fallback: "Lo siento, no pude procesar tu mensaje. ¿Puedes intentar de nuevo?"
      };
    }
  }

  /**
   * Obtener información completa del sistema
   * @returns {Promise<Object>} Datos completos del chatbot
   */
  async getCompleteData() {
    try {
      return await apiService.get(`${this.basePath}/data`);
    } catch (error) {
      console.error('Error obteniendo datos completos:', error);
      throw error;
    }
  }

  /**
   * Consultar datos filtrados
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise<Object>} Datos filtrados
   */
  async queryData(filters = {}) {
    try {
      return await apiService.post(`${this.basePath}/query`, filters);
    } catch (error) {
      console.error('Error consultando datos filtrados:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de estaciones
   * @returns {Promise<Object>} Resumen de estaciones
   */
  async getStationsSummary() {
    try {
      return await apiService.get(`${this.basePath}/stations/summary`);
    } catch (error) {
      console.error('Error obteniendo resumen de estaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener información de variables
   * @param {Array} variables - Lista de variables específicas (opcional)
   * @returns {Promise<Object>} Información de variables
   */
  async getVariablesInfo(variables = []) {
    try {
      const params = variables.length > 0 ? { variables: variables.join(',') } : {};
      return await apiService.get(`${this.basePath}/variables/info`, params);
    } catch (error) {
      console.error('Error obteniendo info de variables:', error);
      throw error;
    }
  }

  /**
   * Obtener contexto del chatbot
   * @returns {Promise<Object>} Información contextual
   */
  async getContext() {
    try {
      return await apiService.get(`${this.basePath}/context`);
    } catch (error) {
      console.error('Error obteniendo contexto:', error);
      throw error;
    }
  }

  /**
   * Health check del sistema híbrido
   * @returns {Promise<Object>} Estado del sistema
   */
  async getHealthStatus() {
    try {
      return await apiService.get(`${this.basePath}/chat/health`);
    } catch (error) {
      console.error('Error en health check:', error);
      return {
        status: 'error',
        message: 'No se pudo conectar con el servidor',
        error: error.message
      };
    }
  }

  /**
   * Obtener información del chatbot
   * @returns {Promise<Object>} Información y capacidades del chatbot
   */
  async getChatbotInfo() {
    try {
      return await apiService.get(`${this.basePath}/info`);
    } catch (error) {
      console.error('Error obteniendo info del chatbot:', error);
      throw error;
    }
  }

  /**
   * Health check general del sistema
   * @returns {Promise<Object>} Estado general
   */
  async getGeneralHealth() {
    try {
      return await apiService.get(`${this.basePath}/health`);
    } catch (error) {
      console.error('Error en health check general:', error);
      return {
        status: 'error',
        message: 'Servidor no disponible'
      };
    }
  }
}

// Instancia singleton
const chatbotService = new ChatbotService();

export default chatbotService;
