import { useState, useEffect, useRef } from 'react';
import { parseValidationErrors } from '../utils/errorParser';

export const useErrorHandler = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showError = (message: string | any) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    let userFriendlyMessage: string;

    // If it's an error object (from API), parse validation errors
    if (typeof message === 'object' && message !== null) {
      userFriendlyMessage = parseValidationErrors(message);
    } else {
      // Convert technical database errors to user-friendly messages
      userFriendlyMessage = message;

      if (message.includes('Duplicate entry')) {
        userFriendlyMessage = 'Duplicate value detected. Please use a different value.';
      } else if (message.includes('foreign key constraint')) {
        userFriendlyMessage = 'Cannot delete this record because it is being used elsewhere.';
      } else if (message.includes('Data too long')) {
        userFriendlyMessage = 'The entered data is too long. Please shorten your input.';
      } else if (message.includes('cannot be null')) {
        userFriendlyMessage = 'Please fill in all required fields.';
      } else if (message.includes('Connection refused') || message.includes('ECONNREFUSED')) {
        userFriendlyMessage = 'Unable to connect to the server. Please try again later.';
      } else if (message.includes('Network Error')) {
        userFriendlyMessage = 'Network connection error. Please check your internet connection.';
      } else if (message.includes('500')) {
        userFriendlyMessage = 'Server error occurred. Please try again later.';
      } else if (message.includes('404')) {
        userFriendlyMessage = 'The requested resource was not found.';
      } else if (message.includes('403')) {
        userFriendlyMessage = 'You do not have permission to perform this action.';
      } else if (message.includes('401')) {
        userFriendlyMessage = 'Please log in to continue.';
      }
    }

    setErrorMessage(userFriendlyMessage);
    // Auto-hide after 8 seconds with cleanup
    timeoutRef.current = window.setTimeout(() => {
      setErrorMessage(null);
      timeoutRef.current = null;
    }, 8000);
  };

  const clearError = () => {
    // Clear timeout when manually clearing error
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setErrorMessage(null);
  };

  return {
    errorMessage,
    showError,
    clearError
  };
};
