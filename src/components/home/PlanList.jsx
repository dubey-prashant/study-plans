import React from 'react';
import PlanListItem from './PlanListItem';

const PlanList = ({ plans, onEdit }) => {
  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-bold text-gray-800 mb-4'>
        Your Study Plans
      </h2>
      {plans.length === 0 ? (
        <p className='text-gray-500 italic'>
          No plans yet. Create your first study plan!
        </p>
      ) : (
        <ul className='space-y-4'>
          {plans.map((plan) => (
            <li key={plan.id}>
              <PlanListItem plan={plan} onEdit={onEdit} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlanList;
