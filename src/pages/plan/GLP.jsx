import { useState, useEffect } from 'react';
import { createGLP, updateGLP, validateGLP } from '../../services/plan.service';
import { generateGLPResponse } from '../../services/ai.service';
import CreatePlanDialog from '../../components/home/CreatePlanDialog';
import Loader from '../../components/common/Loader';
import Details from '../../components/module/Details';
import CommentSection from '../../components/module/CommentSection';

const GLPModule = ({ plan, setPlan }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    active: false,
    currentSection: '',
    completedSections: 0,
    totalSections: 12,
  });
  // New state for the current in-progress document
  const [inProgressDocument, setInProgressDocument] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    const checkAndRunValidation = async () => {
      if (!plan.GLPModule) return;

      const { validatedByAI } = plan.GLPModule;
      console.log('validatedByAI', validatedByAI);
      // If there's no AI suggestion yet, run validation after a delay
      if (!validatedByAI && !isValidating) {
        console.log('validating.... ', plan.GLPModule);
        setIsValidating(true);

        // Wait 2 seconds before making the validation call
        setTimeout(async () => {
          try {
            const newPlan = await validateGLP(plan.id);
            console.log('GLP Validation completed:', newPlan);
            setPlan(newPlan);
            setValidationCompleted((prev) => !prev);
          } catch (error) {
            console.error('Error validating plan on page load:', error);
          } finally {
            setIsValidating(false);
          }
        }, 2000);
      }
    };

    checkAndRunValidation();
  }, [plan.id, plan.GLPModule, isValidating, setPlan]);

  // Apply AI-generated suggestion
  const handleApplySuggestion = async (suggestion) => {
    if (!plan.GLPModule) return;

    setIsApplyingSuggestion(true);

    try {
      const prompt = `Please update this Pre-Clinical GLP Module based on the suggestion provided.

      Current Module Content: ${plan.GLPModule.content}
      User Description: ${plan.GLPModule.description}

      Suggestion: ${suggestion}

      Provide an improved version of the module content that incorporates the suggestion. Keep the response focused only on the improved content without any explanatory text.`;

      const improvedContent = await generateGLPResponse(prompt);

      // Update the GLP module with the improved content
      const updatedPlan = await updateGLP(plan.id, {
        ...plan.GLPModule,
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

  // Save edits to the GLP module
  const handleSaveEdit = async (updatedGLP) => {
    try {
      const updatedPlan = await updateGLP(plan.id, updatedGLP);
      setPlan(updatedPlan);
    } catch (error) {
      console.error('Error updating GLP Module:', error);
    }
  };

  // Create a new GLP module with section-by-section generation
  const handleCreate = async (title, description) => {
    try {
      setIsCreating(true);
      setDialogOpen(false);
      setGenerationProgress({
        active: true,
        currentSection: 'Preparing to generate GLP Module',
        completedSections: 0,
        totalSections: 12,
      });
      // Initialize in-progress document with title
      setInProgressDocument({
        title: title,
        description: description,
        content: '<p>Generating content...</p>',
      });

      // Define enhanced GLP sections with more comprehensive prompts
      const sections = [
        {
          name: '1. Executive Summary',
          prompt: `Create a comprehensive Executive Summary section (Section 1) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should contain a thorough regulatory-compliant summary:
          
          - Brief overview of the test article including chemical name, molecular formula, therapeutic class, and proposed indication
          - Summary of the complete nonclinical development program including study types conducted
          - Key findings from all nonclinical studies with specific NOAEL values and safety margins
          - Integrated safety assessment highlighting target organs and dose-limiting toxicities
          - Species differences and human relevance assessment
          - Scientific justification for proceeding to clinical trials with proposed starting dose rationale
          - Statement of GLP compliance for pivotal studies with specific facility accreditations
          - Risk mitigation strategies for identified safety concerns
          - Overall benefit-risk assessment conclusion
          
          Include specific quantitative data where possible and reference key regulatory guidelines (ICH M3(R2), ICH S7A/B, etc.).
          Format as HTML with professional regulatory structure following FDA/ICH M4S guidelines.`,
        },
        {
          name: '2. Table of Contents',
          prompt: `Create a comprehensive Table of Contents section (Section 2) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          Include all standard sections required in an FDA-compliant preclinical assessment with detailed subsections:
          
          1. Executive Summary
          2. Table of Contents  
          3. Pharmacology
             3.1 Primary Pharmacodynamics
             3.2 Secondary Pharmacodynamics
             3.3 Safety Pharmacology
          4. Pharmacokinetics and Drug Metabolism (ADME)
             4.1 Analytical Methods and Validation
             4.2 Absorption
             4.3 Distribution
             4.4 Metabolism
             4.5 Excretion
             4.6 Pharmacokinetic Drug Interactions
             4.7 Toxicokinetics
          5. Toxicology
             5.1 Single-Dose Toxicity Studies
             5.2 Repeat-Dose Toxicity Studies
             5.3 Genotoxicity Studies
             5.4 Carcinogenicity Assessment
             5.5 Reproductive and Developmental Toxicity
             5.6 Local Tolerance Studies
             5.7 Immunotoxicity (if applicable)
             5.8 Other Toxicity Studies
          6. Integrated Summary and Risk Assessment
          7. References
          8. Appendices (Study Reports Summary)
          
          Format as HTML with appropriate structure and hyperlinks following FDA/ICH M4S guidelines.`,
        },
        {
          name: '3. Pharmacology',
          prompt: `Create a comprehensive Pharmacology section (Section 3) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should include detailed subsections with specific regulatory requirements:
          
          3.1 Primary Pharmacodynamics:
          - Detailed mechanism of action including target identification and binding kinetics
          - In vitro receptor binding studies with Ki/Kd values and selectivity ratios
          - Enzyme inhibition/activation studies with IC50/EC50 values
          - Functional assays demonstrating pharmacological activity
          - In vivo efficacy studies in relevant disease models with dose-response curves
          - Biomarker studies correlating exposure with pharmacological effect
          - Species comparison of pharmacological activity
          - Structure-activity relationships (SAR) analysis
          
          3.2 Secondary Pharmacodynamics:
          - Comprehensive receptor/enzyme screening panel (minimum 100 targets)
          - Off-target activities and their potential clinical relevance
          - Cross-reactivity with related receptor subtypes
          - Functional consequences of secondary pharmacology findings
          - Concentration-response relationships for off-target effects
          - Potential drug-drug interaction mechanisms
          
          3.3 Safety Pharmacology (per ICH S7A guidelines):
          - Central Nervous System Assessment:
            * Behavioral and neurological evaluations (modified Irwin screen)
            * Motor activity and coordination tests
            * Body temperature monitoring
            * Specific CNS receptor binding if indicated
          - Cardiovascular System Assessment:
            * In vitro hERG channel assay with IC50 determination
            * In vivo cardiovascular telemetry studies
            * Blood pressure, heart rate, and ECG parameters
            * Additional ion channel panels if indicated (Nav1.5, Cav1.2)
          - Respiratory System Assessment:
            * Respiratory rate, tidal volume, minute volume
            * Arterial blood gas analysis
            * Pulmonary function testing if indicated
          
          Include detailed methodology, statistical analysis, NOAEL determination, and safety margins.
          Format as HTML with comprehensive tables and regulatory-compliant structure following FDA/ICH guidelines.`,
        },
        {
          name: '4. Pharmacokinetics/ADME',
          prompt: `Create a comprehensive Pharmacokinetics/ADME section (Section 4) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should follow ICH M3(R2) guidelines and include detailed subsections:
          
          4.1 Analytical Methods and Validation:
          - Bioanalytical method development and validation per FDA guidance
          - LC-MS/MS method specifications with LLOQ, accuracy, precision
          - Cross-validation between species and matrices
          - Metabolite identification and quantification methods
          - Stability studies of analytes in biological matrices
          
          4.2 Absorption Studies:
          - Absolute bioavailability studies in multiple species
          - Dose proportionality assessment across therapeutic range
          - Food effect studies (if oral administration)
          - Formulation impact on absorption
          - Regional absorption studies (if applicable)
          - First-pass metabolism assessment
          
          4.3 Distribution Studies:
          - Plasma protein binding across species (including human plasma)
          - Blood-to-plasma partitioning ratios
          - Tissue distribution studies with quantitative whole-body autoradiography
          - Blood-brain barrier penetration studies
          - Placental transfer studies
          - Mammary transfer studies (if applicable)
          - Volume of distribution calculations and species scaling
          
          4.4 Metabolism Studies:
          - Complete metabolic pathway elucidation
          - Major metabolite identification and quantification (>10% of dose)
          - Species comparison of metabolic pathways
          - Human hepatocyte and liver microsome studies
          - CYP450 enzyme identification and contribution
          - Phase II metabolism assessment (glucuronidation, sulfation, etc.)
          - Metabolite safety assessment and qualification
          
          4.5 Excretion Studies:
          - Mass balance studies with radiolabeled compound
          - Routes and rates of elimination
          - Renal clearance mechanisms (glomerular filtration, active secretion)
          - Biliary excretion assessment
          - Enterohepatic circulation evaluation
          - Fecal excretion characterization
          
          4.6 Drug Interaction Studies:
          - CYP450 induction potential (mRNA, enzyme activity, clinical markers)
          - CYP450 inhibition assessment across major isoforms
          - Transporter interaction studies (P-gp, BCRP, OATPs, etc.)
          - Time-dependent inhibition assessment
          - Clinical drug interaction risk assessment
          
          4.7 Toxicokinetics:
          - Systemic exposure data from all toxicology studies
          - Dose proportionality and linearity assessment
          - Gender differences in exposure
          - Age-related differences (if juvenile studies conducted)
          - Accumulation ratios and steady-state achievement
          - Exposure-response relationships for toxicological endpoints
          - Human equivalent dose calculations
          - Safety margin calculations based on AUC comparisons
          
          Include comprehensive PK parameter tables (Cmax, Tmax, AUC, t½, CL, Vd, F) for all species and detailed statistical analysis.
          Format as HTML with professional tables and regulatory structure following FDA/ICH guidelines.`,
        },
        {
          name: '5.1 Single-Dose Toxicity Studies',
          prompt: `Create a Single-Dose Toxicity Studies section (Section 5.1) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should adhere to FDA GLP regulations (21 CFR Part 58) and include:
          
          For each species tested (minimum of two mammalian species, typically rodent and non-rodent):
          - Study identification numbers and GLP compliance statement
          - Test system (species, strain, age, weight)
          - Study design (dose levels, route of administration, vehicle)
          - Observation period and parameters monitored
          - Mortality and clinical signs
          - Body weight and food consumption effects
          - Gross pathology findings
          - Maximum tolerated dose (MTD) or maximum feasible dose (MFD)
          - NOAEL determination
          - Gender differences in response
          
          Present data in tabular format with key findings summarized clearly.
          Format as HTML with appropriate headings and structure following FDA/ICH guidelines.`,
        },
        {
          name: '5.2 Repeat-Dose Toxicity Studies',
          prompt: `Create a Repeat-Dose Toxicity Studies section (Section 5.2) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should adhere to FDA GLP regulations (21 CFR Part 58) and ICH M3(R2) guidelines.
          
          For each pivotal study (typically 28-day and 90-day studies in rodent and non-rodent species):
          - Study identification numbers and GLP compliance statement
          - Test system (species, strain, age, weight, group sizes)
          - Study design (dose levels, route, duration, recovery period)
          - Justification for dose selection
          - Observations and measurements (clinical signs, body weights, food consumption)
          - Clinical pathology (hematology, clinical chemistry, urinalysis)
          - Toxicokinetics summary (reference section 4.7)
          - Gross pathology findings
          - Organ weights (absolute and relative)
          - Histopathology findings with severity grading
          - NOAEL determination for each study
          - Target organs of toxicity
          - Reversibility of findings
          
          Include exposure margins compared to the proposed clinical dose.
          Format as HTML with appropriate headings and structure following FDA/ICH guidelines.`,
        },
        {
          name: '5.3 Genotoxicity Studies',
          prompt: `Create a Genotoxicity Studies section (Section 5.3) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should follow ICH S2(R1) guidance and include results from the standard battery of tests:
          
          5.3.1 In Vitro Tests:
          - Bacterial reverse mutation assay (Ames test)
            - Test strains, metabolic activation systems
            - Dose levels tested and justification
            - Positive and negative controls
            - Results and interpretation
          
          - Mammalian cell cytogenetic test OR in vitro micronucleus test
            - Cell line used, treatment conditions
            - Dose levels and justification
            - Controls and validation criteria
            - Results with statistical analysis
          
          5.3.2 In Vivo Tests:
          - In vivo micronucleus test OR in vivo chromosomal aberration test
            - Species, strain, group sizes
            - Dose levels and justification
            - Administration route and schedule
            - Tissue sampling and analysis methods
            - Evidence of target tissue exposure
            - Results with statistical analysis
          
          5.3.3 Additional Genotoxicity Tests (if conducted):
          - Description of any additional studies
          - Justification for their inclusion
          - Results and interpretation
          
          5.3.4 Overall Genotoxicity Assessment:
          - Integrated evaluation of all findings
          - Weight-of-evidence conclusion on genotoxic potential
          
          Format as HTML with appropriate headings and structure following FDA/ICH guidelines.`,
        },
        {
          name: '5.4 Carcinogenicity Studies',
          prompt: `Create a Carcinogenicity Studies section (Section 5.4) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
    
          This section should follow ICH S1A/S1B guidelines and include:
    
          5.4.1 Carcinogenicity Study Requirements:
          - Justification for conduct or waiver of carcinogenicity studies
          - Study design rationale based on intended clinical use
          - Species selection and scientific justification
    
          5.4.2 Study Results (if conducted):
          - Study identification numbers and GLP compliance statement
          - Test system details (species, strain, group sizes)
          - Study design (dose levels, duration, interim sacrifices)
          - Survival and mortality data
          - Tumor incidence and statistical analysis
          - Histopathological findings
          - Dose-response relationships
    
          5.4.3 Carcinogenicity Risk Assessment:
          - Human relevance of findings
          - Mechanism of carcinogenicity (if applicable)
          - Risk characterization for clinical use
    
          If studies are not conducted, provide scientific justification per ICH S1A.
          Format as HTML with appropriate headings and structure following FDA/ICH guidelines.`,
        },
        {
          name: '5.5 Reproductive and Developmental Toxicity',
          prompt: `Create a Reproductive and Developmental Toxicity section (Section 5.5) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should follow ICH S5(R3) guidelines and include:
          
          5.5.1 Fertility and Early Embryonic Development (FEED):
          - Study design and species selection
          - Dosing period relative to mating and fertilization
          - Parameters evaluated (estrous cycling, mating behavior, fertility indices)
          - Effects on male reproductive organs and sperm parameters
          - Dose-response relationships and NOAEL for fertility
          
          5.5.2 Embryo-Fetal Development (EFD):
          - Studies in two species (typically rat and rabbit)
          - Dosing period covering major organogenesis
          - Maternal toxicity observations
          - Embryo-fetal survival data
          - External, visceral, and skeletal examinations
          - Malformations, variations, and developmental delays
          - Historical control data comparisons
          - NOAEL for maternal toxicity and developmental toxicity
          
          5.5.3 Pre- and Postnatal Development (PPND):
          - Study design and dosing period
          - Effects on parturition and lactation
          - F1 generation evaluations (survival, growth, development, behavior, reproduction)
          - NOAEL for maternal toxicity and F1 development
          
          5.5.4 Overall Reproductive Risk Assessment:
          - Integration of findings across studies
          - Exposure margins at NOAEL compared to clinical dose
          - Relevance to human risk and proposed risk mitigation
          
          Format as HTML with appropriate headings and structure following FDA/ICH guidelines.`,
        },
        {
          name: '6. Local Tolerance',
          prompt: `Create a Local Tolerance section (Section 6) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
    
          This section should address local tolerance at the site of administration:
    
          6.1 Study Design and Rationale:
          - Justification for route of administration
          - Species selection and rationale
          - Study design and methodology
    
          6.2 Local Tolerance Findings:
          - Injection site reactions (if parenteral)
          - Dermal irritation studies (if topical)
          - Ocular irritation studies (if ophthalmic)
          - Respiratory irritation studies (if inhaled)
    
          6.3 Histopathological Evaluation:
          - Microscopic examination of administration sites
          - Grading of inflammatory responses
          - Reversibility of local effects
    
          6.4 Clinical Relevance:
          - Correlation with proposed clinical route
          - Risk assessment for human administration
          - Recommended monitoring parameters
    
          Format as HTML with appropriate headings and structure following FDA/ICH guidelines.`,
        },
        {
          name: '7. Other Toxicity Studies',
          prompt: `Create an Other Toxicity Studies section (Section 7) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
    
          This section should include additional specialized toxicity studies:
    
          7.1 Immunotoxicity Studies:
          - Assessment of effects on immune system function
          - Study design and endpoints evaluated
          - Results and clinical implications
    
          7.2 Phototoxicity/Photoallergy Studies (if applicable):
          - Studies conducted based on structural alerts
          - In vitro and in vivo phototoxicity assessments
          - Clinical recommendations for sun exposure
    
          7.3 Dependence/Abuse Liability Studies (if applicable):
          - Assessment based on pharmacological class
          - Behavioral studies in relevant animal models
          - Schedule classification recommendations
    
          7.4 Juvenile Toxicity Studies (if applicable):
          - Studies in juvenile animals when pediatric use intended
          - Age-specific toxicities and developmental considerations
          - Pediatric safety implications
    
          7.5 Other Special Studies:
          - Any additional studies based on specific safety concerns
          - Mechanism-based toxicity investigations
          - Follow-up studies addressing specific findings
    
          Format as HTML with appropriate headings and structure following FDA/ICH guidelines.`,
        },
        {
          name: '8. Integrated Safety Assessment',
          prompt: `Create an Integrated Safety Assessment section (Section 8) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should provide a comprehensive analysis of all nonclinical findings:
          
          8.1 Summary of Key Toxicities:
          - Target organs of toxicity across studies
          - Dose- and duration-dependent effects
          - Species differences and human relevance
          - Reversibility of findings
          
          8.2 Safety Margins:
          - Tabulation of NOAELs across studies
          - Calculation of safety margins based on:
            - Human equivalent doses (HED)
            - Body surface area (BSA) corrections
            - Comparative exposure data (AUC ratios)
          - Justification for the proposed clinical starting dose
          
          8.3 Risk Assessment for Clinical Trials:
          - Anticipated adverse effects based on mechanism
          - Monitoring recommendations for clinical trials
          - Parameters requiring special attention
          - Potential risk mitigation strategies
          
          8.4 Outstanding Issues:
          - Identified data gaps
          - Ongoing or planned additional studies
          - Special populations considerations (pediatric, geriatric, pregnancy)
          
          8.5 Conclusions:
          - Overall benefit-risk assessment
          - Scientific justification for proceeding to clinical trials
          - Statement on GLP compliance for pivotal studies
          
          Format as HTML with appropriate headings and structure following FDA/ICH guidelines.`,
        },
        {
          name: '9. References',
          prompt: `Create a References section (Section 9) for a Pre-Clinical GLP Module following FDA format requirements for ${
            title || 'a drug development program'
          }.
          
          This section should include:
          
          9.1 Study Reports:
          - List of all nonclinical study reports referenced in the document
          - Organized by study type (pharmacology, PK/ADME, toxicology)
          - Include study numbers, titles, testing facilities, and dates
          
          9.2 Published Literature:
          - Citations for all published literature referenced
          - Format according to current scientific standards (e.g., AMA style)
          
          9.3 Regulatory Guidances:
          - Citations for FDA/ICH guidelines referenced
            - ICH M3(R2): Nonclinical Safety Studies
            - ICH S7A/B: Safety Pharmacology
            - ICH S2(R1): Genotoxicity Testing
            - ICH S5(R3): Reproductive Toxicology
            - Other relevant FDA/ICH guidelines
          
          Format as HTML with appropriate structure following FDA/ICH citation guidelines.`,
        },
      ];

      // Process sections one by one and update UI after each
      let allGeneratedContent = '<h1>' + title + '</h1>';

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        // Update progress
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

          // Generate this section
          const sectionContent = await generateGLPResponse(enhancedPrompt);

          // Clean up the response
          const cleanedContent = sectionContent
            .replace(/^```html\s*/g, '')
            .replace(/```$/g, '');

          // Add to combined content
          allGeneratedContent += cleanedContent + '\n\n';

          // Update the in-progress document to show the current state
          setInProgressDocument({
            title: title,
            description: description,
            content: allGeneratedContent.trim(),
          });
        } catch (error) {
          console.error(`Error generating section "${section.name}":`, error);

          // Add error placeholder to combined content
          const errorContent = `<h2>${section.name}</h2><p>Error generating content. Please try again later.</p>`;
          allGeneratedContent += errorContent + '\n\n';

          // Update the in-progress document
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

      // Save the complete GLP module
      const newPlan = await createGLP(plan.id, {
        title,
        description,
      });

      // Update with generated content
      const finalPlan = await updateGLP(plan.id, {
        ...newPlan.GLPModule,
        content: allGeneratedContent.trim(),
      });

      console.log('New GLP Module created:', finalPlan);
      setPlan(finalPlan);

      // Reset states
      setIsCreating(false);
      setGenerationProgress({
        active: false,
        currentSection: '',
        completedSections: 0,
        totalSections: 10,
      });
      setInProgressDocument({
        title: '',
        description: '',
        content: '',
      });
    } catch (error) {
      console.error('Error creating GLP Module:', error);
      setIsCreating(false);
      setGenerationProgress({
        active: false,
        currentSection: '',
        completedSections: 0,
        totalSections: 10,
      });
    }
  };

  // Render when no GLP module exists yet
  if (!plan.GLPModule) {
    return (
      <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 w-full'>
        <h2 className='text-2xl font-bold mb-4 text-gray-800'>
          Pre-Clinical GLP Module
        </h2>

        {!isCreating ? (
          <div>
            <p className='text-gray-600 mb-4'>
              Pre-Clinical GLP Module hasn't been created yet.
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
              Create Pre-Clinical GLP Module
            </button>
          </div>
        ) : (
          // Show generation progress and current document
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
          onClose={() => {
            setDialogOpen(false);
          }}
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
          AI is analyzing your study plan to provide suggestions...
        </div>
      )}

      {isApplyingSuggestion ? (
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div className='flex flex-col items-center justify-center py-8'>
            <Loader />
            <p className='mt-4 text-gray-600 text-center'>
              Applying suggestion to the module...
            </p>
          </div>
        </div>
      ) : (
        <Details data={plan.GLPModule} onChange={handleSaveEdit} />
      )}

      {/* Comments Section */}
      <div className='mt-8'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
          Suggestions & Comments
        </h2>
        <CommentSection
          planId={plan.GLPModule.id}
          onApplySuggestion={handleApplySuggestion}
          isApplyingSuggestion={isApplyingSuggestion}
          validationCompleted={validationCompleted}
        />
      </div>
    </div>
  );
};

export default GLPModule;
