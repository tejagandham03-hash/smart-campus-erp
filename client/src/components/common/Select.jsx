import React from 'react';

const Select = ({ label, options, error, className = '', ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
    )}
    <select
      className={`w-full px-4 py-2.5 rounded-lg border ${
        error ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export default Select;
