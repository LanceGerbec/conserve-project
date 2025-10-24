// src/components/LoadingButton.js
// Purpose: Button with loading spinner

import React from 'react';

const LoadingButton = ({ loading, children, className = '', disabled, ...props }) => {
  return (
    <button
      className={`relative ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <div className="spinner"></div>
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </button>
  );
};

export default LoadingButton;