import { useState, useEffect } from 'react';
import { createCMC, updateCMC, validateCMC } from '../../services/plan.service';
import { generateCMCResponse } from '../../services/ai.service';
import CreatePlanDialog from '../../components/home/CreatePlanDialog';
import Loader from '../../components/common/Loader';
import Details from '../../components/module/Details';
import CommentSection from '../../components/module/CommentSection';

const CMCModule = ({ plan, setPlan }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false);

  useEffect(() => {
    const checkAndRunValidation = async () => {
      if (!plan.CMCModule) return;

      const { validatedByAI } = plan.CMCModule;
      console.log('validatedByAI', validatedByAI, plan.CMCModule);
      // If there's no AI suggestion yet, run validation after a delay
      if (!validatedByAI && !isValidating) {
        setIsValidating(true);

        // Wait 2 seconds before making the validation call
        setTimeout(async () => {
          try {
            const newPlan = await validateCMC(plan.id);
            setPlan(newPlan);
            setValidationCompleted((prev) => !prev);
          } catch (error) {
            console.error('Error validating CMC module on page load:', error);
          } finally {
            setIsValidating(false);
          }
        }, 2000);
      }
    };

    checkAndRunValidation();
  }, [plan.id, plan.CMCModule, isValidating, setPlan]);

  // Apply AI-generated suggestion
  const handleApplySuggestion = async (suggestion) => {
    if (!plan.CMCModule) return;

    setIsApplyingSuggestion(true);

    try {
      const prompt = `Please update this CMC Module based on the suggestion provided.

      Current Module Description: ${plan.CMCModule.description}

      Suggestion: ${suggestion}

      Provide an improved version of the module description that incorporates the suggestion. Keep the response focused only on the improved content without any explanatory text.`;

      const improvedDescription = await generateCMCResponse(prompt);

      // Update the CMC module with the improved description
      const updatedPlan = await updateCMC(plan.id, {
        ...plan.CMCModule,
        description: improvedDescription
          .replace(/^```html\s*/g, '')
          .replace(/```$/g, ''),
      });

      // Update local state
      setPlan(updatedPlan);
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    } finally {
      setIsApplyingSuggestion(false);
    }
  };

  // Save edits to the CMC module
  const handleSaveEdit = async (updatedCMC) => {
    try {
      const updatedPlan = await updateCMC(plan.id, updatedCMC);
      setPlan(updatedPlan);
    } catch (error) {
      console.error('Error updating CMC Module:', error);
    }
  };

  // Create a new CMC module
  const handleCreate = async (title, planDescription) => {
    try {
      const newPlan = await createCMC(plan.id, {
        title,
        description: planDescription,
      });
      console.log('New CMC Module created:', newPlan);
      setPlan(newPlan);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating CMC Module:', error);
    }
  };

  // Render when no CMC module exists yet
  if (!plan.CMCModule) {
    return (
      <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 w-full'>
        <h2 className='text-2xl font-bold mb-4 text-gray-800'>CMC Module</h2>

        <div>
          <p className='text-gray-600 mb-4'>
            CMC Module hasn't been created yet.
          </p>

          <button
            onClick={() => setDialogOpen(true)}
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-1'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Create CMC Module
          </button>
        </div>
        <CreatePlanDialog
          isOpen={isDialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreate={handleCreate}
        />
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 '>
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
          AI is analyzing your CMC module to provide suggestions...
        </div>
      )}

      {isApplyingSuggestion ? (
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div className='flex flex-col items-center justify-center py-8'>
            <Loader />
            <p className='mt-4 text-gray-600 text-center'>
              Applying suggestion to your CMC module...
            </p>
          </div>
        </div>
      ) : (
        <Details data={plan.CMCModule} onChange={handleSaveEdit} />
      )}

      {/* Comments Section */}
      <div className='mt-8'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
          Suggestions & Comments
        </h2>
        <CommentSection
          planId={plan.CMCModule.id}
          onApplySuggestion={handleApplySuggestion}
          isApplyingSuggestion={isApplyingSuggestion}
          validationCompleted={validationCompleted}
        />
      </div>
    </div>
  );
};

export default CMCModule;
