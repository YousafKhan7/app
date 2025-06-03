import React from 'react';

interface ErrorToastProps {
  message: string | null;
  onClose: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        backgroundColor: '#ff4d4f',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid #ff7875'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>❌ {message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            marginLeft: '10px',
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;
