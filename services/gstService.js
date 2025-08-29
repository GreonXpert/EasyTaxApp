// services/gstService.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

const API_KEY = Constants?.expoConfig?.extra?.apiKey || process.env.API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key missing for GST service");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// GST Rate Structure (Standard rates in India)
const GST_RATES = {
  EXEMPT: 0,
  GST_5: 0.05,
  GST_12: 0.12,
  GST_18: 0.18,
  GST_28: 0.28,
};

// Validate GSTIN format
export function validateGSTIN(gstin) {
  if (!gstin || typeof gstin !== 'string') return false;
  
  // GSTIN format: 22AAAAA0000A1Z5 (15 characters)
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (gstin.length !== 15) return false;
  if (!gstinRegex.test(gstin)) return false;
  
  return true;
}

// Calculate GST amount based on taxable value and rate
export function calculateGSTAmount(taxableValue, gstRate) {
  const gstAmount = taxableValue * gstRate;
  
  if (gstRate === GST_RATES.GST_5 || gstRate === GST_RATES.GST_12 || 
      gstRate === GST_RATES.GST_18 || gstRate === GST_RATES.GST_28) {
    // For intra-state: CGST + SGST
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    
    return {
      totalGST: gstAmount,
      cgst: cgst,
      sgst: sgst,
      igst: 0, // For intra-state transactions
    };
  }
  
  return {
    totalGST: gstAmount,
    cgst: gstAmount / 2,
    sgst: gstAmount / 2,
    igst: 0,
  };
}

// Generate comprehensive GST report
export async function generateGSTReport(gstData) {
  try {
    console.log('📊 Generating comprehensive GST report...');

    const { businessInfo, outwardSupplies, inwardSupplies, gstPayment, calculations } = gstData;
    
    // Calculate various totals
    const totalTurnover = calculations.totalTurnover;
    const outputGST = calculations.outputGST;
    const itcAvailed = calculations.inputGST;
    const netPayable = calculations.netGstPayable;
    
    // Calculate total payments made
    const totalPayments = gstPayment.cgstPayable + gstPayment.sgstPayable + 
                         gstPayment.igstPayable + gstPayment.cessPayable;
    
    // Determine compliance status
    const complianceIssues = [];
    let complianceStatus = "Compliant";
    
    if (netPayable > totalPayments) {
      complianceIssues.push("GST payment shortfall detected");
      complianceStatus = "Payment Due";
    }
    
    if (totalTurnover > 5000000 && !businessInfo.gstin.startsWith('27')) {
      // Example compliance check
      complianceIssues.push("High turnover requires additional compliance");
    }
    
    // Generate AI recommendations
    const recommendations = await generateGSTRecommendations(gstData, {
      totalTurnover,
      outputGST,
      itcAvailed,
      netPayable,
      complianceIssues,
    });

    const report = {
      businessInfo,
      period: `${businessInfo.filingMonth} ${businessInfo.filingYear}`,
      returnType: businessInfo.returnType,
      
      // Financial summary
      totalTurnover,
      outputGST,
      itcAvailed,
      netPayable,
      totalPayments,
      
      // Compliance
      complianceStatus: complianceIssues.length > 0 ? 
        `Non-Compliant: ${complianceIssues.join(', ')}` : 
        "Fully Compliant",
      
      // Breakdown
      outwardSuppliesBreakdown: outwardSupplies,
      inwardSuppliesBreakdown: inwardSupplies,
      paymentBreakdown: gstPayment,
      
      // AI recommendations
      recommendations,
      
      // Due dates
      dueDates: getDueDates(businessInfo.returnType, businessInfo.filingMonth, businessInfo.filingYear),
      
      generatedAt: new Date().toISOString(),
    };

    console.log('✅ GST report generated successfully');
    return report;

  } catch (error) {
    console.error('❌ GST report generation error:', error);
    return generateFallbackGSTReport(gstData);
  }
}

// Generate AI-powered GST recommendations
async function generateGSTRecommendations(gstData, summary) {
  try {
    const prompt = `You are EasyTax AI's GST specialist. Generate compliance recommendations for this GST return:

**BUSINESS PROFILE:**
- GSTIN: ${gstData.businessInfo.gstin}
- Business Type: ${gstData.businessInfo.businessType}
- Return Type: ${gstData.businessInfo.returnType}
- Period: ${summary.period}

**FINANCIAL SUMMARY:**
- Total Turnover: ₹${summary.totalTurnover.toLocaleString('en-IN')}
- Output GST: ₹${summary.outputGST.toLocaleString('en-IN')}
- ITC Availed: ₹${summary.itcAvailed.toLocaleString('en-IN')}
- Net GST Payable: ₹${summary.netPayable.toLocaleString('en-IN')}

**COMPLIANCE ISSUES:**
${summary.complianceIssues.length > 0 ? summary.complianceIssues.join(', ') : 'None identified'}

**PROVIDE RECOMMENDATIONS FOR:**
1. **Compliance Issues:** Address any identified problems
2. **ITC Optimization:** Ways to improve input tax credit
3. **Process Improvements:** Better GST management practices
4. **Future Planning:** Strategies for next periods

Keep recommendations practical and under 200 words.`;

    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (error) {
    console.error('AI GST recommendations error:', error);
    return generateFallbackGSTRecommendations(gstData, summary);
  }
}

// Get due dates for different GST returns
function getDueDates(returnType, month, year) {
  const dueDate = new Date();
  
  switch (returnType) {
    case 'GSTR1':
      // GSTR-1 due by 11th of following month
      dueDate.setMonth(new Date(`${month} 1, ${year}`).getMonth() + 1, 11);
      break;
    case 'GSTR3B':
      // GSTR-3B due by 20th of following month
      dueDate.setMonth(new Date(`${month} 1, ${year}`).getMonth() + 1, 20);
      break;
    case 'GSTR9':
      // GSTR-9 due by December 31st of following FY
      dueDate.setFullYear(parseInt(year) + 1, 11, 31);
      break;
    default:
      dueDate.setMonth(new Date(`${month} 1, ${year}`).getMonth() + 1, 20);
  }
  
  return {
    originalDueDate: dueDate.toISOString().split('T')[0],
    extendedDueDate: new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };
}

// Fallback GST recommendations
function generateFallbackGSTRecommendations(gstData, summary) {
  const { businessType, returnType } = gstData.businessInfo;
  const { totalTurnover, netPayable } = summary;
  
  let recommendations = `**GST Compliance Recommendations:**

1. **Return Filing:** Ensure ${returnType} is filed before due date to avoid late fees of ₹200 per day.

2. **ITC Management:** `;
  
  if (summary.itcAvailed > 0) {
    recommendations += "Maintain proper documentation for all ITC claims. Verify supplier GST compliance.";
  } else {
    recommendations += "Consider claiming eligible ITC on business purchases to reduce tax liability.";
  }
  
  recommendations += `

3. **Payment Compliance:** `;
  
  if (netPayable > 100000) {
    recommendations += "Large tax liability detected. Consider advance tax payments to avoid interest.";
  } else {
    recommendations += "Ensure timely GST payments to maintain good compliance record.";
  }
  
  recommendations += `

4. **Business Growth:** `;
  
  if (totalTurnover > 20000000) {
    recommendations += "High turnover may require quarterly GSTR-1 filing and other compliance measures.";
  } else {
    recommendations += "Monitor turnover growth for potential GST compliance changes.";
  }
  
  return recommendations;
}

// Fallback GST report
function generateFallbackGSTReport(gstData) {
  const { calculations } = gstData;
  
  return {
    totalTurnover: calculations?.totalTurnover || 0,
    outputGST: calculations?.outputGST || 0,
    itcAvailed: calculations?.inputGST || 0,
    netPayable: calculations?.netGstPayable || 0,
    complianceStatus: "Report generated in offline mode",
    recommendations: generateFallbackGSTRecommendations(gstData, {
      totalTurnover: calculations?.totalTurnover || 0,
      netPayable: calculations?.netGstPayable || 0,
      itcAvailed: calculations?.inputGST || 0,
    }),
    dueDates: getDueDates(gstData.businessInfo.returnType, gstData.businessInfo.filingMonth, gstData.businessInfo.filingYear),
    generatedAt: new Date().toISOString(),
    fallback: true,
  };
}

export default {
  generateGSTReport,
  validateGSTIN,
  calculateGSTAmount,
  getDueDates,
};
