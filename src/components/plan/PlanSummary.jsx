import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import MDEditor from '@uiw/react-md-editor';
import Button from '../common/Button';

const PlanSummary = ({ plan, onUpdatePlan }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(plan.description);

  // Update local state when plan changes
  React.useEffect(() => {
    setValue(plan.description);
  }, [plan.description]);

  const handleSave = async () => {
    const updatedPlan = {
      ...plan,
      description: value,
    };

    await onUpdatePlan(updatedPlan);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(plan.description);
    setIsEditing(false);
  };

  const handleDownload = () => {
    // Create a blob with the plan content
    const planText = `# ${plan.title}\n\n${plan.description}`;
    const blob = new Blob([planText], { type: 'text/markdown' });

    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.title.replace(/\s+/g, '-').toLowerCase()}.md`;

    // Trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold text-gray-800'>{plan.title}</h2>
        <div className='flex space-x-2'>
          {!isEditing ? (
            <>
              <Button
                onClick={handleDownload}
                className='text-green-600 hover:text-green-800 px-3 py-1 rounded border border-green-600 hover:border-green-800 transition-colors duration-200'
              >
                <span className='flex items-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                    />
                  </svg>
                  Download
                </span>
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className='text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:border-blue-800 transition-colors duration-200'
              >
                <span className='flex items-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                    />
                  </svg>
                  Edit Plan
                </span>
              </Button>
            </>
          ) : (
            <div className='flex space-x-2'>
              <Button
                onClick={handleCancel}
                className='text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-400 hover:border-gray-600 transition-colors duration-200'
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors duration-200'
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className='border border-blue-200 rounded-md overflow-hidden'>
          <MDEditor
            value={value}
            onChange={setValue}
            preview='edit'
            height={400}
          />
        </div>
      ) : (
        <div className='prose prose-sm max-w-none mb-6'>
          <ReactMarkdown>{plan.description}</ReactMarkdown>
        </div>
      )}

      <div className='border-t border-gray-200 pt-4 mt-4'>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <p className='text-sm text-gray-500 mb-1'>
            <span className='font-medium'>Status:</span>
            <span className='ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
              {plan.status || 'In Progress'}
            </span>
          </p>
          <p className='text-sm text-gray-500'>
            <span className='font-medium'>Created:</span>
            <span className='ml-2'>
              {new Date(plan.createdAt).toLocaleDateString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanSummary;
