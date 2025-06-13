/**
 * Professional Button Component
 * Consistent styling and accessibility features
 */
import React from 'react';
import { Button as AntButton, type ButtonProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface ProfessionalButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  isLoading?: boolean;
  loadingText?: string;
}

const Button: React.FC<ProfessionalButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  loadingText = 'Loading...',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'professional-button professional-button-primary';
      case 'secondary':
        return 'professional-button professional-button-secondary';
      case 'success':
        return 'professional-button status-success';
      case 'warning':
        return 'professional-button status-warning';
      case 'error':
        return 'professional-button status-error';
      default:
        return 'professional-button professional-button-primary';
    }
  };

  const buttonClass = `${getVariantClass()} ${className}`;

  return (
    <AntButton
      {...props}
      className={buttonClass}
      disabled={disabled || isLoading}
      icon={isLoading ? <LoadingOutlined /> : props.icon}
    >
      {isLoading ? loadingText : children}
    </AntButton>
  );
};

export default Button;
