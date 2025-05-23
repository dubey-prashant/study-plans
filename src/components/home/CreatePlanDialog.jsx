import React, { useState } from 'react';
import Dialog from '../common/Dialog';
import Button from '../common/Button';

const CreatePlanDialog = ({ label, isOpen, onClose, onCreate }) => {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (title && description) {
      setIsSubmitting(true);
      try {
        await onCreate(title, description);
        setTitle('');
        setDescription('');
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={'Create New Study Plan'}>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <label
            htmlFor='plan-title'
            className='text-sm font-medium text-gray-700 flex items-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-1 text-gray-500'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z'
                clipRule='evenodd'
              />
            </svg>
            Title <span className='text-red-500 ml-1'>*</span>
          </label>
          <input
            id='plan-title'
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200'
          />
          <p className='text-xs text-gray-500 mt-1 ml-1'>
            Choose a clear, specific title for your study plan
          </p>
        </div>

        <div className='space-y-2'>
          <label
            htmlFor='plan-description'
            className='  text-sm font-medium text-gray-700 flex items-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-1 text-gray-500'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z'
                clipRule='evenodd'
              />
            </svg>
            Description <span className='text-red-500 ml-1'>*</span>
          </label>
          <textarea
            id='plan-description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder=' '
            rows='6'
            className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200'
          />
          <p className='text-xs text-gray-500 mt-1 ml-1'>
            The more detailed your description, the better your study plan will
            be
          </p>
        </div>

        <div className='flex justify-end space-x-3 pt-2'>
          <Button
            onClick={onClose}
            className='bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-5 py-2.5 rounded-md transition-colors duration-200 flex items-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-1.5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-md shadow-sm transition-colors duration-200 flex items-center'
            disabled={!title || !description || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-1.5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                    clipRule='evenodd'
                  />
                </svg>
                {label || 'Create Plan'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default CreatePlanDialog;
