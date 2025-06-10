/**
 * Validation utility functions for form inputs
 */

// Phone number validation (supports various formats)
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (7-15 digits)
  return cleaned.length >= 7 && cleaned.length <= 15;
};

// Email validation (more comprehensive than HTML5)
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

// Tax rate validation (0-100%)
export const validateTaxRate = (rate: number): boolean => {
  return rate >= 0 && rate <= 100;
};

// Required field validation
export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Name validation (no special characters except spaces, hyphens, apostrophes)
export const validateName = (name: string): boolean => {
  if (!name) return false;
  
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  return nameRegex.test(name.trim()) && name.trim().length >= 2;
};

// Currency validation
export const validateCurrency = (currency: string): boolean => {
  if (!currency) return false;
  
  // Should be 3 letter currency code
  const currencyRegex = /^[A-Z]{3}$/;
  return currencyRegex.test(currency.toUpperCase());
};

// Percentage validation (0-100 with up to 2 decimal places)
export const validatePercentage = (percentage: number): boolean => {
  return percentage >= 0 && percentage <= 100 && Number.isFinite(percentage);
};

// Account number validation (alphanumeric, 5-20 characters)
export const validateAccountNumber = (accountNumber: string): boolean => {
  if (!accountNumber) return true; // Optional field
  
  const accountRegex = /^[a-zA-Z0-9]{5,20}$/;
  return accountRegex.test(accountNumber);
};

// Validation rule generators for Ant Design forms
export const createValidationRules = {
  required: (message: string = 'This field is required') => ({
    required: true,
    message,
    validator: (_: any, value: any) => {
      if (validateRequired(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  email: (message: string = 'Please enter a valid email address') => ({
    validator: (_: any, value: string) => {
      if (!value || validateEmail(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  phone: (message: string = 'Please enter a valid phone number') => ({
    validator: (_: any, value: string) => {
      if (!value || validatePhoneNumber(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  taxRate: (message: string = 'Tax rate must be between 0 and 100') => ({
    validator: (_: any, value: number) => {
      if (value === undefined || value === null || validateTaxRate(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  name: (message: string = 'Please enter a valid name') => ({
    validator: (_: any, value: string) => {
      if (!value || validateName(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  percentage: (message: string = 'Percentage must be between 0 and 100') => ({
    validator: (_: any, value: number) => {
      if (value === undefined || value === null || validatePercentage(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  accountNumber: (message: string = 'Account number must be 5-20 alphanumeric characters') => ({
    validator: (_: any, value: string) => {
      if (!value || validateAccountNumber(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  })
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if can't format
};

// Format currency for display
export const formatCurrency = (amount: number, currency: string = 'CAD'): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Format percentage for display
export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};
