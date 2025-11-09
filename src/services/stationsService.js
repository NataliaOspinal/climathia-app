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
   * Obtener todas las estaciones
   * @returns {Promise<Array>} Lista de todas las estaciones
   */
  async getAllStations() {
    try {
      return await apiService.get(this.basePath);
    } catch (error) {
      console.error('Error obteniendo todas las estaciones:', error);
      throw error;
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
}

// Instancia singleton
const stationsService = new StationsService();

export default stationsService;
