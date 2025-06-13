/**
 * Health check and system status API service
 */
import apiClient from './api-client';

export const healthService = {
  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};
