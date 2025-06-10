/**
 * Field Help Component - Provides helpful examples and guidance for form fields
 */
import React from 'react';
import { Typography, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface FieldHelpProps {
  type: 'phone' | 'email' | 'name' | 'taxRate' | 'accountNumber' | 'currency' | 'address' | 'custom';
  customText?: string;
  customExample?: string;
  className?: string;
}

const FieldHelp: React.FC<FieldHelpProps> = ({
  type,
  customText,
  customExample,
  className = "mb-2"
}) => {
  const getHelpText = () => {
    switch (type) {
      case 'phone':
        return {
          text: 'Enter phone number with area code',
          example: 'Examples: (555) 123-4567, +1-555-123-4567, 555.123.4567'
        };
      
      case 'email':
        return {
          text: 'Enter a valid email address',
          example: 'Example: john.doe@company.com'
        };
      
      case 'name':
        return {
          text: 'Enter full name (letters, spaces, hyphens, and apostrophes only)',
          example: 'Examples: John Smith, Mary O\'Connor, Jean-Pierre Dubois'
        };
      
      case 'taxRate':
        return {
          text: 'Enter tax rate as a percentage (0-100)',
          example: 'Examples: 13.5 (for 13.5%), 8.25 (for 8.25%), 0 (for no tax)'
        };
      
      case 'accountNumber':
        return {
          text: 'Enter account number (5-20 characters, letters and numbers only)',
          example: 'Examples: ACC12345, ACCT001234567890, 1234567890'
        };
      
      case 'currency':
        return {
          text: 'Select the currency for this customer/supplier',
          example: 'Examples: CAD (Canadian Dollar), USD (US Dollar), EUR (Euro)'
        };
      
      case 'address':
        return {
          text: 'Enter complete address including street, city, province/state',
          example: 'Example: 123 Main Street, Toronto, ON M5V 3A8'
        };
      
      case 'custom':
        return {
          text: customText || '',
          example: customExample || ''
        };
      
      default:
        return { text: '', example: '' };
    }
  };

  const { text, example } = getHelpText();

  if (!text && !example) return null;

  return (
    <div className={className}>
      <Space direction="vertical" size={2} style={{ width: '100%' }}>
        {text && (
          <Text type="secondary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            {text}
          </Text>
        )}
        {example && (
          <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic', color: '#8c8c8c' }}>
            {example}
          </Text>
        )}
      </Space>
    </div>
  );
};

export default FieldHelp;
