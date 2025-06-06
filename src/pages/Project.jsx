import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import usePlan from '../hooks/usePlan';
import Loader from '../components/common/Loader';
import GLPModule from './plan/GLP';
import CMCModule from './plan/CMC';
import INDApplication from './plan/IND';

// Main Plan Component
const Project = () => {
  const { id } = useParams();
  const { plan, isLoading, setPlan } = usePlan(id);
  const [activeModule, setActiveModule] = useState('glp');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when changing modules
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeModule]);

  if (isLoading && !plan) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <Loader />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='bg-red-50 text-red-600 p-4 rounded-md'>
          Plan not found. It may have been deleted or you may have followed an
          invalid link.
        </div>
      </div>
    );
  }

  // Render the active module content using the appropriate component
  const renderActiveModuleContent = () => {
    switch (activeModule) {
      case 'glp':
        return <GLPModule plan={plan} setPlan={setPlan} />;
      case 'cmc':
        return <CMCModule plan={plan} setPlan={setPlan} />;
      case 'ind':
        return <INDApplication plan={plan} setPlan={setPlan} />;
      default:
        return <GLPModule plan={plan} />;
    }
  };

  // Helper function to determine if a navigation item is active
  const isActive = (module) => activeModule === module;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center min-w-0 flex-1'>
              <Link
                to='/'
                className='flex-shrink-0 flex items-center text-blue-600 hover:text-blue-700 transition-colors mr-3 sm:mr-4'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                <span className='font-semibold text-lg hidden sm:block'>
                  Religaire AI
                </span>
              </Link>
              <div className='min-w-0 flex-1'>
                <h1
                  className='text-sm sm:text-lg lg:text-xl font-semibold text-gray-900 truncate'
                  title={plan.title}
                >
                  {plan.title}
                </h1>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ml-3'
            >
              <span className='sr-only'>Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
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
              ) : (
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {plan && (
        <div className='max-w-7xl mx-auto px-4 pt-4 sm:pt-8'>
          <div className='flex flex-col md:flex-row gap-4 md:gap-6'>
            {/* Sidebar - visible on mobile only when menu is open */}
            <div
              className={`${
                isMobileMenuOpen ? 'block' : 'hidden'
              } md:block md:w-64 flex-shrink-0 transition-all duration-300 ease-in-out`}
            >
              <div className='bg-white rounded-lg shadow-md border border-gray-200 p-4'>
                <h2 className='text-lg font-semibold mb-4 text-gray-800 border-b pb-2 hidden md:block'>
                  Modules
                </h2>
                <nav>
                  <ul className='space-y-2'>
                    <li>
                      <button
                        onClick={() => setActiveModule('glp')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          isActive('glp')
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-center'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5 mr-2'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' />
                            <path
                              fillRule='evenodd'
                              d='M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z'
                              clipRule='evenodd'
                            />
                          </svg>
                          Pre-Clinical GLP
                        </div>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveModule('cmc')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          isActive('cmc')
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-center'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5 mr-2'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z'
                              clipRule='evenodd'
                            />
                          </svg>
                          CMC Module
                        </div>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveModule('ind')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          isActive('ind')
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-center'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5 mr-2'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z'
                              clipRule='evenodd'
                            />
                          </svg>
                          IND Application
                        </div>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main content area */}
            <div className='flex-1 max-h-[calc(100vh-80px)] md:max-h-[calc(100vh-120px)] overflow-y-auto rounded-lg'>
              {renderActiveModuleContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
