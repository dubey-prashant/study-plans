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
      role='dialog'
      aria-modal='true'
      aria-labelledby='dialog-title'
    >
      <div
        className='bg-white rounded-lg shadow-2xl w-full max-w-md sm:max-w-lg animate-fadeIn max-h-[90vh] flex flex-col'
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center relative flex-shrink-0'>
          <h2
            id='dialog-title'
            className='text-lg sm:text-xl font-semibold text-gray-800 pr-8'
          >
            {title}
          </h2>
          <button
            className='absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 transition-colors duration-200'
            onClick={onClose}
            aria-label='Close dialog'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
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
        <div className='p-4 sm:p-6 overflow-y-auto flex-1'>{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
