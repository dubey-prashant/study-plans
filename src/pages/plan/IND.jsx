import { useState, useEffect } from 'react';
import {
  createIND,
  updateIND,
  validateIND,
  deleteIND,
} from '../../services/plan.service';
import { generateINDResponse } from '../../services/ai.service';
import Loader from '../../components/common/Loader';
import Details from '../../components/module/Details';
import CommentSection from '../../components/module/CommentSection';
import Dialog from '../../components/common/Dialog';

const INDApplication = ({ plan, setPlan }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const hasGLPModule = Boolean(plan.GLPModule);
  const hasCMCModule = Boolean(plan.CMCModule);
  const canCreateIND = hasGLPModule && hasCMCModule;

  useEffect(() => {
    const checkAndRunValidation = async () => {
      if (!plan.INDApplication) return;

      const { validatedByAI } = plan.INDApplication;
      console.log('validatedByAI', validatedByAI, plan.INDApplication);
      // If there's no AI suggestion yet, run validation after a delay
      if (!validatedByAI && !isValidating) {
        setIsValidating(true);

        // Wait 2 seconds before making the validation call
        setTimeout(async () => {
          try {
            const newPlan = await validateIND(plan.id);
            setPlan(newPlan);
            setValidationCompleted((prev) => !prev);
          } catch (error) {
            console.error(
              'Error validating IND application on page load:',
              error
            );
          } finally {
            setIsValidating(false);
          }
        }, 2000);
      }
    };

    checkAndRunValidation();
  }, [plan.id, plan.INDApplication, isValidating, setPlan]);

  // Apply AI-generated suggestion
  const handleApplySuggestion = async (suggestion) => {
    if (!plan.INDApplication) return;

    setIsApplyingSuggestion(true);

    try {
      const prompt = `Please update this IND Application based on the suggestion provided.

      Current Application Description: ${plan.INDApplication.description}

      Suggestion: ${suggestion}

      Provide an improved version of the application description that incorporates the suggestion. Keep the response focused only on the improved content without any explanatory text.`;

      const improvedDescription = await generateINDResponse(prompt);

      // Update the IND application with the improved description
      const updatedPlan = await updateIND(plan.id, {
        ...plan.INDApplication,
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

  // Save edits to the IND application
  const handleSaveEdit = async (updatedIND) => {
    try {
      const updatedPlan = await updateIND(plan.id, updatedIND);
      setPlan(updatedPlan);
    } catch (error) {
      console.error('Error updating IND Application:', error);
    }
  };

  // Create a new IND application
  const handleCreate = async () => {
    try {
      setIsCreating(true);

      const newPlan = await createIND(plan.id, {
        title: 'IND Application',
        description: additionalInfo,
        glpModuleId: plan.GLPModule.id,
        cmcModuleId: plan.CMCModule.id,
      });

      console.log('New IND Application created:', newPlan);
      setPlan(newPlan);
      setDialogOpen(false);
      setAdditionalInfo('');
    } catch (error) {
      console.error('Error creating IND Application:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Delete IND application
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const updatedPlan = await deleteIND(plan.id);
      setPlan(updatedPlan);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting IND Application:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Render when no IND application exists yet
  if (!plan.INDApplication) {
    return (
      <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 w-full'>
        <h2 className='text-2xl font-bold mb-4 text-gray-800'>
          IND Application
        </h2>

        {!canCreateIND ? (
          <div className='bg-amber-50 border border-amber-200 rounded-md p-4 mb-5'>
            <h3 className='font-medium text-amber-800 mb-2 flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
              Prerequisites needed
            </h3>
            <p className='text-amber-700 mb-2'>
              To create an IND Application, you need the following modules:
            </p>
            <ul className='list-disc ml-5 text-amber-700'>
              <li
                className={`${hasGLPModule ? 'line-through opacity-70' : ''}`}
              >
                Pre-Clinical GLP Module {hasGLPModule ? '✓' : ''}
              </li>
              <li
                className={`${hasCMCModule ? 'line-through opacity-70' : ''}`}
              >
                CMC Module {hasCMCModule ? '✓' : ''}
              </li>
            </ul>
            <p className='text-amber-700 mt-2'>
              Please create these modules first before proceeding with the IND
              Application.
            </p>
          </div>
        ) : (
          <div>
            <p className='text-gray-600 mb-4'>
              Ready to create your IND Application based on your existing
              Pre-Clinical GLP and CMC Modules.
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
              Create IND Application
            </button>
          </div>
        )}

        {/* Enhanced Creation Dialog */}
        <Dialog
          isOpen={isDialogOpen && canCreateIND}
          onClose={() => setDialogOpen(false)}
          title='Create IND Application'
        >
          <div className='space-y-6'>
            <div className='bg-blue-50 border border-blue-100 p-4 rounded-md'>
              <h3 className='text-blue-800 font-medium mb-2'>
                Including the following modules:
              </h3>
              <div className='space-y-3'>
                <div className='flex items-start'>
                  <div className='bg-blue-100 rounded-full p-1 mr-3'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 text-blue-600'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-medium text-blue-800'>
                      Pre-Clinical GLP Module
                    </h4>
                    <p className='text-sm text-blue-700'>
                      {plan.GLPModule?.title || 'GLP Study Results'}
                    </p>
                  </div>
                </div>

                <div className='flex items-start'>
                  <div className='bg-blue-100 rounded-full p-1 mr-3'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 text-blue-600'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-medium text-blue-800'>CMC Module</h4>
                    <p className='text-sm text-blue-700'>
                      {plan.CMCModule?.title ||
                        'Chemistry, Manufacturing, and Controls'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <label
                htmlFor='additional-info'
                className='text-sm font-medium text-gray-700 flex items-center'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-1 text-gray-500'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                Additional Requirements (Optional)
              </label>
              <textarea
                id='additional-info'
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder='Enter any specific IND requirements or special considerations...'
                rows='4'
                className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200'
              />
              <p className='text-xs text-gray-500 mt-1 ml-1'>
                Provide any special considerations, target indications, or
                unique aspects of your IND application
              </p>
            </div>

            <div className='flex justify-end space-x-3 pt-2'>
              <button
                onClick={() => setDialogOpen(false)}
                className='bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-5 py-2.5 rounded-md transition-colors duration-200 flex items-center'
                disabled={isCreating}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-1.5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-md shadow-sm transition-colors duration-200 flex items-center'
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-1.5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Generate IND Application
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  // When an IND application exists and AI is applying a suggestion
  if (isApplyingSuggestion) {
    return (
      <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 w-full'>
        <h2 className='text-2xl font-bold mb-4 text-gray-800'>
          IND Application
        </h2>
        <div className='flex flex-col items-center justify-center py-8'>
          <Loader />
          <p className='mt-4 text-gray-600 text-center'>
            Applying suggestion to your IND Application...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto md:px-4'>
      {/* Header with delete button */}
      {/* <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>IND Application</h1>
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className='flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors'
          title='Delete IND Application'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 mr-1'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          Delete
        </button>
      </div> */}

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
          AI is analyzing your IND Application to provide suggestions...
        </div>
      )}

      {isApplyingSuggestion ? (
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div className='flex flex-col items-center justify-center py-8'>
            <Loader />
            <p className='mt-4 text-gray-600 text-center'>
              Applying suggestion to your IND Application...
            </p>
          </div>
        </div>
      ) : (
        <Details data={plan.INDApplication} onChange={handleSaveEdit} />
      )}

      {/* Comments Section */}
      <div className='mt-8'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
          Suggestions & Comments
        </h2>
        <CommentSection
          planId={plan.INDApplication.id}
          onApplySuggestion={handleApplySuggestion}
          isApplyingSuggestion={isApplyingSuggestion}
          validationCompleted={validationCompleted}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title='Delete IND Application'
      >
        <div className='space-y-4'>
          <div className='bg-red-50 p-4 rounded-md'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-red-600'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>Warning</h3>
                <p className='text-sm text-red-700 mt-1'>
                  Are you sure you want to delete this IND Application? This
                  action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <p className='text-gray-600 text-sm'>
            This will permanently remove the IND Application from this plan. The
            GLP and CMC modules will remain unaffected.
          </p>

          <div className='flex justify-end space-x-3 pt-2'>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className='bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200'
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-colors duration-200 flex items-center'
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                  Deleting...
                </>
              ) : (
                <>Delete IND Application</>
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default INDApplication;
