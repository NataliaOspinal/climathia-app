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
      const response = await apiService.get(`${this.basePath}/info`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error obteniendo información del chatbot:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
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

  /**
   * 🤖 Generar pregunta contextual para análisis de datos
   * @param {Object} context - Contexto de los datos a analizar
   * @returns {string} Pregunta robusta para el chatbot
   */
  generateContextualQuestion(context) {
    const {
      stationId,
      stationName,
      dateRange,
      dataType,
      chartData,
      averages,
      trends,
      location
    } = context;

    let question = "Analiza los siguientes datos meteorológicos y de calidad del aire:\n\n";

    // Información de la estación
    if (stationId && stationName) {
      question += `📍 **Estación:** ${stationName} (ID: ${stationId})\n`;
    }
    
    if (location) {
      question += `📍 **Ubicación:** Lat ${location.lat}, Lon ${location.lon}\n`;
    }

    // Rango de fechas
    if (dateRange) {
      if (dateRange.start === dateRange.end) {
        question += `📅 **Fecha:** ${dateRange.start}\n`;
      } else {
        question += `📅 **Período:** ${dateRange.start} a ${dateRange.end}\n`;
      }
    }

    question += "\n";

    // Datos específicos según el tipo
    if (dataType === 'pm' && chartData?.length > 0) {
      const latestPM = chartData[chartData.length - 1];
      question += `🌫️ **Datos de Partículas (última medición):**\n`;
      question += `- PM1.0: ${latestPM.pm_1?.toFixed(2) || 'N/A'} µg/m³\n`;
      question += `- PM2.5: ${latestPM.pm_2_5?.toFixed(2) || 'N/A'} µg/m³\n`;
      question += `- PM10: ${latestPM.pm_10?.toFixed(2) || 'N/A'} µg/m³\n`;
      question += `- Total de mediciones: ${chartData.length}\n\n`;
    }

    if (dataType === 'humidity' && chartData?.length > 0) {
      const latestHum = chartData[chartData.length - 1];
      const avgHum = chartData.reduce((sum, d) => sum + d.humedad, 0) / chartData.length;
      question += `💧 **Datos de Humedad:**\n`;
      question += `- Última medición: ${latestHum.humedad?.toFixed(2) || 'N/A'}%\n`;
      question += `- Promedio: ${avgHum.toFixed(2)}%\n`;
      question += `- Total de mediciones: ${chartData.length}\n\n`;
    }

    if (dataType === 'ica' && chartData?.length > 0) {
      const latestICA = chartData[chartData.length - 1];
      const avgICA = chartData.reduce((sum, d) => sum + d.ica, 0) / chartData.length;
      question += `🌬️ **Datos de Índice de Calidad del Aire (ICA):**\n`;
      question += `- Última medición: ${latestICA.ica?.toFixed(0) || 'N/A'}\n`;
      question += `- Promedio: ${avgICA.toFixed(0)}\n`;
      question += `- Total de mediciones: ${chartData.length}\n\n`;
    }

    if (dataType === 'temperature' && chartData?.length > 0) {
      const latestTemp = chartData[chartData.length - 1];
      const avgTemp = chartData.reduce((sum, d) => sum + d.temperatura, 0) / chartData.length;
      question += `🌡️ **Datos de Temperatura:**\n`;
      question += `- Última medición: ${latestTemp.temperatura?.toFixed(2) || 'N/A'}°C\n`;
      question += `- Promedio: ${avgTemp.toFixed(2)}°C\n`;
      question += `- Total de mediciones: ${chartData.length}\n\n`;
    }

    // Promedios generales si están disponibles
    if (averages) {
      question += `📊 **Promedios del período:**\n`;
      Object.entries(averages).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const unit = this.getUnitForVariable(key);
          question += `- ${this.getLabelForVariable(key)}: ${value.toFixed(2)}${unit}\n`;
        }
      });
      question += "\n";
    }

    // Menú interactivo de preguntas
    question += `❓ **Selecciona qué aspecto quieres que analice:**\n\n`;
    question += `**1.** 🔍 Evaluación de calidad del aire y condiciones meteorológicas\n`;
    question += `**2.** 📈 Análisis de patrones y tendencias preocupantes\n`;
    question += `**3.** 💡 Recomendaciones basadas en estos datos\n`;
    question += `**4.** 📊 Comparación con estándares de calidad del aire\n`;
    question += `**5.** 🌟 Análisis completo (todas las preguntas)\n\n`;
    question += `Por favor, responde con el **número** de la opción que te interesa más.`;

    return question;
  }

  /**
   * 🏷️ Obtener etiqueta legible para una variable
   */
  getLabelForVariable(variable) {
    const labels = {
      'pm_1': 'PM1.0',
      'pm_2_5': 'PM2.5', 
      'pm_10': 'PM10',
      'humedad': 'Humedad',
      'ica': 'ICA',
      'temperatura': 'Temperatura',
      'temp': 'Temperatura',
      'presion': 'Presión',
      'viento_vel': 'Velocidad del viento',
      'precipitacion': 'Precipitación'
    };
    return labels[variable] || variable;
  }

  /**
   * 📏 Obtener unidad para una variable
   */
  getUnitForVariable(variable) {
    const units = {
      'pm_1': ' µg/m³',
      'pm_2_5': ' µg/m³',
      'pm_10': ' µg/m³', 
      'humedad': '%',
      'ica': '',
      'temperatura': '°C',
      'temp': '°C',
      'presion': ' hPa',
      'viento_vel': ' m/s',
      'precipitacion': ' mm'
    };
    return units[variable] || '';
  }

  /**
   * 🚀 Enviar pregunta contextual automática al chatbot (menú inicial)
   * @param {Object} context - Contexto de los datos
   * @returns {Promise<Object>} Respuesta del chatbot con menú de opciones
   */
  async explainData(context) {
    try {
      const question = this.generateContextualQuestion(context);
      
      console.log('🤖 Enviando menú interactivo con Gemini:', question);
      
      // Usar el endpoint específico que SIEMPRE usa Gemini
      const response = await this.explainWithGemini(question);
      
      return {
        success: true,
        question: question,
        response: response,
        context: context,
        isMenu: true // Indicar que es un menú interactivo
      };
    } catch (error) {
      console.error('Error enviando pregunta contextual:', error);
      return {
        success: false,
        error: error.message,
        question: null,
        response: null
      };
    }
  }

  /**
   * 🎯 Generar pregunta específica según la selección del usuario
   * @param {Object} context - Contexto de los datos
   * @param {number} optionNumber - Número de la opción seleccionada (1-5)
   * @returns {string} Pregunta específica para Gemini
   */
  generateSpecificQuestion(context, optionNumber) {
    const {
      stationId,
      stationName,
      dateRange,
      chartData,
      averages,
      location
    } = context;

    // Construir contexto base
    let question = "Analiza los siguientes datos meteorológicos y de calidad del aire:\n\n";

    // Información de la estación
    if (stationId && stationName) {
      question += `📍 **Estación:** ${stationName} (ID: ${stationId})\n`;
    }
    
    if (location) {
      question += `📍 **Ubicación:** Lat ${location.lat}, Lon ${location.lon}\n`;
    }

    // Rango de fechas
    if (dateRange) {
      if (dateRange.start === dateRange.end) {
        question += `📅 **Fecha:** ${dateRange.start}\n`;
      } else {
        question += `📅 **Período:** ${dateRange.start} a ${dateRange.end}\n`;
      }
    }

    question += "\n";

    // Promedios generales
    if (averages) {
      question += `📊 **Promedios del período:**\n`;
      Object.entries(averages).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const unit = this.getUnitForVariable(key);
          question += `- ${this.getLabelForVariable(key)}: ${value.toFixed(2)}${unit}\n`;
        }
      });
      question += "\n";
    }

    // Pregunta específica según la opción seleccionada
    switch (parseInt(optionNumber)) {
      case 1:
        question += `🔍 **ANÁLISIS SOLICITADO:**\n`;
        question += `Por favor, evalúa estos datos y explica qué indican sobre la calidad del aire y las condiciones meteorológicas actuales. `;
        question += `Incluye una interpretación técnica de cada variable y su significado para la salud pública.`;
        break;
        
      case 2:
        question += `📈 **ANÁLISIS SOLICITADO:**\n`;
        question += `Identifica y analiza cualquier patrón o tendencia preocupante en estos datos. `;
        question += `¿Hay valores que sugieran problemas ambientales o de salud? ¿Qué factores podrían estar causando estos patrones?`;
        break;
        
      case 3:
        question += `💡 **ANÁLISIS SOLICITADO:**\n`;
        question += `Basándote en estos datos específicos, proporciona recomendaciones prácticas y específicas. `;
        question += `Incluye consejos para la población, autoridades ambientales y acciones preventivas recomendadas.`;
        break;
        
      case 4:
        question += `📊 **ANÁLISIS SOLICITADO:**\n`;
        question += `Compara estos valores con los estándares nacionales e internacionales de calidad del aire. `;
        question += `¿Están dentro de los límites seguros? ¿Cómo se clasificarían según las escalas de la OMS y EPA?`;
        break;
        
      case 5:
        question += `🌟 **ANÁLISIS COMPLETO SOLICITADO:**\n`;
        question += `Proporciona un análisis integral que incluya:\n`;
        question += `1. Evaluación de calidad del aire y condiciones meteorológicas\n`;
        question += `2. Identificación de patrones y tendencias preocupantes\n`;
        question += `3. Recomendaciones específicas basadas en los datos\n`;
        question += `4. Comparación con estándares de calidad del aire`;
        break;
        
      default:
        question += `❓ **Por favor, selecciona una opción válida (1-5):**\n`;
        question += `**1.** 🔍 Evaluación de calidad del aire y condiciones meteorológicas\n`;
        question += `**2.** 📈 Análisis de patrones y tendencias preocupantes\n`;
        question += `**3.** 💡 Recomendaciones basadas en estos datos\n`;
        question += `**4.** 📊 Comparación con estándares de calidad del aire\n`;
        question += `**5.** 🌟 Análisis completo (todas las preguntas)`;
        break;
    }

    return question;
  }

  /**
   * 🎯 Enviar pregunta específica según selección del usuario
   * @param {Object} context - Contexto de los datos
   * @param {number} optionNumber - Número de la opción seleccionada
   * @returns {Promise<Object>} Respuesta específica de Gemini
   */
  async explainSpecificOption(context, optionNumber) {
    try {
      const question = this.generateSpecificQuestion(context, optionNumber);
      
      console.log(`🎯 Enviando pregunta específica ${optionNumber} a Gemini:`, question.substring(0, 100) + '...');
      
      const response = await this.explainWithGemini(question);
      
      return {
        success: true,
        question: question,
        response: response,
        context: context,
        selectedOption: optionNumber,
        isMenu: false // Indicar que es una respuesta específica
      };
    } catch (error) {
      console.error('Error enviando pregunta específica:', error);
      return {
        success: false,
        error: error.message,
        question: null,
        response: null
      };
    }
  }

  /**
   * 🤖 Enviar mensaje específicamente al endpoint que FUERZA Gemini IA
   * @param {string} message - Mensaje a enviar
   * @returns {Promise<Object>} Respuesta de Gemini IA
   */
  async explainWithGemini(message) {
    try {
      console.log('🚀 Enviando a endpoint /explain (FUERZA Gemini):', message.substring(0, 100) + '...');
      
      const response = await apiService.post(`${this.basePath}/explain`, {
        message: message
      });
      
      console.log('✅ Respuesta de Gemini recibida:', response?.response?.substring(0, 100) + '...');
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error en endpoint /explain:', error);
      return {
        success: false,
        message: 'Error procesando con Gemini IA',
        error: error.message
      };
    }
  }
}

// Instancia singleton
const chatbotService = new ChatbotService();

export default chatbotService;
