/**
 * Professional Input Component
 * Enhanced accessibility and consistent styling
 */
import React from 'react';
import { Input as AntInput, InputProps } from 'antd';

interface ProfessionalInputProps extends InputProps {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
}

const Input: React.FC<ProfessionalInputProps> = ({
  label,
  helpText,
  error,
  required = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = helpText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const inputClass = `professional-input ${error ? 'border-red-500' : ''} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <AntInput
        {...props}
        id={inputId}
        className={inputClass}
        aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
      />
      
      {helpText && (
        <p id={helpId} className="text-sm text-neutral-600">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
