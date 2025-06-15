/**
 * Axios API client configuration with interceptors
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'http://31.97.138.28/api'  // Production URL
    : 'http://localhost:8000',   // Development URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the full error for debugging
    console.error('API Error:', error);
    console.error('Error Response:', error.response);
    console.error('Error Response Data:', error.response?.data);

    // Categorize error types
    let errorCategory = 'unknown';
    let shouldRetry = false;

    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      errorCategory = 'network';
      shouldRetry = true;
    } else if (error.response?.status >= 500) {
      errorCategory = 'server';
      shouldRetry = true;
    } else if (error.response?.status >= 400) {
      errorCategory = 'client';
      shouldRetry = false;
    }

    console.error('Error Category:', errorCategory);

    // Preserve the original error structure for validation error parsing
    // Add error metadata to the original error object
    (error as any).category = errorCategory;
    (error as any).shouldRetry = shouldRetry;
    (error as any).status = error.response?.status;

    // Throw the original error to preserve the response structure
    throw error;
  }
);

export default apiClient;
