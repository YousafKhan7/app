/**
 * User-related API service
 */
import { withRetry } from '../utils/retryUtils';
import apiClient from './api-client';
import type { User, UserCreate, PaginationParams, PaginatedResponse } from '../types';

export const userService = {
  // Get users with optional pagination
  getUsers: async (params?: PaginationParams): Promise<User[] | PaginatedResponse<User>> => {
    return withRetry(async () => {
      const response = await apiClient.get('/users', { params });

      // If pagination params provided, return paginated response
      if (params && (params.page || params.limit || params.search)) {
        return {
          data: response.data.users,
          pagination: response.data.pagination
        };
      }

      // Otherwise return just the users array for backward compatibility
      return response.data.users;
    });
  },

  // Get active users count
  getActiveUsersCount: async (): Promise<number> => {
    return withRetry(async () => {
      const response = await apiClient.get('/users/active-count');
      return response.data.active_users_count;
    });
  },

  // Create user
  createUser: async (user: UserCreate): Promise<any> => {
    const response = await apiClient.post('/users', user);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, user: UserCreate): Promise<any> => {
    const response = await apiClient.put(`/users/${id}`, user);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
