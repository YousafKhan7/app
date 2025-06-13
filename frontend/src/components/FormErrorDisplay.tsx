/**
 * Form Error Display Component - Shows user-friendly error messages at the top of forms
 */
import React from 'react';
import { Alert } from 'antd';

interface FormErrorDisplayProps {
  error: string | null;
  onClose?: () => void;
  className?: string;
}

const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ 
  error, 
  onClose, 
  className = "mb-4" 
}) => {
  if (!error) return null;

  // Convert technical errors to user-friendly messages
  const getUserFriendlyMessage = (errorMessage: string): string => {
    const message = errorMessage.toLowerCase();

    // Database constraint errors
    if (message.includes('duplicate') || message.includes('unique')) {
      if (message.includes('email')) {
        return 'This email address is already registered. Please use a different email address.';
      }
      if (message.includes('name')) {
        return 'This name is already taken. Please choose a different name.';
      }
      return 'This information already exists in the system. Please use different details.';
    }

    // Foreign key constraint errors
    if (message.includes('foreign key') || message.includes('reference')) {
      return 'Cannot delete this record because it is being used by other records in the system.';
    }

    // Validation errors
    if (message.includes('invalid email')) {
      return 'Please enter a valid email address (example: john@company.com).';
    }

    if (message.includes('phone') && message.includes('invalid')) {
      return 'Please enter a valid phone number (example: (555) 123-4567 or +1-555-123-4567).';
    }

    if (message.includes('tax rate')) {
      return 'Tax rate must be a number between 0 and 100 (example: 13.5 for 13.5%).';
    }

    if (message.includes('name') && message.includes('invalid')) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes (example: John O\'Connor-Smith).';
    }

    if (message.includes('account number')) {
      return 'Account number must be 5-20 characters long and contain only letters and numbers.';
    }

    // Network errors
    if (message.includes('network') || message.includes('connection')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    if (message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.';
    }

    // Server errors
    if (message.includes('500') || message.includes('internal server')) {
      return 'A server error occurred. Please try again in a few moments or contact support if the problem persists.';
    }

    if (message.includes('404') || message.includes('not found')) {
      return 'The requested information was not found. It may have been deleted or moved.';
    }

    if (message.includes('403') || message.includes('forbidden')) {
      return 'You do not have permission to perform this action. Please contact your administrator.';
    }

    if (message.includes('401') || message.includes('unauthorized')) {
      return 'Your session has expired. Please log in again to continue.';
    }

    // Required field errors
    if (message.includes('required') || message.includes('cannot be null')) {
      return 'Please fill in all required fields marked with an asterisk (*).';
    }

    // Data too long errors
    if (message.includes('too long') || message.includes('exceeds maximum')) {
      return 'One or more fields contain too much text. Please shorten your entries.';
    }

    // Generic validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return 'Please check your input and make sure all fields are filled out correctly.';
    }

    // If no specific match, return a cleaned version of the original message
    // Remove technical jargon and make it more user-friendly
    let cleanMessage = errorMessage
      .replace(/Error:/gi, '')
      .replace(/Exception:/gi, '')
      .replace(/SQLException:/gi, '')
      .replace(/ValidationError:/gi, '')
      .trim();

    // Capitalize first letter
    cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);

    // Add period if missing
    if (!cleanMessage.endsWith('.') && !cleanMessage.endsWith('!') && !cleanMessage.endsWith('?')) {
      cleanMessage += '.';
    }

    return cleanMessage;
  };

  const friendlyMessage = getUserFriendlyMessage(error);

  return (
    <Alert
      message="Please fix the following issue:"
      description={friendlyMessage}
      type="error"
      showIcon
      closable={!!onClose}
      onClose={onClose}
      className={className}
      style={{
        marginBottom: '16px',
        borderRadius: '6px'
      }}
    />
  );
};

export default FormErrorDisplay;
