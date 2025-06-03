import {
  generateCMCResponse,
  generateGLPResponse,
  generateINDResponse,
  generateResponse,
} from './ai.service';
import { v4 as uuidv4 } from 'uuid';
import { addComment } from './comment.service';

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
      id: uuidv4(),
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

// GLP Module functions
export const createGLP = async (planId, { title, description }) => {
  try {
    const plan = await updatePlan(planId, {
      GLPModule: {
        id: uuidv4(),
        title,
        description,
        validatedByAI: false,
        aiSuggestion: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return plan;
  } catch (error) {
    console.error('Error creating GLP Module:', error);
    throw new Error('Failed to create GLP Module');
  }
};

export const updateGLP = async (planId, updatedData) => {
  const { GLPModule: exData } = await getPlanById(planId);
  const newPlan = await updatePlan(planId, {
    GLPModule: { ...exData, ...updatedData },
  });

  return newPlan;
};

export const deleteGLP = async (planId) => {
  const newPlan = await updatePlan(planId, {
    GLPModule: null,
  });

  return newPlan;
};

export const validateGLP = async (planId) => {
  try {
    // Find the plan to validate
    const exPlan = await getPlanById(planId);
    const GLPModule = exPlan.GLPModule;

    if (!GLPModule) {
      console.error('Plan not found for validation');
      return exPlan;
    }

    const validationPrompt = `
      Review and validate the following study plan. Identify 2-3 specific improvements or suggestions
      that would make this plan more comprehensive, scientifically sound, or better aligned with regulatory
      requirements. Format your response as concrete, actionable suggestions. Focus on methodology,
      missing sections, or areas that need more detail.
      
      Plan to review: ${GLPModule.description}
      
      Return your response as 2-3 specific suggestions for improvement. Each suggestion should
      be practical, specific, and actionable.

      Do not include any other text or explanations. Just provide the suggestions in a clean format.
      PS: generate a plan in html and dont write any explanation or any other text.
    `;

    // Get AI validation and suggestions
    const validationResponse = await generateGLPResponse(validationPrompt);

    // Clean up the response
    const suggestions = validationResponse
      .replace(/^```(?:html|markdown)?\s*/g, '')
      .replace(/```$/g, '')
      .trim();

    console.log('Validation suggestions:', suggestions);

    // mark as validated
    const newPlan = await updateGLP(planId, {
      ...GLPModule,
      validatedByAI: true,
    });

    // Add suggestions as a comment to the plan
    await addComment(GLPModule.id, {
      text: suggestions,
      author: 'AI Assistant',
      type: 'suggestion',
      isSuggestion: true,
      createdAt: new Date().toISOString(),
    });

    return newPlan;
  } catch (err) {
    console.error('Error validating plan:', err);
    return getPlanById(planId);
  }
};

///////////////////////////////
// CMC Module functions    ////
/// ///////////////////////////
export const createCMC = async (planId, { title, description }) => {
  try {
    const prompt = `Create a comprehensive Chemistry, Manufacturing, and Controls (CMC) module for a pharmaceutical product based on the following requirements:
    
    ${description}
    
    Include sections on:
    1. Drug substance information
    2. Drug product formulation
    3. Manufacturing process
    4. Quality control and specifications
    5. Stability data
    
    Format the response in HTML for direct display in a web application.`;

    const resp = await generateCMCResponse(prompt);
    const newDesc = resp.replace(/^```html\s*/g, '').replace(/```$/g, '');
    console.log('Generated CMC Module:', resp);

    const newPlan = await updatePlan(planId, {
      CMCModule: {
        id: uuidv4(),
        title,
        description: newDesc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    return newPlan;
  } catch (error) {
    console.error('Error creating CMC Module:', error);
    throw new Error('Failed to create CMC Module');
  }
};

export const updateCMC = async (planId, updatedData) => {
  try {
    const { CMCModule: existingData } = await getPlanById(planId);
    const newPlan = await updatePlan(planId, {
      CMCModule: {
        ...existingData,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      },
    });

    return newPlan;
  } catch (error) {
    console.error('Error updating CMC Module:', error);
    throw new Error('Failed to update CMC Module');
  }
};

export const deleteCMC = async (planId) => {
  try {
    const newPlan = await updatePlan(planId, {
      CMCModule: null,
    });

    return newPlan;
  } catch (error) {
    console.error('Error deleting CMC Module:', error);
    throw new Error('Failed to delete CMC Module');
  }
};

export const validateCMC = async (planId) => {
  try {
    // Find the plan to validate
    const plan = await getPlanById(planId);
    const { CMCModule } = plan;

    if (!CMCModule) {
      console.error('CMC Module not found for validation');
      return plan; // Return existing plan instead of null
    }

    const validationPrompt = `
      Review and validate the following Chemistry, Manufacturing, and Controls (CMC) module. Identify 2-3 specific improvements or suggestions
      that would make this module more comprehensive, scientifically sound, or better aligned with regulatory
      requirements (such as FDA or EMA guidelines for CMC content).
      
      Focus on areas like:
      - Manufacturing process documentation
      - Quality control specifications
      - Stability data completeness
      - Analytical method validation
      - Container closure system information
      
      CMC Module to review: ${CMCModule.description}
      
      Return your response as 2-3 specific suggestions for improvement. Each suggestion should
      be practical, specific, and actionable.

      Format your response in HTML with list items for each suggestion. Do not include any explanatory text or commentary.
    `;

    // Get AI validation and suggestions
    const validationResponse = await generateCMCResponse(validationPrompt);

    // Clean up the response
    const suggestions = validationResponse
      .replace(/^```(?:html|markdown)?\s*/g, '')
      .replace(/```$/g, '')
      .trim();

    console.log('CMC Module validation suggestions:', suggestions);

    // Mark as validated
    const newPlan = await updateCMC(planId, {
      ...CMCModule,
      validatedByAI: true,
    });

    // Add suggestions as a comment to the module
    await addComment(CMCModule.id, {
      text: suggestions,
      author: 'AI Assistant',
      type: 'suggestion',
      isSuggestion: true,
      createdAt: new Date().toISOString(),
    });

    return newPlan;
  } catch (err) {
    console.error('Error validating CMC Module:', err);
    // Return the original plan instead of null
    return getPlanById(planId);
  }
};

// IND Application functions
export const createIND = async (
  planId,
  { title, description, glpModuleId, cmcModuleId }
) => {
  try {
    const plan = await getPlanById(planId);

    if (!plan.GLPModule || !plan.CMCModule) {
      throw new Error(
        'Both GLP and CMC modules are required to create an IND Application'
      );
    }

    const extractTextFromHtml = (html) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      let textContent = tempDiv.textContent || tempDiv.innerText || '';

      textContent = textContent.replace(/\s+/g, ' ').trim();

      if (textContent.length > 4000) {
        textContent =
          textContent.substring(0, 4000) +
          '... [content truncated for brevity]';
      }

      return textContent;
    };

    const glpContent = extractTextFromHtml(plan.GLPModule.description);
    const cmcContent = extractTextFromHtml(plan.CMCModule.description);

    const prompt = `Create a comprehensive Investigational New Drug (IND) application based on the following information:
    
    ADDITIONAL REQUIREMENTS: ${description || 'Standard IND application'}
    
    GLP MODULE INFORMATION:
    ${glpContent}
    
    CMC MODULE INFORMATION:
    ${cmcContent}
    
    Based on the preclinical (GLP) study results and the Chemistry, Manufacturing, and Controls (CMC) information provided above, create a complete IND application that includes all key sections required by FDA:
    
    1. Cover letter and Form FDA 1571
    2. Table of contents
    3. Introductory statement and general investigational plan
    4. Investigator's brochure
    5. Clinical protocol(s)
    6. Chemistry, manufacturing, and control information (summarized from CMC module)
    7. Pharmacology and toxicology information (summarized from GLP module)
    8. Previous human experience (if applicable)
    9. Additional information
    
    Format your response in HTML for direct display in a web application. Ensure the content is well-structured, professionally written, and meets regulatory standards.`;

    const resp = await generateResponse(prompt);
    const newDesc = resp.replace(/^```html\s*/g, '').replace(/```$/g, '');
    console.log('Generated IND Application based on GLP and CMC modules');

    const newPlan = await updatePlan(planId, {
      INDApplication: {
        id: uuidv4(),
        title,
        description: newDesc,
        glpModuleId,
        cmcModuleId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    return newPlan;
  } catch (error) {
    console.error('Error creating IND Application:', error);
    throw new Error('Failed to create IND Application');
  }
};

export const updateIND = async (planId, updatedData) => {
  try {
    const { INDApplication: existingData } = await getPlanById(planId);
    const newPlan = await updatePlan(planId, {
      INDApplication: {
        ...existingData,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      },
    });

    return newPlan;
  } catch (error) {
    console.error('Error updating IND Application:', error);
    throw new Error('Failed to update IND Application');
  }
};

export const deleteIND = async (planId) => {
  try {
    const newPlan = await updatePlan(planId, {
      INDApplication: null,
    });

    return newPlan;
  } catch (error) {
    console.error('Error deleting IND Application:', error);
    throw new Error('Failed to delete IND Application');
  }
};

export const validateIND = async (planId) => {
  try {
    // Find the plan to validate
    const plan = await getPlanById(planId);
    const { INDApplication } = plan;

    if (!INDApplication) {
      console.error('IND Application not found for validation');
      return plan;
    }

    const validationPrompt = `
      Review and validate the following Investigational New Drug (IND) application. Identify 2-3 specific improvements or suggestions
      that would make this application more comprehensive, scientifically sound, or better aligned with FDA regulatory
      requirements for IND submissions.
      
      Focus on areas like:
      - Completeness of required sections
      - Clinical protocol design
      - Safety monitoring plans
      - Chemistry, manufacturing, and controls information
      - Clarity and organization of the application
      
      IND Application to review: ${INDApplication.description}
      
      Return your response as 2-3 specific suggestions for improvement. Each suggestion should
      be practical, specific, and actionable.

      Format your response in HTML with list items for each suggestion. Do not include any explanatory text or commentary.
    `;

    // Get AI validation and suggestions
    const validationResponse = await generateINDResponse(validationPrompt);

    // Clean up the response
    const suggestions = validationResponse
      .replace(/^```(?:html|markdown)?\s*/g, '')
      .replace(/```$/g, '')
      .trim();

    console.log('IND Application validation suggestions:', suggestions);

    // Mark as validated
    const newPlan = await updateIND(planId, {
      ...INDApplication,
      validatedByAI: true,
    });

    // Add suggestions as a comment to the module
    await addComment(INDApplication.id, {
      text: suggestions,
      author: 'AI Assistant',
      type: 'suggestion',
      isSuggestion: true,
      createdAt: new Date().toISOString(),
    });

    return newPlan;
  } catch (err) {
    console.error('Error validating IND Application:', err);
    return getPlanById(planId);
  }
};
