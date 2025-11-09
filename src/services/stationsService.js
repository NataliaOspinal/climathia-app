/**
 * Servicio para las Estaciones Meteorológicas
 * Maneja todas las interacciones con los endpoints de estaciones
 */

import apiService from './apiService';

class StationsService {
  constructor() {
    this.basePath = '/api/stations';
  }

  /**
   * Obtener lista de todas las estaciones
   * @returns {Promise<Array>} Lista de estaciones
   */
  async getStations() {
    try {
      const response = await apiService.get(this.basePath);
      return response || [];
    } catch (error) {
      console.error('Error obteniendo estaciones:', error);
      return [];
    }
  }

  /**
   * Alias para getStations() - mantiene compatibilidad
   * @returns {Promise<Array>} Lista de todas las estaciones
   */
  async getAllStations() {
    return this.getStations();
  }

  /**
   * 📡 Obtener lista de estaciones AirLink únicamente
   * Perfecto para selectores y gráficos
   * @returns {Promise<Array>} Lista de estaciones AirLink
   */
  async getAirLinkStations() {
    try {
      const response = await apiService.get(`${this.basePath}/airlink`);
      return response?.stations || [];
    } catch (error) {
      console.error('Error obteniendo estaciones AirLink:', error);
      return [];
    }
  }

  /**
   * Obtener datos de una estación específica
   * @param {number} stationId - ID de la estación
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>} Datos de la estación
   */
  async getStationData(stationId, options = {}) {
    try {
      const params = {};
      
      // Agregar filtros opcionales
      if (options.startDate) params.start_date = options.startDate;
      if (options.endDate) params.end_date = options.endDate;
      if (options.variables && options.variables.length > 0) {
        params.variables = options.variables.join(',');
      }
      if (options.limit) params.limit = options.limit;

      return await apiService.get(`${this.basePath}/${stationId}`, params);
    } catch (error) {
      console.error(`Error obteniendo datos de estación ${stationId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener datos recientes de una estación
   * @param {number} stationId - ID de la estación
   * @param {number} hours - Horas hacia atrás (por defecto 24)
   * @returns {Promise<Array>} Datos recientes
   */
  async getRecentData(stationId, hours = 24) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (hours * 60 * 60 * 1000));
      
      return await this.getStationData(stationId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    } catch (error) {
      console.error(`Error obteniendo datos recientes de estación ${stationId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de una estación
   * @param {number} stationId - ID de la estación
   * @param {Array} variables - Variables específicas
   * @returns {Promise<Object>} Estadísticas calculadas
   */
  async getStationStats(stationId, variables = []) {
    try {
      const data = await this.getStationData(stationId, { variables });
      
      // Calcular estadísticas básicas
      const stats = {};
      
      if (data && data.length > 0) {
        const variablesToAnalyze = variables.length > 0 ? variables : 
          ['temp', 'humedad', 'presion', 'pm_2_5', 'ica'];
        
        variablesToAnalyze.forEach(variable => {
          const values = data
            .map(record => record[variable])
            .filter(value => value !== null && value !== undefined && !isNaN(value));
          
          if (values.length > 0) {
            stats[variable] = {
              count: values.length,
              min: Math.min(...values),
              max: Math.max(...values),
              avg: values.reduce((sum, val) => sum + val, 0) / values.length,
              latest: values[values.length - 1]
            };
          }
        });
      }
      
      return {
        stationId,
        recordCount: data?.length || 0,
        statistics: stats,
        lastUpdate: data?.length > 0 ? data[data.length - 1].timestamp : null
      };
    } catch (error) {
      console.error(`Error calculando estadísticas de estación ${stationId}:`, error);
      throw error;
    }
  }

  /**
   * Comparar múltiples estaciones
   * @param {Array} stationIds - IDs de las estaciones a comparar
   * @param {Array} variables - Variables a comparar
   * @returns {Promise<Object>} Comparación de estaciones
   */
  async compareStations(stationIds, variables = ['temp', 'humedad', 'pm_2_5', 'ica']) {
    try {
      const comparisons = await Promise.all(
        stationIds.map(async (stationId) => {
          const stats = await this.getStationStats(stationId, variables);
          const stationInfo = await this.getStationData(stationId, { limit: 1 });
          
          return {
            stationId,
            stationName: stationInfo[0]?.station_name || `Estación ${stationId}`,
            ...stats
          };
        })
      );

      return {
        comparison: comparisons,
        variables: variables,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error comparando estaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener promedios diarios de una estación (para MapComponent)
   * @param {number} stationId - ID de la estación
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {Array} variables - Variables a promediar (opcional)
   * @returns {Promise<Object>} Promedios calculados
   */
  async getStationDailyAverages(stationId, date, variables = ['ica', 'humedad', 'pm_1', 'pm_2_5', 'pm_10', 'temp', 'precipitacion']) {
    try {
      const params = {
        date: date,
        variables: variables.join(',')
      };

      const response = await apiService.get(`${this.basePath}/${stationId}/averages`, params);
      
      return {
        success: true,
        data: response,
        stationId: stationId,
        date: date,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error obteniendo promedios diarios de estación ${stationId}:`, error);
      
      return {
        success: false,
        error: error.message,
        stationId: stationId,
        date: date,
        data: null
      };
    }
  }

  /**
   * 🗺️ MÉTODO PRINCIPAL PARA EL MAPA
   * Obtener promedios de TODAS las estaciones para una fecha
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {Array} variables - Variables a promediar
   * @returns {Promise<Object>} Promedios de todas las estaciones
   */
  async getAllStationsAverages(date, variables = ['ica', 'humedad', 'pm_1', 'pm_2_5', 'pm_10', 'temp', 'precipitacion']) {
    try {
      const params = {
        date: date,
        variables: variables.join(',')
      };

      const response = await apiService.get(`${this.basePath}/averages`, params);
      
      return {
        success: true,
        data: response,
        date: date,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error obteniendo promedios de todas las estaciones:`, error);
      
      return {
        success: false,
        error: error.message,
        date: date,
        data: null
      };
    }
  }

  /**
   * Obtener promedios para múltiples estaciones específicas en una fecha
   * @param {Array} stationIds - IDs de las estaciones específicas
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {Array} variables - Variables a promediar
   * @returns {Promise<Object>} Promedios de las estaciones especificadas
   */
  async getMultipleStationAverages(stationIds, date, variables = ['ica', 'humedad', 'pm_1', 'pm_2_5', 'pm_10', 'temp', 'precipitacion']) {
    try {
      const results = await Promise.all(
        stationIds.map(async (stationId) => {
          const result = await this.getStationDailyAverages(stationId, date, variables);
          return {
            stationId,
            ...result
          };
        })
      );

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        date: date,
        total: stationIds.length,
        successful: successful.length,
        failed: failed.length,
        results: results,
        data: successful.map(r => ({
          stationId: r.stationId,
          ...r.data
        }))
      };
    } catch (error) {
      console.error('Error obteniendo promedios múltiples:', error);
      throw error;
    }
  }

  /**
   * 📊 MÉTODO PARA DATOS DE GRÁFICOS
   * Obtener datos detallados de una estación para gráficos
   * @param {number} stationId - ID de la estación
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Object>} Datos detallados con timestamps
   */
  async getStationDetailedData(stationId, date) {
    try {
      const params = {
        date: date
      };

      const response = await apiService.get(`${this.basePath}/${stationId}/detailed-data`, params);
      
      return {
        success: true,
        data: response,
        stationId: stationId,
        date: date,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error obteniendo datos detallados de estación ${stationId}:`, error);
      
      return {
        success: false,
        error: error.message,
        stationId: stationId,
        date: date,
        data: null
      };
    }
  }

  /**
   * 📈 Obtener datos específicos para gráfico PM
   * @param {number} stationId - ID de la estación
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>} Array de objetos {timestamp, pm_1, pm_2_5, pm_10}
   */
  async getPmChartData(stationId, date) {
    try {
      const result = await this.getStationDetailedData(stationId, date);
      
      if (!result.success || !result.data?.data?.measurements) {
        return [];
      }

      return result.data.data.measurements
        .filter(m => m.pm_1 !== null || m.pm_2_5 !== null || m.pm_10 !== null)
        .map(measurement => ({
          timestamp: measurement.timestamp,
          pm_1: measurement.pm_1,
          pm_2_5: measurement.pm_2_5,
          pm_10: measurement.pm_10
        }));
    } catch (error) {
      console.error(`Error obteniendo datos PM para estación ${stationId}:`, error);
      return [];
    }
  }

  /**
   * 💧 Obtener datos específicos para gráfico de Humedad
   * @param {number} stationId - ID de la estación
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>} Array de objetos {timestamp, humedad}
   */
  async getHumidityChartData(stationId, date) {
    try {
      const result = await this.getStationDetailedData(stationId, date);
      
      if (!result.success || !result.data?.data?.measurements) {
        return [];
      }

      return result.data.data.measurements
        .filter(m => m.humedad !== null)
        .map(measurement => ({
          timestamp: measurement.timestamp,
          humedad: measurement.humedad
        }));
    } catch (error) {
      console.error(`Error obteniendo datos de humedad para estación ${stationId}:`, error);
      return [];
    }
  }

  /**
   * 🌬️ Obtener datos específicos para gráfico ICA
   * @param {number} stationId - ID de la estación
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>} Array de objetos {timestamp, ica}
   */
  async getIcaChartData(stationId, date) {
    try {
      const result = await this.getStationDetailedData(stationId, date);
      
      if (!result.success || !result.data?.data?.measurements) {
        return [];
      }

      return result.data.data.measurements
        .filter(m => m.ica !== null)
        .map(measurement => ({
          timestamp: measurement.timestamp,
          ica: measurement.ica
        }));
    } catch (error) {
      console.error(`Error obteniendo datos ICA para estación ${stationId}:`, error);
      return [];
    }
  }

  /**
   * 🌡️ Obtener datos específicos para gráfico de Temperatura
   * @param {number} stationId - ID de la estación
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>} Array de objetos {timestamp, temperatura}
   */
  async getTemperatureChartData(stationId, date) {
    try {
      const result = await this.getStationDetailedData(stationId, date);
      
      if (!result.success || !result.data?.data?.measurements) {
        return [];
      }

      return result.data.data.measurements
        .filter(m => m.temperatura !== null)
        .map(measurement => ({
          timestamp: measurement.timestamp,
          temperatura: measurement.temperatura
        }));
    } catch (error) {
      console.error(`Error obteniendo datos de temperatura para estación ${stationId}:`, error);
      return [];
    }
  }

  /**
   * Formatear fecha para la API
   * @param {Date} date - Fecha a formatear
   * @returns {string} Fecha en formato YYYY-MM-DD
   */
  formatDateForApi(date) {
    if (!date) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}

// Instancia singleton
const stationsService = new StationsService();

export default stationsService;
