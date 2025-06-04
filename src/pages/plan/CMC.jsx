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
  const [isCreating, setIsCreating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    active: false,
    currentSection: '',
    completedSections: 0,
    totalSections: 8,
  });
  const [inProgressDocument, setInProgressDocument] = useState({
    title: '',
    description: '',
    content: '',
  });

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

      Current Module Content: ${plan.CMCModule.content}
      User Description: ${plan.CMCModule.description}

      Suggestion: ${suggestion}

      Provide an improved version of the module content that incorporates the suggestion. Keep the response focused only on the improved content without any explanatory text.`;

      const improvedContent = await generateCMCResponse(prompt);

      // Update the CMC module with the improved content
      const updatedPlan = await updateCMC(plan.id, {
        ...plan.CMCModule,
        content: improvedContent
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

  // Create a new CMC module with section-by-section generation
  const handleCreate = async (title, description) => {
    try {
      setIsCreating(true);
      setDialogOpen(false);
      setGenerationProgress({
        active: true,
        currentSection: 'Preparing to generate CMC Module',
        completedSections: 0,
        totalSections: 8,
      });

      setInProgressDocument({
        title: title,
        description: description,
        content: '<p>Generating content...</p>',
      });

      // Define comprehensive CMC sections following FDA format
      const sections = [
        {
          name: '1. Drug Substance (Active Pharmaceutical Ingredient)',
          prompt: `Create a comprehensive Drug Substance section (Section 1) for a CMC Module following FDA format requirements for ${
            title || 'a pharmaceutical product'
          }.
          
          This section must include all ICH M4Q(R1) required subsections:
          
          1.1 General Information:
          - Nomenclature (INN, USAN, chemical name, CAS number, trade names)
          - Chemical structure with stereochemistry
          - Molecular formula and molecular weight
          - Physicochemical properties (pKa, LogP, solubility profile, polymorphism)
          - General properties affecting performance (hygroscopicity, photostability, thermal stability)
          
          1.2 Manufacture:
          - Detailed manufacturing process description with flow diagram
          - Critical process parameters and their acceptable ranges
          - Process controls at each step
          - In-process testing and acceptance criteria
          - Process validation strategy and lifecycle approach
          - Quality risk management assessment
          
          1.3 Characterisation:
          - Complete structural elucidation using NMR, MS, IR, UV
          - Impurity profile including process-related and degradation impurities
          - Impurity qualification thresholds per ICH Q3A(R2)
          - Chiral purity assessment (if applicable)
          - Solid-state characterization (polymorphs, hydrates, solvates)
          
          1.4 Control of Drug Substance:
          - Complete specification table with test methods and acceptance criteria
          - Analytical method validation summary per ICH Q2(R1)
          - Certificate of analysis from multiple batches
          - Comparison with pharmacopoeial standards
          - Control strategy for critical quality attributes
          
          1.5 Reference Standards or Materials:
          - Primary reference standard qualification
          - Working standards and their qualification
          - Impurity reference standards
          
          1.6 Container Closure System:
          - Container description and specifications
          - Compatibility studies
          - Extractables and leachables assessment
          
          1.7 Stability:
          - Stability study design per ICH Q1A(R2)
          - Long-term, intermediate, and accelerated study results
          - Stress testing results
          - Degradation pathway elucidation
          - Proposed retest period and storage conditions
          - Stability commitment
          
          Format as HTML with detailed tables, specifications, and professional regulatory formatting following FDA/ICH M4Q guidelines.`,
        },
        {
          name: '2. Drug Product',
          prompt: `Create a comprehensive Drug Product section (Section 2) for a CMC Module following FDA format requirements for ${
            title || 'a pharmaceutical product'
          }.
          
          This section must include all ICH M4Q(R1) required subsections:
          
          2.1 Description and Composition:
          - Complete qualitative and quantitative composition table
          - Function of each excipient with scientific rationale
          - Dosage form description and appearance
          - Unit formula for batch size normalization
          - Overage calculations and justifications
          
          2.2 Pharmaceutical Development:
          - Drug product development strategy and rationale
          - Formulation development studies and optimization
          - Critical quality attributes (CQAs) identification
          - Design space and control strategy
          - Manufacturing process development and scale-up
          - Container closure system selection and compatibility
          - Microbiological attributes and preservative effectiveness
          - Excipient compatibility studies
          
          2.3 Manufacture:
          - Detailed manufacturing process description
          - Process flow diagram with critical steps highlighted
          - Equipment specifications and operating parameters
          - Critical process parameters (CPPs) and their ranges
          - In-process controls and acceptance criteria
          - Process validation protocol summary
          - Cleaning validation considerations
          
          2.4 Control of Excipients:
          - Specifications for novel excipients
          - Functional excipient specifications
          - Certificates of analysis examples
          - Supplier qualification summary
          
          2.5 Control of Drug Product:
          - Complete specification table with all tests
          - Analytical method validation summary
          - Batch analysis data from multiple batches
          - Content uniformity and dissolution testing
          - Microbiological testing (if applicable)
          - Control strategy implementation
          
          2.6 Reference Standards or Materials:
          - Reference standards used for drug product testing
          - Working standards qualification
          
          2.7 Container Closure System:
          - Primary packaging description and specifications
          - Extractables and leachables studies
          - Compatibility and protection studies
          - Closure integrity testing
          
          2.8 Stability:
          - Stability study design per ICH Q1A(R2)
          - Real-time and accelerated study results
          - Photostability testing per ICH Q1B
          - In-use stability studies
          - Proposed shelf life and storage conditions
          - Stability commitment and ongoing studies
          
          Format as HTML with comprehensive tables, test results, and professional regulatory formatting following FDA/ICH M4Q guidelines.`,
        },
        {
          name: '3. Manufacturing Process and Controls',
          prompt: `Create a Manufacturing Process and Controls section (Section 3) for a CMC Module following FDA format requirements for ${
            title || 'a pharmaceutical product'
          }.
          
          This section should provide comprehensive manufacturing details:
          
          3.1 Process Development and Scale-up:
          - Process development history and rationale
          - Scale-up considerations and studies
          - Process optimization and robustness studies
          - Technology transfer protocols
          
          3.2 Critical Process Parameters (CPPs):
          - Identification of CPPs through risk assessment
          - Operating ranges and control limits
          - Process capability studies
          - Statistical process control implementation
          
          3.3 Process Controls and Monitoring:
          - Real-time monitoring systems
          - Process analytical technology (PAT) implementation
          - Environmental monitoring requirements
          - Equipment qualification (IQ, OQ, PQ)
          
          3.4 Process Validation:
          - Process validation strategy per FDA guidance
          - Validation protocols and acceptance criteria
          - Continued process verification plan
          - Change control procedures
          
          3.5 Cleaning and Cross-contamination Prevention:
          - Cleaning validation protocols
          - Residue limits and analytical methods
          - Dedicated vs. multi-product facility considerations
          - Allergenic cross-contamination assessment
          
          Format as HTML with detailed process descriptions and control strategies following FDA/ICH guidelines.`,
        },
        {
          name: '4. Analytical Methods and Validation',
          prompt: `Create an Analytical Methods and Validation section (Section 4) for a CMC Module following FDA format requirements for ${
            title || 'a pharmaceutical product'
          }.
          
          This section should comprehensively cover analytical methodology:
          
          4.1 Analytical Method Development:
          - Method development strategy and approach
          - Selection of analytical techniques
          - Method optimization studies
          - Forced degradation studies and method specificity
          
          4.2 Method Validation per ICH Q2(R1):
          - Specificity/Selectivity validation
          - Linearity and range determination
          - Accuracy studies (recovery)
          - Precision (repeatability, intermediate precision, reproducibility)
          - Detection and quantitation limits
          - Robustness/Ruggedness testing
          - System suitability criteria
          
          4.3 Analytical Methods Summary:
          - Identity testing methods (HPLC, NMR, IR, etc.)
          - Assay methods with validation parameters
          - Impurity testing (related substances, residual solvents)
          - Physical testing (dissolution, content uniformity, etc.)
          - Microbiological testing methods
          
          4.4 Reference Standards and Reagents:
          - Primary and secondary reference standards
          - Reference standard qualification and certification
          - Reagent specifications and preparation
          - Solution stability studies
          
          4.5 Analytical Data and Batch Testing:
          - Representative batch analysis data
          - Out-of-specification (OOS) investigation procedures
          - Statistical analysis of batch data
          - Trending and control charts
          
          Format as HTML with detailed method descriptions, validation parameters, and acceptance criteria following FDA/ICH guidelines.`,
        },
        {
          name: '5. Quality Control and Quality Assurance',
          prompt: `Create a Quality Control and Quality Assurance section (Section 5) for a CMC Module following FDA format requirements for ${
            title || 'a pharmaceutical product'
          }.
          
          This section should address comprehensive quality systems:
          
          5.1 Quality Control Testing Strategy:
          - Testing strategy and rationale
          - Release testing vs. characterization testing
          - Risk-based testing approach
          - Skip testing protocols (where applicable)
          
          5.2 Quality Control Laboratory:
          - Laboratory capabilities and equipment
          - Personnel qualifications and training
          - Laboratory controls and documentation
          - Data integrity measures
          
          5.3 Quality Assurance Systems:
          - Quality management system overview
          - Document control and change management
          - Deviation and CAPA systems
          - Quality agreements with suppliers/contractors
          
          5.4 Release and Shelf-life Testing:
          - Batch release procedures and criteria
          - Certificate of analysis format
          - Annual product review process
          - Stability testing program management
          
          5.5 Quality Risk Management:
          - Quality risk management approach (ICH Q9)
          - Risk assessments for critical processes
          - Control strategy implementation
          - Continuous improvement processes
          
          Format as HTML with comprehensive quality systems descriptions following FDA/ICH guidelines.`,
        },
        {
          name: '6. Stability Studies and Shelf Life',
          prompt: `Create a comprehensive Stability Studies and Shelf Life section (Section 6) for a CMC Module following FDA format requirements for ${
            title || 'a pharmaceutical product'
          }.
          
          This section should follow ICH Q1A(R2) guidelines and include:
          
          6.1 Stability Study Design:
          - Study design rationale per ICH Q1A(R2)
          - Storage conditions (long-term, intermediate, accelerated)
          - Testing time points and frequency
          - Sample size and statistical considerations
          - Container closure systems tested
          
          6.2 Stability Test Methods:
          - Stability-indicating analytical methods
          - Method validation for stability testing
          - Degradation product identification and qualification
          - Statistical analysis of stability data
          
          6.3 Stability Study Results:
          - Long-term stability data presentation
          - Accelerated and intermediate condition results
          - Statistical analysis and trending
          - Degradation pathway elucidation
          - Photostability testing results (ICH Q1B)
          
          6.4 Shelf Life Determination:
          - Shelf life calculation methodology
          - Statistical analysis and confidence intervals
          - Proposed storage conditions and precautions
          - In-use stability considerations
          - Transportation and distribution studies
          
          6.5 Stability Commitment:
          - Ongoing stability study commitments
          - Post-approval stability study protocol
          - Annual stability report commitments
          - Change control impact on stability
          
          6.6 Special Stability Considerations:
          - Freeze-thaw stability (if applicable)
          - Mechanical stress testing
          - Container orientation studies
          - Compatibility with delivery devices
          
          Format as HTML with detailed stability data tables, statistical analyses, and professional regulatory formatting following FDA/ICH guidelines.`,
        },
        {
          name: '7. Regional Regulatory Considerations',
          prompt: `Create a Regional Regulatory Considerations section (Section 7) for a CMC Module following FDA format requirements for ${
            title || 'a pharmaceutical product'
          }.
          
          This section should address multi-regional requirements:
          
          7.1 FDA-Specific Requirements:
          - FDA guidance compliance summary
          - Drug Master File (DMF) references
          - GDUFA user fee considerations
          - FDA facility registration requirements
          
          7.2 EMA/EU Requirements:
          - EMA guideline compliance
          - ASMF (Active Substance Master File) considerations
          - EU GMP compliance summary
          - Qualified Person (QP) requirements
          
          7.3 ICH Harmonization:
          - ICH guideline compliance summary
          - Common Technical Document (CTD) format adherence
          - Quality by Design (QbD) implementation
          - Lifecycle management approach
          
          7.4 Global Supply Chain Considerations:
          - Multi-site manufacturing strategy
          - Import/export documentation requirements
          - Supply chain risk assessment
          - Business continuity planning
          
          7.5 Post-Marketing Requirements:
          - Pharmacovigilance reporting requirements
          - Annual reporting obligations
          - Change control and regulatory notification
          - Product quality complaints handling
          
          Format as HTML with comprehensive regulatory strategy and compliance information following international guidelines.`,
        },
        {
          name: '8. Environmental and Safety Assessment',
          prompt: `Create an Environmental and Safety Assessment section (Section 8) for a CMC Module following FDA format requirements for ${
            title || 'a pharmaceutical product'
          }.
          
          This section should address environmental and safety considerations:
          
          8.1 Environmental Risk Assessment:
          - Environmental risk assessment per FDA guidance
          - Predicted environmental concentration (PEC) calculations
          - Environmental fate and transport analysis
          - Ecotoxicity assessment
          - Risk mitigation measures
          
          8.2 Manufacturing Safety:
          - Occupational health and safety assessment
          - Chemical safety data sheets
          - Personal protective equipment requirements
          - Engineering controls and containment
          - Emergency response procedures
          
          8.3 Waste Management:
          - Manufacturing waste characterization
          - Waste treatment and disposal methods
          - Solvent recovery and recycling
          - Environmental monitoring requirements
          
          8.4 Green Chemistry Considerations:
          - Solvent selection and optimization
          - Process mass intensity calculations
          - Energy consumption optimization
          - Sustainable manufacturing practices
          
          8.5 Transportation and Storage Safety:
          - Transportation classification and requirements
          - Storage safety requirements
          - Temperature excursion studies
          - Emergency response procedures
          
          Format as HTML with comprehensive environmental and safety information following FDA and international guidelines.`,
        },
      ];

      // Process sections one by one
      let allGeneratedContent = '<h1>' + title + '</h1>';

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        setGenerationProgress({
          active: true,
          currentSection: section.name,
          completedSections: i,
          totalSections: sections.length,
        });

        try {
          // Include user description in the prompt
          const enhancedPrompt = `${section.prompt}
          
          User provided description: ${description}
          
          Please incorporate the user's requirements and context into this section.`;

          const sectionContent = await generateCMCResponse(enhancedPrompt);
          const cleanedContent = sectionContent
            .replace(/^```html\s*/g, '')
            .replace(/```$/g, '');

          allGeneratedContent += cleanedContent + '\n\n';

          setInProgressDocument({
            title: title,
            description: description,
            content: allGeneratedContent.trim(),
          });
        } catch (error) {
          console.error(`Error generating section "${section.name}":`, error);
          const errorContent = `<h2>${section.name}</h2><p>Error generating content. Please try again later.</p>`;
          allGeneratedContent += errorContent + '\n\n';

          setInProgressDocument({
            title: title,
            description: description,
            content: allGeneratedContent.trim(),
          });
        }
      }

      // Final progress update
      setGenerationProgress({
        active: true,
        currentSection: 'Finalizing document',
        completedSections: sections.length,
        totalSections: sections.length,
      });

      // Create the CMC module using the proper service function
      const newPlan = await createCMC(plan.id, {
        title,
        description,
      });

      // Update with generated content
      const finalPlan = await updateCMC(plan.id, {
        ...newPlan.CMCModule,
        content: allGeneratedContent.trim(),
      });

      console.log('New CMC Module created:', finalPlan);
      setPlan(finalPlan);

      // Reset states
      setIsCreating(false);
      setGenerationProgress({
        active: false,
        currentSection: '',
        completedSections: 0,
        totalSections: 8,
      });
      setInProgressDocument({
        title: '',
        description: '',
        content: '',
      });
    } catch (error) {
      console.error('Error creating CMC Module:', error);
      setIsCreating(false);
      setGenerationProgress({
        active: false,
        currentSection: '',
        completedSections: 0,
        totalSections: 8,
      });
    }
  };

  // Render when no CMC module exists yet
  if (!plan.CMCModule) {
    return (
      <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 w-full'>
        <h2 className='text-2xl font-bold mb-4 text-gray-800'>CMC Module</h2>

        {!isCreating ? (
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
        ) : (
          <div>
            {/* Generation Progress Indicator */}
            <div className='mb-6'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-md font-medium text-gray-800'>
                  Generating: {generationProgress.currentSection}
                </span>
                <span className='text-sm font-medium text-gray-700'>
                  {Math.round(
                    (generationProgress.completedSections /
                      generationProgress.totalSections) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2.5'>
                <div
                  className='bg-blue-600 h-2.5 rounded-full transition-all duration-500'
                  style={{
                    width: `${
                      (generationProgress.completedSections /
                        generationProgress.totalSections) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* In-Progress Document Preview */}
            <Details data={inProgressDocument} showActions={false} />
          </div>
        )}

        <CreatePlanDialog
          isOpen={isDialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreate={handleCreate}
        />
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto md:px-4 '>
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
