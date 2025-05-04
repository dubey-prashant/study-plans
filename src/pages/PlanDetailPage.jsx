import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePlans from '../hooks/usePlans';
import PlanDetails from '../components/plan/PlanDetails';
import Loader from '../components/common/Loader';
import CommentSection from '../components/plan/CommentSection';
import { updatePlan, deletePlan } from '../services/planService';
import { generateResponse } from '../services/aiService';
import { getComments } from '../services/commentService';

const PlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plans, isLoading, validatePlan } = usePlans();
  const [localPlan, setLocalPlan] = useState(null);
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false);

  // Find the plan from the plans array
  const planFromContext = plans.find((p) => p.id == id);

  // Initialize or update local plan state when plans change
  useEffect(() => {
    if (planFromContext) {
      setLocalPlan(planFromContext);
    }
  }, [planFromContext]);

  // Check for existing validation and run validation if needed
  useEffect(() => {
    const checkAndRunValidation = async () => {
      if (!planFromContext) return;

      // Get existing comments for this plan
      const existingComments = getComments(id);

      // Check if there's already an AI suggestion among the comments
      const hasAiSuggestion = existingComments.some(
        (comment) =>
          comment.author === 'AI Assistant' && comment.type === 'suggestion'
      );

      // If there's no AI suggestion yet, run validation after a delay
      if (!hasAiSuggestion) {
        setIsValidating(true);

        // Wait 2 seconds before making the validation call
        setTimeout(async () => {
          try {
            await validatePlan(id);
            setValidationCompleted((prev) => !prev); // Toggle to trigger rerender
          } catch (error) {
            console.error('Error validating plan on page load:', error);
          } finally {
            setIsValidating(false);
          }
        }, 2000); // 2 second delay
      }
    };

    checkAndRunValidation();
  }, [id, planFromContext, validatePlan]);

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

  const handleDeletePlan = async () => {
    try {
      setIsDeleting(true);
      await deletePlan(id);
      // Navigate back to home page after deleting
      navigate('/');
    } catch (error) {
      console.error('Failed to delete plan:', error);
      setIsDeleting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if ((isLoading || isValidating) && !localPlan) {
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
      {/* Header with back button and actions */}
      <div className='mb-6 flex justify-between items-center'>
        <div className='flex items-center'>
          <button
            onClick={handleGoBack}
            className='mr-4 text-gray-500 hover:text-gray-700 flex items-center transition-colors duration-200'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-1'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
          <h1 className='text-2xl font-bold text-gray-800'>
            {localPlan.title}
          </h1>
        </div>

        <div>
          {showDeleteConfirm ? (
            <div className='flex items-center bg-red-50 p-2 rounded-md'>
              <span className='text-sm text-red-600 mr-2'>Are you sure?</span>
              <button
                onClick={handleDeletePlan}
                className='bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded mr-2'
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs px-2 py-1 rounded'
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className='text-red-300 hover:text-red-700 flex items-center transition-colors duration-200'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-1'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isValidating && (
        <div className='mb-6 bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md flex items-center'>
          <svg
            className='animate-spin h-5 w-5 mr-3 text-blue-600'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          AI is analyzing your study plan to provide suggestions...
        </div>
      )}

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
        <PlanDetails plan={localPlan} onUpdatePlan={handleUpdatePlan} />
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
          validationCompleted={validationCompleted}
        />
      </div>
    </div>
  );
};

export default PlanDetailPage;
