import React, { useEffect, useRef } from 'react';

const Dialog = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef(null);

  // Handle ESC key press to close dialog
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    // Focus trap and scroll lock when dialog opens
    if (isOpen) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      // Focus on dialog when it opens
      dialogRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      // Restore scrolling when dialog closes
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300'
      onClick={(e) => {
        // Close when clicking outside the dialog
        if (e.target === e.currentTarget) onClose();
      }}
      role='dialog'
      aria-modal='true'
      aria-labelledby='dialog-title'
    >
      <div
        className='bg-white rounded-lg shadow-2xl w-full max-w-md animate-fadeIn'
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='p-5 border-b border-gray-200 flex justify-between items-center relative'>
          <h2 id='dialog-title' className='text-xl font-semibold text-gray-800'>
            {title}
          </h2>
          <button
            className='absolute top-5 right-5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 transition-colors duration-200'
            onClick={onClose}
            aria-label='Close dialog'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
        <div className='p-6 max-h-[70vh] overflow-y-auto'>{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
