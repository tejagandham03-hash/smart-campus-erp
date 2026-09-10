import React from 'react';

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-lg shadow p-6 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
