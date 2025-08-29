// services/itrService.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

const API_KEY = Constants?.expoConfig?.extra?.apiKey || process.env.API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key missing for ITR service");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// Tax Slab for AY 2025-26 (FY 2024-25)
const TAX_SLABS_OLD = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 0.05 },
  { min: 500000, max: 1000000, rate: 0.20 },
  { min: 1000000, max: Infinity, rate: 0.30 }
];

const TAX_SLABS_NEW = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 600000, rate: 0.05 },
  { min: 600000, max: 900000, rate: 0.10 },
  { min: 900000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.20 },
  { min: 1500000, max: Infinity, rate: 0.30 }
];

// Calculate tax liability
export function calculateTaxLiability(taxableIncome, regime = 'old') {
  const slabs = regime === 'new' ? TAX_SLABS_NEW : TAX_SLABS_OLD;
  let tax = 0;

  for (const slab of slabs) {
    if (taxableIncome > slab.min) {
      const taxableAtThisSlab = Math.min(taxableIncome, slab.max) - slab.min;
      tax += taxableAtThisSlab * slab.rate;
    }
  }

  // Add 4% Health and Education Cess
  const cess = tax * 0.04;
  
  // Rebate under Section 87A (for old regime only)
  let rebate = 0;
  if (regime === 'old' && taxableIncome <= 500000) {
    rebate = Math.min(tax, 12500);
  }

  return {
    baseTax: tax,
    cess: cess,
    rebate: rebate,
    totalTax: tax + cess - rebate
  };
}

// Generate comprehensive ITR report
export async function generateITRReport(itrData) {
  try {
    console.log('📊 Generating comprehensive ITR report...');

    // Calculate income totals
    const grossIncome = Object.values(itrData.incomeDetails).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(itrData.deductions).reduce((a, b) => a + b, 0);
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    
    // Calculate tax for both regimes
    const oldRegimeTax = calculateTaxLiability(taxableIncome, 'old');
    const newRegimeTax = calculateTaxLiability(taxableIncome, 'new');
    
    // Determine optimal regime
    const optimalRegime = oldRegimeTax.totalTax <= newRegimeTax.totalTax ? 'old' : 'new';
    const selectedTax = optimalRegime === 'old' ? oldRegimeTax : newRegimeTax;
    
    // Calculate tax paid and refund/payable
    const taxPaid = Object.values(itrData.taxPayments).reduce((a, b) => a + b, 0);
    const refundDue = taxPaid > selectedTax.totalTax ? taxPaid - selectedTax.totalTax : 0;
    const taxPayable = selectedTax.totalTax > taxPaid ? selectedTax.totalTax - taxPaid : 0;

    // Generate AI recommendations
    const recommendations = await generateAIRecommendations(itrData, {
      grossIncome,
      taxableIncome,
      optimalRegime,
      taxSavings: oldRegimeTax.totalTax - newRegimeTax.totalTax
    });

    const report = {
      personalInfo: itrData.personalInfo,
      grossIncome,
      totalDeductions,
      taxableIncome,
      taxLiability: selectedTax.totalTax,
      taxPaid,
      refundDue,
      taxPayable,
      optimalRegime,
      regimeComparison: {
        oldRegime: oldRegimeTax,
        newRegime: newRegimeTax,
        savings: Math.abs(oldRegimeTax.totalTax - newRegimeTax.totalTax)
      },
      recommendations,
      generatedAt: new Date().toISOString(),
      
      // Detailed breakdown
      incomeBreakdown: itrData.incomeDetails,
      deductionBreakdown: itrData.deductions,
      taxPaymentBreakdown: itrData.taxPayments,
      
      // ITR form suggestion
      suggestedITRForm: getSuggestedITRForm(itrData),
      
      // Important dates
      dueDates: {
        originalDueDate: '2025-07-31',
        extendedDueDate: '2025-12-31',
        belatedReturnDate: '2025-12-31'
      }
    };

    console.log('✅ ITR report generated successfully');
    return report;

  } catch (error) {
    console.error('❌ ITR report generation error:', error);
    return generateFallbackITRReport(itrData);
  }
}

// Generate AI-powered recommendations
async function generateAIRecommendations(itrData, calculations) {
  try {
    const prompt = `You are EasyTax AI's ITR Filing specialist. Generate personalized recommendations for this taxpayer:

**TAXPAYER PROFILE:**
- Name: ${itrData.personalInfo.name}
- Total Income: ₹${calculations.grossIncome.toLocaleString('en-IN')}
- Taxable Income: ₹${calculations.taxableIncome.toLocaleString('en-IN')}
- Optimal Regime: ${calculations.optimalRegime}

**INCOME BREAKDOWN:**
- Salary: ₹${itrData.incomeDetails.salaryIncome.toLocaleString('en-IN')}
- House Property: ₹${itrData.incomeDetails.housePropertyIncome.toLocaleString('en-IN')}
- Business: ₹${itrData.incomeDetails.businessIncome.toLocaleString('en-IN')}
- Capital Gains: ₹${itrData.incomeDetails.capitalGains.toLocaleString('en-IN')}
- Other Sources: ₹${itrData.incomeDetails.otherSources.toLocaleString('en-IN')}

**DEDUCTIONS CLAIMED:**
- Section 80C: ₹${itrData.deductions.section80C.toLocaleString('en-IN')}
- Section 80D: ₹${itrData.deductions.section80D.toLocaleString('en-IN')}
- Section 80G: ₹${itrData.deductions.section80G.toLocaleString('en-IN')}

**PROVIDE RECOMMENDATIONS FOR:**
1. **Tax Optimization:** Ways to reduce tax liability for next FY
2. **Compliance:** Important points to remember while filing
3. **Investment Planning:** Better tax-saving instruments
4. **Next Year Planning:** Strategies for FY 2025-26

Keep recommendations practical, specific, and under 200 words.`;

    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (error) {
    console.error('AI recommendations error:', error);
    return generateFallbackRecommendations(itrData, calculations);
  }
}

// Suggest appropriate ITR form
function getSuggestedITRForm(itrData) {
  const { incomeDetails } = itrData;
  
  if (incomeDetails.businessIncome > 0) {
    return {
      form: 'ITR-3',
      reason: 'Required for business/professional income'
    };
  } else if (incomeDetails.capitalGains > 0 || incomeDetails.housePropertyIncome > 0) {
    return {
      form: 'ITR-2',
      reason: 'Required for capital gains or house property income'
    };
  } else {
    return {
      form: 'ITR-1 (Sahaj)',
      reason: 'Suitable for salary income up to ₹50 lakh'
    };
  }
}

// Fallback recommendations
function generateFallbackRecommendations(itrData, calculations) {
  const income = calculations.grossIncome;
  const regime = calculations.optimalRegime;
  
  return `**Tax Filing Recommendations for FY 2024-25:**

1. **Optimal Tax Regime:** ${regime === 'old' ? 'Old regime' : 'New regime'} is beneficial for your income profile.

2. **Tax Savings:** ${income > 1000000 ? 'Consider maximizing Section 80C limit of ₹1.5L through PPF, ELSS, or insurance.' : 'Explore tax-saving investments to reduce future liability.'}

3. **Compliance:** Ensure all TDS certificates (Form 16/16A) are included. Verify 26AS for complete tax payment details.

4. **Next Year Planning:** ${regime === 'old' ? 'Continue with traditional tax-saving investments.' : 'Focus on higher standard deduction benefits in new regime.'}

5. **Important:** File ITR before July 31, 2025, to avoid late filing penalties. Consider advance tax payments if liability exceeds ₹10,000.`;
}

// Fallback ITR report
function generateFallbackITRReport(itrData) {
  const grossIncome = Object.values(itrData.incomeDetails).reduce((a, b) => a + b, 0);
  const totalDeductions = Object.values(itrData.deductions).reduce((a, b) => a + b, 0);
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const taxCalculation = calculateTaxLiability(taxableIncome, 'old');
  const taxPaid = Object.values(itrData.taxPayments).reduce((a, b) => a + b, 0);

  return {
    grossIncome,
    totalDeductions,
    taxableIncome,
    taxLiability: taxCalculation.totalTax,
    taxPaid,
    refundDue: taxPaid > taxCalculation.totalTax ? taxPaid - taxCalculation.totalTax : 0,
    taxPayable: taxCalculation.totalTax > taxPaid ? taxCalculation.totalTax - taxPaid : 0,
    recommendations: generateFallbackRecommendations(itrData, { grossIncome, taxableIncome, optimalRegime: 'old' }),
    suggestedITRForm: getSuggestedITRForm(itrData),
    generatedAt: new Date().toISOString(),
    fallback: true
  };
}

export default {
  generateITRReport,
  calculateTaxLiability,
  getSuggestedITRForm
};
