import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-8 w-8', md: 'h-12 w-12', lg: 'h-16 w-16' };
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} animate-spin`}>
        <div className="h-full w-full border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
