import { useState, useEffect, useCallback } from 'react';
import { getPlans, getPlanById } from '../services/plan.service';

export const usePlans = (planId = null) => {
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      if (planId) {
        // Fetch single plan if ID is provided
        const fetchedPlan = await getPlanById(planId);
        setPlan(fetchedPlan);
      } else {
        // Fetch all plans if no ID is provided
        const fetchedPlans = await getPlans();
        setPlans(fetchedPlans);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    plan,
    setPlan,
    isLoading,
    error,
  };
};

export default usePlans;
