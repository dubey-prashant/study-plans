import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import usePlans from '../hooks/usePlans';
import PlanSummary from '../components/plan/PlanSummary';
import Loader from '../components/common/Loader';
import CommentSection from '../components/plan/CommentSection';
import { updatePlan } from '../services/planService';
import { generateResponse } from '../services/aiService';

const PlanDetailPage = () => {
  const { id } = useParams();
  const { plans, isLoading } = usePlans();
  const [localPlan, setLocalPlan] = useState(null);
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);

  // Find the plan from the plans array
  const planFromContext = plans.find((p) => p.id == id);

  // Initialize or update local plan state when plans change
  useEffect(() => {
    if (planFromContext) {
      setLocalPlan(planFromContext);
    }
  }, [planFromContext]);

  const handleApplySuggestion = async (suggestion) => {
    if (!localPlan) return;

    setIsApplyingSuggestion(true);

    const prompt = `Please update this plan based on the suggestion provided.
    
    Suggestion: ${suggestion}

    Plan: ${localPlan.description}


    PS: generate a plan in html and dont write any explanation or any other text.  
    `;

    try {
      const newDescription = await generateResponse(prompt);

      // Update the plan with the suggestion
      const updatedPlan = {
        ...localPlan,
        description: newDescription
          .replace(/^```html\s*/g, '')
          .replace(/```$/g, ''),
      };

      await updatePlan(id, updatedPlan);

      // Update local state immediately
      setLocalPlan(updatedPlan);
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      // Handle error (show notification, etc.)
    } finally {
      setIsApplyingSuggestion(false);
    }
  };

  const handleUpdatePlan = async (updatedPlan) => {
    try {
      await updatePlan(id, updatedPlan);
      setLocalPlan(updatedPlan);
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  if (isLoading && !localPlan) {
    return (
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <Loader />
      </div>
    );
  }

  if (!localPlan) {
    return (
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='bg-red-50 text-red-600 p-4 rounded-md'>
          Plan not found. It may have been deleted or you may have followed an
          invalid link.
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='mb-6'>
        {/* <h1 className='text-3xl font-bold text-gray-800'>{localPlan.title}</h1> */}
      </div>

      {isApplyingSuggestion ? (
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div className='flex flex-col items-center justify-center py-8'>
            <Loader />
            <p className='mt-4 text-gray-600 text-center'>
              Applying suggestion to your plan...
            </p>
          </div>
        </div>
      ) : (
        <PlanSummary plan={localPlan} onUpdatePlan={handleUpdatePlan} />
      )}

      {/* Comments Section */}
      <div className='mt-8'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
          Suggestions & Comments
        </h2>
        <CommentSection
          planId={id}
          onApplySuggestion={handleApplySuggestion}
          isApplyingSuggestion={isApplyingSuggestion}
        />
      </div>
    </div>
  );
};

export default PlanDetailPage;
