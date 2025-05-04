import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlanList from '../components/home/PlanList';
import CreatePlanDialog from '../components/home/CreatePlanDialog';
import { usePlans } from '../hooks/usePlans';
import Loader from '../components/common/Loader';

const HomePage = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { plans, loading, addPlan } = usePlans();
  const navigate = useNavigate();

  const handleCreate = async (title, planDescription) => {
    try {
      const newPlanId = await addPlan(title, planDescription);
      setDialogOpen(false);
      // Navigate to the newly created plan
      navigate(`/plan/${newPlanId}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      // Handle error (could show an error message to the user)
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero section */}
      <div className='bg-gradient-to-r from-blue-600 to-blue-800 text-white'>
        <div className='max-w-5xl mx-auto px-4 py-12 sm:py-16'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='mb-6 md:mb-0'>
              <h1 className='text-4xl md:text-5xl font-bold mb-2'>
                Study Plans
              </h1>
              <p className='text-blue-100 text-lg max-w-lg'>
                Create, manage, and track your personalized learning journeys
                all in one place.
              </p>
            </div>
            <button
              onClick={() => setDialogOpen(true)}
              className='bg-white text-blue-700 hover:bg-blue-50 font-medium py-3 px-6 rounded-md shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center'
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
              Create New Plan
            </button>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className='max-w-5xl mx-auto px-4 py-8'>
        {loading ? (
          <Loader />
        ) : (
          <div className='bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-100'>
            {plans.length === 0 ? (
              <div className='text-center py-10'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-16 w-16 mx-auto text-gray-300 mb-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                  />
                </svg>
                <h2 className='text-2xl font-semibold text-gray-700 mb-2'>
                  No study plans yet
                </h2>
                <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                  Create your first study plan to get started on your learning
                  journey
                </p>
                <button
                  onClick={() => setDialogOpen(true)}
                  className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow transition-colors duration-200'
                >
                  Create Your First Plan
                </button>
              </div>
            ) : (
              <PlanList plans={plans} />
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
