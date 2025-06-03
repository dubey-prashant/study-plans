import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

const ProjectListItem = ({ project }) => {
  // Function to strip HTML tags and get plain text
  const getPlainTextFromHTML = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(html);
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Get plain text description for the preview
  const plainDescription = getPlainTextFromHTML(project.description);

  // Format date in a more readable way
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className='bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 transform hover:translate-y-[-2px]'>
      <div className='flex justify-between items-start mb-3'>
        <h3 className='text-xl font-semibold text-gray-800'>{project.title}</h3>
        {/* <span className='bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full'>
          IND Project
        </span> */}
      </div>

      <p className='text-gray-600 mb-4 line-clamp-2 text-sm'>
        {plainDescription}
      </p>

      <div className='flex justify-between items-center mt-4 pt-3 border-t border-gray-100'>
        <div className='flex items-center text-gray-500 text-sm'>
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
              d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
          {formatDate(project.createdAt)}
        </div>

        <Link
          to={`/project/${project.id}`}
          className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium'
        >
          <span>View Project</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 ml-1'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

const ProjectList = ({ projects, onEdit }) => {
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center mb-8'>
        <h2 className='text-2xl sm:text-3xl font-bold text-gray-800'>
          Your Projects
        </h2>
      </div>

      {projects.length === 0 ? (
        <div className='text-center py-12 sm:py-16 bg-gray-50 rounded-lg border border-gray-200'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
            />
          </svg>
          <p className='text-gray-500 text-lg font-medium'>
            No projects yet. Create your first IND project!
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
          {projects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
