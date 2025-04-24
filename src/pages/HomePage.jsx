import React, { useState } from 'react';
import PlanList from '../components/home/PlanList';
import CreatePlanDialog from '../components/home/CreatePlanDialog';
import { usePlans } from '../hooks/usePlans';

const HomePage = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { plans, addPlan } = usePlans();

  const handleCreatePlan = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleCreate = async (title, planDescription) => {
    await addPlan(title, planDescription);
    closeDialog();
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>Study Plans</h1>
        <button
          onClick={handleCreatePlan}
          className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow transition-colors duration-200'
        >
          Create New Plan
        </button>
      </div>
      <div className='bg-white rounded-lg shadow-md p-6'>
        <PlanList plans={plans} />
      </div>
      <CreatePlanDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default HomePage;
