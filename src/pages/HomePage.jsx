import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectList from '../components/home/ProjectList'; // Updated import name
import CreatePlanDialog from '../components/home/CreatePlanDialog';
import { usePlans } from '../hooks/usePlan';
import Loader from '../components/common/Loader';
import { createPlan } from '../services/plan.service';

const HomePage = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { plans, loading } = usePlans();
  const navigate = useNavigate();

  const handleCreate = async (title, projectDescription) => {
    try {
      const newProject = await createPlan({
        title,
        description: projectDescription,
      });
      setDialogOpen(false);
      navigate(`/project/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero section */}
      <div className='bg-gradient-to-r from-blue-600 to-blue-800 text-white'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20'>
          <div className='flex flex-col lg:flex-row justify-between items-center'>
            <div className='mb-8 lg:mb-0 text-center lg:text-left'>
              <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-3'>
                Religaire AI
              </h1>
              <p className='text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0'>
                Religaire Bio's AI powered IND preparation platform
              </p>
            </div>
            <button
              onClick={() => setDialogOpen(true)}
              className='bg-white text-blue-700 hover:bg-blue-50 font-medium py-3 px-6 sm:py-4 sm:px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center text-base sm:text-lg'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-2'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='hidden sm:inline'>Create New Project</span>
              <span className='sm:hidden'>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        {loading ? (
          <div className='flex justify-center items-center min-h-[400px]'>
            <Loader />
          </div>
        ) : (
          <div className='bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 border border-gray-100'>
            {plans.length === 0 ? (
              <div className='text-center py-12 sm:py-16'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-16 w-16 sm:h-20 sm:w-20 mx-auto text-gray-300 mb-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                <h2 className='text-2xl sm:text-3xl font-semibold text-gray-700 mb-3'>
                  No IND Projects Yet
                </h2>
                <p className='text-gray-500 mb-8 max-w-md mx-auto text-base sm:text-lg'>
                  Create your first IND project to begin the regulatory
                  submission process
                </p>
                <button
                  onClick={() => setDialogOpen(true)}
                  className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 sm:py-4 sm:px-8 rounded-lg shadow transition-colors duration-200 text-base sm:text-lg'
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <ProjectList projects={plans} />
            )}
          </div>
        )}
      </div>

      <CreatePlanDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default HomePage;
