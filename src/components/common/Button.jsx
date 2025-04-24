import React from 'react';

const Button = ({ onClick, children, className, type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-md transition-colors duration-200 font-medium ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
