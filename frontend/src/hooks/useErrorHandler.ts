import { useState } from 'react';

export const useErrorHandler = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (message: string) => {
    // Convert technical database errors to user-friendly messages
    let userFriendlyMessage = message;
    
    if (message.includes('Duplicate entry') && message.includes('number')) {
      userFriendlyMessage = 'This number already exists. Please use a different number.';
    } else if (message.includes('Duplicate entry') && message.includes('name')) {
      userFriendlyMessage = 'This name already exists. Please use a different name.';
    } else if (message.includes('Duplicate entry')) {
      userFriendlyMessage = 'This record already exists. Please check your input.';
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
    
    setErrorMessage(userFriendlyMessage);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      setErrorMessage(null);
    }, 8000);
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  return {
    errorMessage,
    showError,
    clearError
  };
};
