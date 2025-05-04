import { useState, useEffect } from 'react';
import { getPlans, createPlan } from '../services/planService';
import { generateResponse } from '../services/aiService';
import { addComment } from '../services/commentService';

export const usePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    try {
      const fetchedPlans = await getPlans();
      setPlans(fetchedPlans);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Separate function to validate a plan and add suggestions
  const validatePlan = async (planId) => {
    try {
      // Find the plan to validate
      const plan = plans.find((p) => p.id === planId);

      if (!plan) {
        console.error('Plan not found for validation');
        return null;
      }

      const validationPrompt = `
        Review and validate the following study plan. Identify 2-3 specific improvements or suggestions
        that would make this plan more comprehensive, scientifically sound, or better aligned with regulatory
        requirements. Format your response as concrete, actionable suggestions. Focus on methodology,
        missing sections, or areas that need more detail.
        
        Plan to review: ${plan.description}
        
        Return your response as 2-3 specific, detailed suggestions for improvement. Each suggestion should
        be practical, specific, and actionable.
      `;

      // Get AI validation and suggestions
      const validationResponse = await generateResponse(validationPrompt);

      // Clean up the response
      const suggestions = validationResponse
        .replace(/^```(?:html|markdown)?\s*/g, '')
        .replace(/```$/g, '')
        .trim();

      console.log('Validation suggestions:', suggestions);

      // Add suggestions as a comment to the plan
      await addComment(planId, {
        text: suggestions,
        author: 'AI Assistant',
        type: 'suggestion',
        isSuggestion: true,
        createdAt: new Date().toISOString(),
      });

      return suggestions;
    } catch (err) {
      console.error('Error validating plan:', err);
      return null;
    }
  };

  const addPlan = async (title, description) => {
    try {
      // Set loading state while generating plan
      setLoading(true);

      const prompt = `${description}`;

      const plan = await generateResponse(prompt);
      const newDesc = plan.replace(/^```html\s*/g, '').replace(/```$/g, '');
      console.log('Generated plan:', plan);

      const newPlan = await createPlan({ title, description: newDesc });

      setPlans((prevPlans) => [...prevPlans, newPlan]);

      return newPlan.id;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    plans,
    loading,
    error,
    addPlan,
    validatePlan, // Expose the validation function
    fetchPlans, // Expose fetchPlans to allow refreshing
  };
};

export default usePlans;
