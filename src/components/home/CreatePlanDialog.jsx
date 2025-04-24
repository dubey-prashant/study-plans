import React, { useState } from 'react';
import Dialog from '../common/Dialog';
import Button from '../common/Button';

const CreatePlanDialog = ({ isOpen, onClose, onCreate }) => {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    if (title && description) {
      onCreate(title, description);
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title='Create New Study Plan'>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <label
            htmlFor='plan-title'
            className='block text-sm font-medium text-gray-700'
          >
            Plan Title
          </label>
          <input
            id='plan-title'
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Enter plan title'
            className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
          />
        </div>

        <div className='space-y-2'>
          <label
            htmlFor='plan-description'
            className='block text-sm font-medium text-gray-700'
          >
            Description
          </label>
          <textarea
            id='plan-description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Describe what you want to study and learn'
            rows='5'
            className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none'
          />
        </div>

        <div className='flex justify-end space-x-3 pt-2'>
          <Button
            onClick={onClose}
            className='bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-5 py-2.5 rounded-md transition-colors duration-200'
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-md shadow-sm transition-colors duration-200'
            disabled={!title || !description}
          >
            Create Plan
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default CreatePlanDialog;
