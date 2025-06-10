/**
 * File upload and management API service
 */
import apiClient from './api-client';

export const fileService = {
  // Upload image
  uploadImage: async (file: File): Promise<{filename: string, url: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
