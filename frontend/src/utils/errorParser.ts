/**
 * Utility to parse backend validation errors into user-friendly messages
 */

interface ValidationError {
  type: string;
  loc: (string | number)[];
  msg: string;
  input: any;
  ctx?: any;
}

interface BackendErrorResponse {
  detail: ValidationError[] | string;
}

/**
 * Parse backend validation errors into user-friendly messages
 */
export const parseValidationErrors = (error: any): string => {
  try {
    // If error has response data with detail
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;

      // If detail is a string, return it directly
      if (typeof detail === 'string') {
        return detail;
      }

      // If detail is an array of validation errors
      if (Array.isArray(detail)) {
        const messages = detail.map((validationError: ValidationError) => {
          const field = validationError.loc[validationError.loc.length - 1];
          const message = validationError.msg;

          // Convert technical validation messages to user-friendly ones
          return convertValidationMessage(field as string, message);
        });

        // Return the first error message (or combine multiple if needed)
        return messages[0] || 'Please check your input and try again.';
      }
    }

    // Check if error is a string (from old API interceptor behavior)
    if (typeof error === 'string') {
      return error;
    }

    // Fallback to original error message
    return error.message || 'An unexpected error occurred';
  } catch (parseError) {
    console.error('Error parsing validation errors:', parseError);
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Convert technical validation messages to user-friendly ones
 */
const convertValidationMessage = (field: string, message: string): string => {
  // Phone number validation
  if (field === 'phone' || field === 'contact_phone') {
    if (message.includes('Phone number must be 7-15 digits')) {
      return 'Phone number must contain only digits and be between 7-15 characters long. Please enter numbers only (e.g., 5551234567).';
    }
    if (message.includes('phone')) {
      return 'Please enter a valid phone number with digits only (e.g., 5551234567).';
    }
  }
  
  // Email validation
  if (field === 'email' || field === 'contact_email') {
    if (message.includes('email')) {
      return 'Please enter a valid email address.';
    }
  }
  
  // Name validation
  if (field === 'name' || field === 'contact_name') {
    if (message.includes('String should have at least')) {
      return 'Name must be at least 2 characters long.';
    }
    if (message.includes('String should have at most')) {
      return 'Name is too long. Please use a shorter name.';
    }
  }
  
  // Tax rate validation
  if (field === 'tax_rate') {
    if (message.includes('greater than or equal to 0')) {
      return 'Tax rate must be 0 or greater.';
    }
    if (message.includes('less than or equal to 100')) {
      return 'Tax rate cannot exceed 100%.';
    }
  }
  
  // Account number validation
  if (field === 'account_number') {
    if (message.includes('alphanumeric')) {
      return 'Account number can only contain letters and numbers.';
    }
  }
  
  // Generic field name formatting
  const fieldName = formatFieldName(field);
  
  // Generic validation message patterns
  if (message.includes('Field required') || message.includes('required')) {
    return `${fieldName} is required.`;
  }
  
  if (message.includes('String should have at least')) {
    return `${fieldName} is too short.`;
  }
  
  if (message.includes('String should have at most')) {
    return `${fieldName} is too long.`;
  }
  
  if (message.includes('Value error')) {
    // Extract the actual error message after "Value error, "
    const actualMessage = message.replace('Value error, ', '');
    return actualMessage;
  }
  
  // Return the original message if no specific conversion found
  return message;
};

/**
 * Format field names to be more user-friendly
 */
const formatFieldName = (field: string): string => {
  const fieldMappings: Record<string, string> = {
    'name': 'Company name',
    'contact_name': 'Contact name',
    'contact_email': 'Contact email',
    'contact_phone': 'Contact phone',
    'tax_rate': 'Tax rate',
    'account_number': 'Account number',
    'bank_name': 'Bank name',
    'file_format': 'File format',
    'sales_rep_id': 'Sales representative',
    'currency_id': 'Currency'
  };
  
  return fieldMappings[field] || field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};
