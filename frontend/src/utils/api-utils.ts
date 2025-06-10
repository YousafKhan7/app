/**
 * Generic API utility functions for common CRUD operations
 */
import type { AxiosResponse } from 'axios';
import apiClient from '../services/api-client';

// Generic CRUD operations
export const createGenericCRUDService = <T, TCreate>(endpoint: string) => ({
  getAll: async (): Promise<T[]> => {
    const response = await apiClient.get(endpoint);
    return response.data[Object.keys(response.data)[0]]; // Get first property value
  },

  create: async (data: TCreate): Promise<any> => {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  update: async (id: number, data: TCreate): Promise<any> => {
    const response = await apiClient.put(`${endpoint}/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`${endpoint}/${id}`);
    return response.data;
  },

  getById: async (id: number): Promise<T> => {
    const response = await apiClient.get(`${endpoint}/${id}`);
    return response.data[Object.keys(response.data)[0]]; // Get first property value
  },
});

// Helper function to extract data from API responses
export const extractResponseData = <T>(response: AxiosResponse, key?: string): T => {
  if (key) {
    return response.data[key];
  }
  
  // If no key specified, try to get the first property that's an array or object
  const data = response.data;
  const keys = Object.keys(data);
  
  if (keys.length === 1) {
    return data[keys[0]];
  }
  
  return data;
};
