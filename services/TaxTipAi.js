// services/TaxTipAi.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

// Get API key
const API_KEY = Constants?.expoConfig?.extra?.apiKey || process.env.API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key missing for TaxTipAI service");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// Tax tip prompts by category
const TAX_TIP_PROMPTS = {
  general: `Generate 8 unique, actionable general tax saving tips for Indian taxpayers in FY 2024-25. 
  Focus on practical strategies that apply to most taxpayers. Include potential savings amounts where applicable.`,
  
  salaried: `Generate 8 specific tax saving tips for salaried employees in India for FY 2024-25. 
  Focus on HRA, LTA, allowances, employer benefits, and salary structuring strategies.`,
  
  investment: `Generate 8 investment-focused tax saving tips for FY 2024-25 in India. 
  Cover Section 80C investments, ELSS, PPF, NPS, tax-saving FDs, and other investment options.`,
  
  business: `Generate 8 tax saving tips for business owners and self-employed individuals in India for FY 2024-25. 
  Include business expenses, presumptive taxation, depreciation, and business-specific deductions.`,
  
  deductions: `Generate 8 detailed tips about various tax deductions available in India for FY 2024-25. 
  Cover Sections 80C, 80D, 80E, 80G, 24(b), and other important deduction sections.`,
};

// System instructions for tax tip generation
function getTaxTipPrompt(category) {
  const basePrompt = TAX_TIP_PROMPTS[category] || TAX_TIP_PROMPTS.general;
  
  return `You are EasyTax AI, India's leading AI tax consultant specializing in Indian taxation for FY 2024-25.

${basePrompt}

REQUIREMENTS:
- Each tip must be accurate and legal under current Indian tax laws
- Include specific section references (like Section 80C, 80D, etc.) where applicable
- Mention potential savings amounts in INR where relevant
- Tips should be actionable and practical
- Use current FY 2024-25 limits and rates

RESPONSE FORMAT (JSON only):
[
  {
    "title": "Brief tip title (max 8 words)",
    "description": "Detailed explanation (2-3 sentences)",
    "savings": "₹X,XXX - ₹Y,YYY annually", 
    "section": "Section 80C/80D/etc (if applicable)"
  }
]

Provide exactly 8 tips in this JSON format only.`;
}

// Fetch tax tips from AI
export async function fetchTaxTips(category = 'general') {
  try {
    console.log(`🤖 Generating AI tax tips for category: ${category}`);
    
    const prompt = getTaxTipPrompt(category);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('✅ AI response received, parsing JSON...');
    
    // Try to extract JSON from response
    try {
      // Look for JSON array in the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const tips = JSON.parse(jsonMatch[0]);
        
        // Validate the structure
        const validTips = tips.filter(tip => 
          tip.title && tip.description && 
          typeof tip.title === 'string' && 
          typeof tip.description === 'string'
        );
        
        console.log(`📝 Successfully parsed ${validTips.length} tax tips`);
        return validTips.length > 0 ? validTips : getFallbackTips(category);
      }
    } catch (parseError) {
      console.warn('⚠️ JSON parsing failed, using text response');
    }
    
    // Fallback: Convert text response to structured tips
    return parseTextToTips(responseText, category);
    
  } catch (error) {
    console.error('❌ Failed to fetch tax tips from AI:', error);
    return getFallbackTips(category);
  }
}

// Parse text response into structured tips
function parseTextToTips(text, category) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const tips = [];
  
  let currentTip = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip headers, numbered lists, etc.
    if (trimmedLine.match(/^\d+\.|\*\*|\#|^-/)) {
      if (currentTip && currentTip.title) {
        tips.push(currentTip);
      }
      
      currentTip = {
        title: trimmedLine.replace(/^\d+\.|\*\*|\#|^-/, '').trim().substring(0, 50),
        description: '',
        savings: null,
        section: null
      };
    } else if (currentTip && trimmedLine.length > 20) {
      currentTip.description += (currentTip.description ? ' ' : '') + trimmedLine;
      
      // Extract savings amount
      const savingsMatch = trimmedLine.match(/₹[\d,]+(?: - ₹[\d,]+)?/);
      if (savingsMatch && !currentTip.savings) {
        currentTip.savings = savingsMatch[0];
      }
      
      // Extract section reference
      const sectionMatch = trimmedLine.match(/Section \d+[A-Z]?/i);
      if (sectionMatch && !currentTip.section) {
        currentTip.section = sectionMatch[0];
      }
    }
  }
  
  // Add the last tip
  if (currentTip && currentTip.title) {
    tips.push(currentTip);
  }
  
  // Clean up descriptions and ensure we have at least some tips
  const cleanTips = tips
    .map(tip => ({
      ...tip,
      title: tip.title.substring(0, 60),
      description: tip.description.substring(0, 200) || 'Tax saving strategy for Indian taxpayers.',
    }))
    .slice(0, 8); // Limit to 8 tips
  
  return cleanTips.length > 0 ? cleanTips : getFallbackTips(category);
}

// Fallback tips when AI fails
function getFallbackTips(category) {
  const fallbackTips = {
    general: [
      {
        title: "Maximize Section 80C Investments",
        description: "Invest up to ₹1.5 lakh in PPF, ELSS, or life insurance to claim full deduction under Section 80C. This can save you ₹46,800 in taxes if you're in the 30% bracket.",
        savings: "Up to ₹46,800 annually",
        section: "Section 80C"
      },
      {
        title: "Choose Right Tax Regime",
        description: "Compare old vs new tax regime based on your deductions. If you have significant investments and home loan, old regime might be better.",
        savings: "₹10,000 - ₹50,000 annually",
        section: null
      },
      {
        title: "Health Insurance Tax Benefits",
        description: "Get tax deduction up to ₹25,000 for health insurance premiums under Section 80D. Additional ₹50,000 if you pay for parents above 60.",
        savings: "₹7,500 - ₹22,500 annually",
        section: "Section 80D"
      }
    ],
    salaried: [
      {
        title: "Optimize HRA Exemption",
        description: "If you pay rent, claim HRA exemption which is the minimum of: actual HRA received, 50% of salary (40% for non-metros), or actual rent minus 10% of salary.",
        savings: "₹15,000 - ₹1,00,000 annually",
        section: "Section 10(13A)"
      },
      {
        title: "Claim Standard Deduction",
        description: "All salaried employees get automatic ₹75,000 standard deduction from salary income in the new tax regime, ₹50,000 in old regime.",
        savings: "₹15,000 - ₹22,500 annually",
        section: "Section 16"
      }
    ],
    investment: [
      {
        title: "Invest in ELSS Mutual Funds",
        description: "ELSS funds offer tax deduction under 80C with only 3-year lock-in period and potential for higher returns compared to other tax-saving investments.",
        savings: "₹46,800 + market returns",
        section: "Section 80C"
      },
      {
        title: "Additional NPS Contribution",
        description: "Contribute extra ₹50,000 to NPS over the ₹1.5 lakh limit to get additional deduction under Section 80CCD(1B).",
        savings: "₹15,000 - ₹20,000 annually",
        section: "Section 80CCD(1B)"
      }
    ],
    business: [
      {
        title: "Business Expense Deductions",
        description: "Claim all legitimate business expenses including travel, office rent, equipment, and professional fees to reduce taxable business income.",
        savings: "20-40% of expenses claimed",
        section: "Section 37"
      },
      {
        title: "Presumptive Taxation Benefits",
        description: "If turnover is below ₹2 crores, opt for presumptive taxation under Section 44AD with deemed profit of 8% and no audit requirement.",
        savings: "Audit costs + simplified compliance",
        section: "Section 44AD"
      }
    ],
    deductions: [
      {
        title: "Education Loan Interest",
        description: "Claim full deduction on interest paid for education loan for higher studies with no upper limit under Section 80E.",
        savings: "Full interest amount",
        section: "Section 80E"
      },
      {
        title: "Charitable Donations",
        description: "Donate to approved charitable institutions and claim 50-100% deduction under Section 80G. Some donations qualify for 100% deduction.",
        savings: "50-100% of donation amount",
        section: "Section 80G"
      }
    ]
  };
  
  const tips = fallbackTips[category] || fallbackTips.general;
  console.log(`📱 Using fallback tips for category: ${category}`);
  return tips;
}

export default { fetchTaxTips };
