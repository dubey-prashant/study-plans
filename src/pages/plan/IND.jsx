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
  const [generationProgress, setGenerationProgress] = useState({
    active: false,
    currentSection: '',
    completedSections: 0,
    totalSections: 9,
  });
  // New state for the current in-progress document
  const [inProgressDocument, setInProgressDocument] = useState({
    title: '',
    description: '',
  });

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

      Current Application Content: ${plan.INDApplication.content}
      User Description: ${plan.INDApplication.description}

      Suggestion: ${suggestion}

      Provide an improved version of the application content that incorporates the suggestion. Keep the response focused only on the improved content without any explanatory text.`;

      const improvedContent = await generateINDResponse(prompt);

      // Update the IND application with the improved content
      const updatedPlan = await updateIND(plan.id, {
        ...plan.INDApplication,
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

  // Save edits to the IND application
  const handleSaveEdit = async (updatedIND) => {
    try {
      const updatedPlan = await updateIND(plan.id, updatedIND);
      setPlan(updatedPlan);
    } catch (error) {
      console.error('Error updating IND Application:', error);
    }
  };

  // Create a new IND application with section-by-section generation
  const handleCreate = async (title, description) => {
    try {
      setIsCreating(true);
      setDialogOpen(false);
      setGenerationProgress({
        active: true,
        currentSection: 'Preparing to generate IND Application',
        completedSections: 0,
        totalSections: 9,
      });

      // Initialize in-progress document
      setInProgressDocument({
        title: title || 'IND Application',
        description: description || additionalInfo,
        content: '<p>Generating content...</p>',
      });

      // Create initial IND application with user description
      const newPlan = await createIND(plan.id, {
        title: title || 'IND Application',
        description: description || additionalInfo,
        glpModuleId: plan.GLPModule.id,
        cmcModuleId: plan.CMCModule.id,
      });

      // Define comprehensive IND sections with detailed prompts
      const sections = [
        {
          name: '1. Cover Letter',
          prompt: `Create a comprehensive Cover Letter section (Section 1) for an IND Application following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should include:
          - Professional letterhead and date
          - Proper FDA office addressing (CDER or CBER as appropriate)
          - Clear subject line with drug code and indication
          - Introduction of the sponsor organization
          - Brief description of the investigational drug and its mechanism of action
          - Overview of the proposed clinical study program
          - Statement of regulatory compliance commitment
          - Primary contact information
          - Professional closing with authorized signatory
          
          Additional Requirements: ${description || additionalInfo}
          
          Format as HTML with professional business letter structure following FDA submission guidelines.`,
        },
        {
          name: '2. Form FDA 1571 Summary',
          prompt: `Create a comprehensive Form FDA 1571 Summary section (Section 2) for an IND Application following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should include detailed information from Form FDA 1571:
          - Complete sponsor information (name, address, contact details)
          - Drug identification (chemical name, code name, indication)
          - Phase of clinical investigation
          - Route of administration and dosage form
          - Principal investigator details and qualifications
          - Clinical study site information
          - Regulatory history and prior submissions
          - Manufacturing facility information
          - Study protocol identification numbers
          - Timeline for study initiation
          
          Include comprehensive tables with all required regulatory information.
          Additional Requirements: ${description || additionalInfo}
          
          Format as HTML with structured tables and regulatory-compliant organization following FDA guidelines.`,
        },
        {
          name: '3. Introductory Statement and General Investigational Plan',
          prompt: `Create a comprehensive Introductory Statement and General Investigational Plan section (Section 3) for an IND Application following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should include:
          
          3.1 Drug Product Overview:
          - Detailed description of the investigational product
          - Chemical structure and molecular characteristics
          - Therapeutic class and mechanism of action
          - Proposed indication and target patient population
          - Rationale for development program
          
          3.2 Clinical Development Strategy:
          - Overall development plan from Phase 1 through registration
          - Study objectives and endpoints for each phase
          - Patient population and inclusion/exclusion criteria
          - Dosing strategy and administration schedule
          - Expected timeline and milestones
          
          3.3 Scientific Rationale:
          - Unmet medical need and market assessment
          - Competitive landscape analysis
          - Differentiation from existing therapies
          - Regulatory pathway and approval strategy
          
          3.4 Risk-Benefit Assessment:
          - Identified risks based on preclinical data
          - Risk mitigation strategies and monitoring plans
          - Potential benefits for target patient population
          - Overall benefit-risk justification for human studies
          
          Additional Requirements: ${description || additionalInfo}
          
          Format as HTML with comprehensive sections and regulatory structure following FDA guidelines.`,
        },
        {
          name: "4. Investigator's Brochure",
          prompt: `Create a comprehensive Investigator's Brochure section (Section 4) for an IND Application following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should include detailed information per ICH E6 guidelines:
          
          4.1 Chemical and Physical Properties:
          - Complete chemical characterization (name, formula, structure)
          - Physical properties (molecular weight, solubility, stability)
          - Analytical methods for identification and quantification
          - Formulation details and excipient information
          - Storage and handling requirements
          
          4.2 Pharmacology Summary:
          - Primary pharmacodynamics and mechanism of action
          - Secondary pharmacology and off-target effects
          - Pharmacokinetic profile across species
          - ADME characteristics and metabolic pathways
          - Drug-drug interaction potential
          - Dose-response relationships
          
          4.3 Toxicology Summary:
          - Single and repeat-dose toxicity findings
          - Target organs and dose-limiting toxicities
          - NOAEL determinations and safety margins
          - Genotoxicity and carcinogenicity assessment
          - Reproductive and developmental toxicity
          - Safety pharmacology findings
          
          4.4 Clinical Starting Dose Justification:
          - NOAEL-based calculations with safety factors
          - Allometric scaling considerations
          - Comparable human dose estimations
          - Starting dose rationale and dose escalation plan
          
          4.5 Risk Assessment and Monitoring:
          - Identified risks and their clinical relevance
          - Monitoring parameters and frequency
          - Dose modification guidelines
          - Contraindications and warnings
          
          Additional Requirements: ${description || additionalInfo}
          
          Include comprehensive data tables and detailed safety assessments.
          Format as HTML with professional structure following ICH E6 and FDA guidelines.`,
        },
        {
          name: '5. Clinical Protocol(s)',
          prompt: `Create a comprehensive Clinical Protocol(s) section (Section 5) for an IND Application following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should include detailed protocol information:
          
          5.1 Protocol Synopsis:
          - Study title and protocol identification
          - Phase of development and study design
          - Primary and secondary objectives
          - Study population and sample size
          - Treatment arms and randomization scheme
          - Study duration and follow-up period
          
          5.2 Study Design and Methodology:
          - Detailed study design (randomized, blinded, controlled)
          - Patient selection criteria (inclusion/exclusion)
          - Dose escalation schema (if applicable)
          - Treatment schedule and administration details
          - Efficacy and safety assessments
          - Statistical analysis plan overview
          
          5.3 Safety Monitoring:
          - Adverse event reporting procedures
          - Dose-limiting toxicity definitions
          - Safety review committee structure
          - Stopping rules and dose modification guidelines
          - Emergency procedures and contact information
          
          5.4 Efficacy Assessments:
          - Primary and secondary endpoint definitions
          - Assessment schedules and methodologies
          - Response criteria and evaluation standards
          - Biomarker and pharmacokinetic sampling
          
          5.5 Regulatory Compliance:
          - Good Clinical Practice adherence
          - Institutional Review Board approval
          - Informed consent procedures
          - Data management and quality assurance
          - Regulatory reporting requirements
          
          Additional Requirements: ${description || additionalInfo}
          
          Format as HTML with detailed protocol structure following ICH GCP and FDA guidelines.`,
        },
        {
          name: '6. Chemistry, Manufacturing, and Controls (CMC)',
          prompt: `Create a comprehensive Chemistry, Manufacturing, and Controls (CMC) section (Section 6) for an IND Application following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should integrate CMC information from the existing CMC module and include:
          
          6.1 Drug Substance Information:
          - Complete chemical characterization and nomenclature
          - Manufacturing process and synthetic route
          - Specifications and analytical methods
          - Stability data and storage conditions
          - Impurity profile and control strategy
          - Manufacturing facility information and GMP compliance
          
          6.2 Drug Product Information:
          - Formulation composition and rationale
          - Manufacturing process description
          - Container-closure system
          - Product specifications and testing methods
          - Stability studies and shelf-life determination
          - Quality control procedures
          
          6.3 Analytical Methods:
          - Method development and validation
          - Identity, assay, and purity testing
          - Impurity identification and quantification
          - Dissolution and bioavailability testing
          - Microbiological testing (if applicable)
          - Reference standards and certificates
          
          6.4 Quality Assurance:
          - Good Manufacturing Practice compliance
          - Quality control laboratory qualifications
          - Change control procedures
          - Batch records and documentation
          - Supply chain management
          - Deviation and investigation procedures
          
          Based on CMC Module: ${
            plan.CMCModule?.content ||
            plan.CMCModule?.description ||
            'Standard CMC requirements'
          }
          Additional Requirements: ${description || additionalInfo}
          
          Format as HTML with comprehensive tables and regulatory structure following FDA CMC guidelines.`,
        },
        {
          name: '7. Pharmacology and Toxicology Information',
          prompt: `Create a comprehensive Pharmacology and Toxicology Information section (Section 7) for an IND Application following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should integrate findings from the GLP module and include:
          
          7.1 Pharmacodynamics:
          - Primary mechanism of action and target engagement
          - Dose-response relationships and potency
          - Duration of action and reversibility
          - Secondary pharmacology and off-target effects
          - Species comparison and human relevance
          - Biomarker and pharmacodynamic endpoints
          
          7.2 Pharmacokinetics and ADME:
          - Absorption characteristics and bioavailability
          - Distribution pattern and tissue penetration
          - Metabolism and metabolite identification
          - Excretion pathways and elimination kinetics
          - Species scaling and human dose predictions
          - Drug-drug interaction potential
          
          7.3 Toxicology Studies:
          - Single-dose toxicity studies with LD50 determinations
          - Repeat-dose toxicity with NOAEL and target organs
          - Dose-limiting toxicities and reversibility
          - Safety margins based on exposure comparisons
          - Species differences and human relevance
          - Recovery and reversibility assessments
          
          7.4 Specialized Toxicology:
          - Genotoxicity battery (Ames, chromosomal aberration, micronucleus)
          - Carcinogenicity assessment and weight of evidence
          - Reproductive and developmental toxicity studies
          - Immunotoxicity evaluation (if applicable)
          - Phototoxicity and other specialized studies
          
          7.5 Safety Pharmacology:
          - Central nervous system effects
          - Cardiovascular safety (including hERG assessment)
          - Respiratory function evaluation
          - Additional organ systems as appropriate
          
          Based on GLP Module: ${
            plan.GLPModule?.content ||
            plan.GLPModule?.description ||
            'Standard GLP study results'
          }
          Additional Requirements: ${description || additionalInfo}
          
          Include comprehensive safety assessment and human risk evaluation.
          Format as HTML with detailed data tables and regulatory structure following FDA guidelines.`,
        },
        {
          name: '8. Previous Human Experience',
          prompt: `Create a comprehensive Previous Human Experience section (Section 8) for an IND Application following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should include:
          
          8.1 Clinical Experience Summary:
          - Previous clinical studies with the investigational product
          - Doses tested and patient populations studied
          - Safety findings and adverse event profiles
          - Efficacy signals and biomarker data
          - Regulatory approvals in other jurisdictions
          
          8.2 Related Compound Experience:
          - Clinical experience with compounds in the same class
          - Mechanism-based safety considerations
          - Established adverse event patterns
          - Drug-drug interactions and contraindications
          - Risk mitigation strategies from class experience
          
          8.3 Published Literature:
          - Relevant scientific publications and case reports
          - Post-marketing surveillance data
          - Epidemiological studies and real-world evidence
          - Meta-analyses and systematic reviews
          - Expert opinion and clinical guidelines
          
          8.4 Risk Assessment:
          - Known and potential risks based on available data
          - Risk characterization and clinical significance
          - Monitoring strategies and risk mitigation plans
          - Patient selection criteria to minimize risks
          - Benefit-risk assessment for the proposed indication
          
          8.5 Regulatory History:
          - Previous regulatory interactions and submissions
          - Regulatory advice and guidance received
          - International regulatory status and approvals
          - Special designations (breakthrough, fast track, etc.)
          - Post-marketing commitments and requirements
          
          Additional Requirements: ${description || additionalInfo}
          
          If no previous human experience exists, provide detailed justification based on preclinical data and related compound experience.
          Format as HTML with comprehensive assessment following FDA guidelines.`,
        },
        {
          name: '9. Additional Information',
          prompt: `Create a comprehensive Additional Information section (Section 9) for an IND Application following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should include all supplementary regulatory information:
          
          9.1 Environmental Assessment:
          - Environmental impact evaluation per 21 CFR Part 25
          - Categorical exclusion justification
          - Environmental assessment documentation (if required)
          - Waste disposal and environmental safety measures
          
          9.2 Pediatric Study Plans:
          - Pediatric Research Equity Act (PREA) compliance
          - Justification for deferral or waiver requests
          - Planned pediatric development strategy
          - Age-appropriate formulation considerations
          - Pediatric safety and dosing considerations
          
          9.3 Special Populations:
          - Hepatic and renal impairment considerations
          - Geriatric population safety and dosing
          - Pregnancy and lactation safety information
          - Ethnic and racial diversity considerations
          - Genetic polymorphism implications
          
          9.4 Manufacturing and Quality:
          - Good Manufacturing Practice compliance statements
          - Quality agreements with contract manufacturers
          - Supply chain management and contingency plans
          - Batch release procedures and specifications
          - Post-market surveillance and quality monitoring
          
          9.5 Regulatory Compliance:
          - Good Clinical Practice adherence
          - Institutional Review Board processes
          - Informed consent procedures and forms
          - Data integrity and electronic records compliance
          - Pharmacovigilance and safety reporting procedures
          
          9.6 Risk Management:
          - Risk Evaluation and Mitigation Strategy (REMS) assessment
          - Risk minimization measures and monitoring
          - Healthcare provider and patient education materials
          - Distribution restrictions and access controls
          - Post-marketing safety studies (if applicable)
          
          9.7 International Considerations:
          - Global development strategy and regulatory alignment
          - International Conference on Harmonisation (ICH) compliance
          - Foreign regulatory submissions and approvals
          - Cultural and regional considerations for clinical studies
          - International pharmacovigilance coordination
          
          Additional Requirements: ${description || additionalInfo}
          
          Format as HTML with comprehensive regulatory documentation following FDA guidelines.`,
        },
      ];

      let combinedContent = '';

      // Generate content section by section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        setGenerationProgress({
          active: true,
          currentSection: section.name,
          completedSections: i,
          totalSections: sections.length,
        });

        try {
          const sectionContent = await generateINDResponse(section.prompt);

          // Clean up the section content
          const cleanedContent = sectionContent
            .replace(/^```html\s*/g, '')
            .replace(/```$/g, '')
            .trim();

          combinedContent += cleanedContent + '\n\n';

          // Update the in-progress document with current content
          setInProgressDocument({
            title: title || 'IND Application',
            description: description || additionalInfo,
            content: combinedContent,
          });

          // Small delay between sections to prevent rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error generating section ${section.name}:`, error);
          // Continue with next section even if one fails
          combinedContent += `<h2>${section.name}</h2><p>Error generating this section. Please try regenerating.</p>\n\n`;

          setInProgressDocument({
            title: title || 'IND Application',
            description: description || additionalInfo,
            content: combinedContent,
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

      // Update with generated content
      const finalPlan = await updateIND(plan.id, {
        ...newPlan.INDApplication,
        content: combinedContent,
      });

      console.log('New IND Application created:', finalPlan);
      setPlan(finalPlan);

      // Reset states
      setIsCreating(false);
      setGenerationProgress({
        active: false,
        currentSection: '',
        completedSections: 0,
        totalSections: 9,
      });
      setInProgressDocument({
        title: '',
        description: '',
        content: '',
      });

      setAdditionalInfo('');
    } catch (error) {
      console.error('Error creating IND Application:', error);
      setGenerationProgress({
        active: false,
        currentSection: '',
        completedSections: 0,
        totalSections: 9,
      });
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

  // Show generation progress when creating
  if (generationProgress.active || isCreating) {
    return (
      <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 w-full'>
        <h2 className='text-2xl font-bold mb-4 text-gray-800'>
          IND Application
        </h2>

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
    );
  }

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
                onClick={() => handleCreate('IND Application', additionalInfo)}
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
      <div className='flex justify-between items-center mb-6'>
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
      </div>

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
