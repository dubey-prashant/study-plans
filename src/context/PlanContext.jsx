import React, { createContext, useState, useContext } from 'react';

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);

  const addPlan = (plan) => {
    setPlans((prevPlans) => [...prevPlans, plan]);
  };

  const updatePlan = (updatedPlan) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    );
  };

  const deletePlan = (planId) => {
    setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId));
  };

  return (
    <PlanContext.Provider value={{ plans, addPlan, updatePlan, deletePlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlans = () => {
  return useContext(PlanContext);
};
