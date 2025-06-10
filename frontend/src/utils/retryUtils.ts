/**
 * Utility functions for handling API retries with exponential backoff
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Implements exponential backoff retry logic
 * @param fn Function to retry
 * @param options Retry configuration options
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error: any) => error.shouldRetry || error.category === 'network'
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on last attempt or if error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Creates a retry wrapper for API functions
 * @param apiFunction The API function to wrap
 * @param options Retry configuration options
 */
export const createRetryWrapper = <T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  options: RetryOptions = {}
): T => {
  return ((...args: any[]) => {
    return withRetry(() => apiFunction(...args), options);
  }) as T;
};
