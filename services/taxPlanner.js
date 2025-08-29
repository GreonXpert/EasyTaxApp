// services/taxPlanner.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

// Get API key
const API_KEY = Constants?.expoConfig?.extra?.apiKey || process.env.API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key missing for Tax Planner service");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// Tax Planning System Instructions
function getTaxPlanningPrompt(userProfile) {
  const {
    personalDetails,
    currentInvestments,
    financialGoals,
    preferences
  } = userProfile;

  return `You are EasyTax AI's advanced Tax Planning specialist. Create a comprehensive, personalized tax plan for an Indian taxpayer.

**USER PROFILE:**
- Age: ${personalDetails.age}
- Annual Income: ₹${personalDetails.annualIncome?.toLocaleString('en-IN')}
- Current Savings: ₹${personalDetails.currentSavings?.toLocaleString('en-IN')}
- Dependents: ${personalDetails.dependents}

**CURRENT INVESTMENTS:**
- PPF: ₹${currentInvestments.ppf?.toLocaleString('en-IN')}/year
- ELSS: ₹${currentInvestments.elss?.toLocaleString('en-IN')}/year
- Insurance: ₹${currentInvestments.insurance?.toLocaleString('en-IN')}/year
- Fixed Deposits: ₹${currentInvestments.fixedDeposits?.toLocaleString('en-IN')}

**FINANCIAL GOALS:**
- Retirement Corpus: ₹${financialGoals.retirement?.toLocaleString('en-IN')}
- Child Education: ₹${financialGoals.childEducation?.toLocaleString('en-IN')}
- Home Loan: ₹${financialGoals.homeLoan?.toLocaleString('en-IN')}

**PREFERENCES:**
- Risk Appetite: ${preferences.riskAppetite}
- Tax Regime: ${preferences.taxRegime}
- Time Horizon: ${preferences.timeHorizon}

**PROVIDE A COMPREHENSIVE TAX PLAN INCLUDING:**

1. **Tax Analysis:** Current tax liability under chosen regime
2. **Investment Recommendations:** Specific amounts for each instrument
3. **Tax Savings:** Estimated annual tax savings
4. **Portfolio Optimization:** Risk-adjusted allocation
5. **Goal-Based Planning:** Strategies for each financial goal
6. **Timeline:** Phased investment approach

**FOCUS ON:**
- Section 80C, 80D, 80E investments
- ELSS vs PPF vs NSC optimization
- Emergency fund recommendations
- Insurance adequacy analysis
- Retirement planning strategies
- Tax-efficient withdrawal strategies

**RETURN AS JSON:**
{
  "recommendations": "Detailed analysis and recommendations (max 300 words)",
  "investmentSuggestions": [
    {
      "instrument": "PPF",
      "amount": 150000,
      "reason": "Explanation for this allocation"
    }
  ],
  "taxSavings": 45000,
  "portfolioAllocation": {
    "equity": 60,
    "debt": 30,
    "gold": 10
  },
  "actionPlan": [
    "Immediate action items"
  ]
}

Consider FY 2024-25 tax rates and limits. Be specific with amounts and rationale.`;
}

// Generate comprehensive tax plan
export async function generateTaxPlan(userProfile) {
  try {
    console.log('🎯 Generating AI Tax Plan for user profile:', userProfile.personalDetails);
    
    const prompt = getTaxPlanningPrompt(userProfile);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('✅ Tax Plan generated successfully');
    
    // Try to parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const planData = JSON.parse(jsonMatch[0]);
        
        // Validate and enhance the response
        return {
          recommendations: planData.recommendations || 'Custom tax plan generated successfully.',
          investmentSuggestions: planData.investmentSuggestions || [],
          taxSavings: planData.taxSavings || 0,
          portfolioAllocation: planData.portfolioAllocation || {},
          actionPlan: planData.actionPlan || [],
          generatedAt: new Date().toISOString(),
          userProfile: userProfile
        };
      }
    } catch (parseError) {
      console.log('📝 Using text response instead of JSON');
    }
    
    // Fallback: Create structured response from text
    return createStructuredResponse(responseText, userProfile);
    
  } catch (error) {
    console.error('❌ Tax Planning generation error:', error);
    
    // Provide fallback recommendations
    return generateFallbackPlan(userProfile);
  }
}

// Create structured response from text
function createStructuredResponse(responseText, userProfile) {
  const income = userProfile.personalDetails.annualIncome;
  const age = userProfile.personalDetails.age;
  const riskProfile = userProfile.preferences.riskAppetite;
  
  // Calculate basic recommendations
  const recommendedPPF = Math.min(150000, income * 0.12);
  const recommendedELSS = Math.min(150000, income * 0.10);
  const recommendedInsurance = Math.min(25000, income * 0.03);
  
  const estimatedSavings = (recommendedPPF + recommendedELSS + recommendedInsurance) * 0.3;
  
  return {
    recommendations: responseText.substring(0, 500) + '...',
    investmentSuggestions: [
      {
        instrument: 'PPF',
        amount: recommendedPPF,
        reason: 'Long-term tax-free returns with 15-year lock-in'
      },
      {
        instrument: 'ELSS',
        amount: recommendedELSS,
        reason: 'Equity exposure with 3-year lock-in for tax savings'
      },
      {
        instrument: 'Health Insurance',
        amount: recommendedInsurance,
        reason: 'Section 80D benefits with health coverage'
      }
    ],
    taxSavings: estimatedSavings,
    portfolioAllocation: getRiskBasedAllocation(riskProfile),
    actionPlan: [
      'Start SIP in recommended ELSS funds',
      'Maximize PPF contribution for current FY',
      'Review and increase health insurance coverage'
    ],
    generatedAt: new Date().toISOString()
  };
}

// Get risk-based portfolio allocation
function getRiskBasedAllocation(riskProfile) {
  switch (riskProfile) {
    case 'conservative':
      return { equity: 30, debt: 60, gold: 10 };
    case 'aggressive':
      return { equity: 80, debt: 15, gold: 5 };
    default: // moderate
      return { equity: 60, debt: 30, gold: 10 };
  }
}

// Generate fallback plan when API fails
function generateFallbackPlan(userProfile) {
  const { personalDetails, preferences } = userProfile;
  const income = personalDetails.annualIncome;
  const age = personalDetails.age;
  
  const baseRecommendations = `Based on your profile (Age: ${age}, Income: ₹${income?.toLocaleString('en-IN')}), here's your personalized tax plan:

1. **Tax Optimization**: Focus on maximizing Section 80C limit of ₹1.5L annually
2. **Investment Strategy**: Balance between tax savings and wealth creation
3. **Risk Management**: Adequate insurance coverage for financial security
4. **Goal Planning**: Systematic approach to achieve your financial objectives`;

  const recommendedAmounts = {
    ppf: Math.min(150000, income * 0.12),
    elss: Math.min(150000, income * 0.08),
    insurance: Math.min(25000, income * 0.02)
  };

  return {
    recommendations: baseRecommendations,
    investmentSuggestions: [
      {
        instrument: 'PPF',
        amount: recommendedAmounts.ppf,
        reason: '15-year tax-free investment with guaranteed returns'
      },
      {
        instrument: 'ELSS Mutual Funds',
        amount: recommendedAmounts.elss,
        reason: 'Equity exposure with tax benefits and 3-year lock-in'
      },
      {
        instrument: 'Health Insurance',
        amount: recommendedAmounts.insurance,
        reason: 'Section 80D benefits up to ₹25,000 with health protection'
      }
    ],
    taxSavings: (recommendedAmounts.ppf + recommendedAmounts.elss + recommendedAmounts.insurance) * 0.3,
    portfolioAllocation: getRiskBasedAllocation(preferences.riskAppetite),
    actionPlan: [
      'Open PPF account if not existing',
      'Start monthly SIP in ELSS funds',
      'Review current insurance coverage',
      'Plan investments before March 31st'
    ],
    generatedAt: new Date().toISOString(),
    fallback: true
  };
}

export default { generateTaxPlan };
