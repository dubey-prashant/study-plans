import { useState, useEffect } from 'react';
import { getPlans, createPlan } from '../services/planService';
import { generateResponse } from '../services/aiService';

export const usePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchPlans();
  }, []);

  const addPlan = async (title, description) => {
    try {
      const prompt = `Please create a detailed plan based on the following description: ${description}
      
      PS: generate a plan in html and dont write any explanation or any other text.  
      `;
      const plan = await generateResponse(prompt);
      const newDesc = plan.replace(/^```html\s*/g, '').replace(/```$/g, '');
      console.log('Generated plan:', plan);
      const newPlan = await createPlan({ title, description: newDesc });
      setPlans((prevPlans) => [...prevPlans, newPlan]);
    } catch (err) {
      setError(err);
    }
  };

  return { plans, loading, error, addPlan };
};

export default usePlans;
