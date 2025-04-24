import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import usePlans from '../../hooks/usePlans';
import Button from '../common/Button';

const PlanEditor = () => {
  const { planId } = useParams();
  const { getPlanById, updatePlan } = usePlans();
  const [planDetails, setPlanDetails] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    const fetchPlanDetails = async () => {
      const plan = await getPlanById(planId);
      setPlanDetails(plan);
    };
    fetchPlanDetails();
  }, [planId, getPlanById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updatePlan(planId, planDetails);
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>Edit Study Plan</h2>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Title
            <input
              type='text'
              name='title'
              value={planDetails.title}
              onChange={handleChange}
              required
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
          </label>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Description
            <textarea
              name='description'
              value={planDetails.description}
              onChange={handleChange}
              required
              rows='6'
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
          </label>
        </div>
        <div className='flex justify-end'>
          <Button
            type='submit'
            className='bg-blue-600 hover:bg-blue-700 text-white'
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlanEditor;
