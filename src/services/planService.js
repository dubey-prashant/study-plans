const STORAGE_KEY = 'ind_study_plans';

// Helper function to get plans from localStorage
const getPlansFromStorage = () => {
  const plans = localStorage.getItem(STORAGE_KEY);
  return plans ? JSON.parse(plans) : [];
};

// Helper function to save plans to localStorage
const savePlansToStorage = (plans) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
};

export const createPlan = async (planData) => {
  console.log('Creating plan with data:', planData);
  try {
    const plans = getPlansFromStorage();
    const newPlan = {
      id: Date.now().toString(), // Simple unique ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...planData,
    };

    plans.push(newPlan);
    savePlansToStorage(plans);
    return newPlan;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw new Error('Failed to create plan');
  }
};

export const getPlans = async () => {
  try {
    return getPlansFromStorage();
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw new Error('Failed to fetch plans');
  }
};

export const getPlanById = async (planId) => {
  try {
    const plans = getPlansFromStorage();
    const plan = plans.find((p) => p.id === planId);

    if (!plan) {
      throw new Error('Plan not found');
    }

    return plan;
  } catch (error) {
    console.error('Error fetching plan:', error);
    throw new Error('Failed to fetch plan');
  }
};

export const updatePlan = async (planId, updatedData) => {
  console.log('Updating plan with ID:', planId, 'and data:', updatedData);
  try {
    const plans = getPlansFromStorage();
    const index = plans.findIndex((p) => p.id === planId);

    if (index === -1) {
      throw new Error('Plan not found');
    }

    const updatedPlan = {
      ...plans[index],
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    plans[index] = updatedPlan;
    savePlansToStorage(plans);
    return updatedPlan;
  } catch (error) {
    console.error('Error updating plan:', error);
    throw new Error('Failed to update plan');
  }
};

export const deletePlan = async (planId) => {
  try {
    const plans = getPlansFromStorage();
    const filteredPlans = plans.filter((p) => p.id !== planId);

    if (filteredPlans.length === plans.length) {
      throw new Error('Plan not found');
    }

    savePlansToStorage(filteredPlans);
    return { success: true, id: planId };
  } catch (error) {
    console.error('Error deleting plan:', error);
    throw new Error('Failed to delete plan');
  }
};
