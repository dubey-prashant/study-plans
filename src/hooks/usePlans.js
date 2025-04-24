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
      const plan = await generateResponse(description);
      console.log('Generated plan:', plan);
      const newPlan = await createPlan({ title, description: plan });
      setPlans((prevPlans) => [...prevPlans, newPlan]);
    } catch (err) {
      setError(err);
    }
  };

  return { plans, loading, error, addPlan };
};

export default usePlans;
