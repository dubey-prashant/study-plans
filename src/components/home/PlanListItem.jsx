import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

const PlanListItem = ({ plan }) => {
  // Function to strip HTML tags and get plain text
  const getPlainTextFromHTML = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(html);
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Get plain text description for the preview
  const plainDescription = getPlainTextFromHTML(plan.description);

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200'>
      <h3 className='text-xl font-semibold text-gray-800 mb-2'>{plan.title}</h3>
      <p className='text-gray-600 mb-4 line-clamp-2'>{plainDescription}</p>
      <div className='flex justify-between items-center'>
        <span className='text-sm text-gray-500'>
          Created: {new Date(plan.createdAt).toLocaleDateString()}
        </span>
        <div className='space-x-2'>
          <Link
            to={`/plan/${plan.id}`}
            className='inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors duration-200'
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlanListItem;
