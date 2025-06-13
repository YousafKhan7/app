/**
 * Professional Card Component
 * Consistent styling with hover effects and accessibility
 */
import React from 'react';
import { Card as AntCard, CardProps } from 'antd';

interface ProfessionalCardProps extends CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
  loading?: boolean;
}

const Card: React.FC<ProfessionalCardProps> = ({
  variant = 'default',
  interactive = false,
  loading = false,
  children,
  className = '',
  ...props
}) => {
  const getVariantClass = () => {
    const baseClass = 'professional-card animate-fade-in';
    
    switch (variant) {
      case 'elevated':
        return `${baseClass} shadow-lg`;
      case 'outlined':
        return `${baseClass} border-2`;
      default:
        return baseClass;
    }
  };

  const interactiveClass = interactive ? 'cursor-pointer hover:shadow-lg transition-shadow' : '';
  const cardClass = `${getVariantClass()} ${interactiveClass} ${className}`;

  return (
    <AntCard
      {...props}
      className={cardClass}
      loading={loading}
      role={interactive ? 'button' : 'region'}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </AntCard>
  );
};

export default Card;
