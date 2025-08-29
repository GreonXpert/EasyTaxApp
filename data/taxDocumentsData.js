// data/taxDocumentsData.js

export const taxDocumentsData = {
  "itr_forms": [
    {
      "id": "itr1",
      "title": "ITR-1 (Sahaj)",
      "category": "Income Tax Returns",
      "description": "For individuals with salary, pension, and interest income",
      "icon": "description",
      "color": ["#D96F32", "#F8B259"],
      "applicableFor": "Resident individuals",
      "incomeLimit": "Up to ₹50 lakhs",
      "lastUpdated": "AY 2025-26",
      "details": {
        "overview": "ITR-1 is the simplest form for salaried individuals with basic income sources. It's also known as 'Sahaj' form meaning 'simple' in Hindi.",
        "whoCanFile": [
          "Resident individuals only",
          "Income from salary/pension",
          "Income from one house property",
          "Interest income from savings account, fixed deposits",
          "Total income up to ₹50 lakhs"
        ],
        "whoCannotFile": [
          "Non-resident Indians (NRIs)",
          "Income from business or profession",
          "Capital gains income",
          "Income from lottery/gambling",
          "More than one house property"
        ],
        "requiredDocuments": [
          "Form 16 from employer",
          "Interest certificates from banks",
          "House property documents (if applicable)",
          "Aadhaar card",
          "PAN card"
        ],
        "keyFeatures": [
          "Pre-filled with salary details",
          "Automatic tax calculation",
          "Easy online submission",
          "No audit requirements"
        ],
        "dueDate": "July 31, 2025",
        "penalty": "₹5,000 for late filing after due date"
      }
    },
    {
      "id": "itr2",
      "title": "ITR-2",
      "category": "Income Tax Returns",
      "description": "For individuals with capital gains and multiple income sources",
      "icon": "assessment",
      "color": ["#F8B259", "#D96F32"],
      "applicableFor": "Individuals & HUFs",
      "incomeLimit": "No limit",
      "lastUpdated": "AY 2025-26",
      "details": {
        "overview": "ITR-2 is for individuals and HUFs with diverse income sources including capital gains, multiple house properties, and foreign income.",
        "whoCanFile": [
          "Individuals and HUFs",
          "Income from capital gains",
          "More than one house property",
          "Foreign income or assets",
          "Director in a company",
          "Unlisted equity shares"
        ],
        "whoCannotFile": [
          "Income from business or profession",
          "Partnership firm partners",
          "Income from lottery/gambling"
        ],
        "requiredDocuments": [
          "Form 16 (if applicable)",
          "Capital gains statements",
          "Property sale/purchase documents",
          "Foreign asset details",
          "Investment proofs",
          "Bank statements"
        ],
        "keyFeatures": [
          "Comprehensive income reporting",
          "Capital gains computation",
          "Foreign income declaration",
          "Schedule for various income types"
        ],
        "dueDate": "July 31, 2025",
        "penalty": "₹5,000 for late filing after due date"
      }
    },
    {
      "id": "itr3",
      "title": "ITR-3",
      "category": "Income Tax Returns",
      "description": "For individuals with business or professional income",
      "icon": "business_center",
      "color": ["#10B981", "#059669"],
      "applicableFor": "Individuals with business income",
      "incomeLimit": "No limit",
      "lastUpdated": "AY 2025-26",
      "details": {
        "overview": "ITR-3 is mandatory for individuals and HUFs having income from proprietary business or profession.",
        "whoCanFile": [
          "Individual proprietors",
          "Professional practitioners",
          "Partners in partnership firms",
          "Income from business or profession"
        ],
        "whoCannotFile": [
          "Companies",
          "Partnership firms",
          "Individuals without business income"
        ],
        "requiredDocuments": [
          "Profit & Loss statement",
          "Balance sheet",
          "Books of accounts",
          "Tax audit report (if applicable)",
          "Form 16 (if salary income)",
          "Investment proofs"
        ],
        "keyFeatures": [
          "Business income computation",
          "Detailed expense reporting",
          "Depreciation schedules",
          "Tax audit compliance"
        ],
        "dueDate": "July 31, 2025 (September 30 if audit required)",
        "penalty": "₹5,000 for late filing after due date"
      }
    }
  ],
  "tax_certificates": [
    {
      "id": "form16",
      "title": "Form 16",
      "category": "Tax Certificates",
      "description": "TDS certificate for salary income",
      "icon": "receipt_long",
      "color": ["#8B5CF6", "#7C3AED"],
      "applicableFor": "Salaried employees",
      "incomeLimit": "All income levels",
      "lastUpdated": "FY 2024-25",
      "details": {
        "overview": "Form 16 is a TDS certificate issued by employers showing salary paid and tax deducted during the financial year.",
        "purpose": [
          "Proof of salary income",
          "TDS deducted by employer",
          "Required for ITR filing",
          "Tax planning reference"
        ],
        "parts": [
          "Part A: Employee and employer details, TDS summary",
          "Part B: Detailed salary breakup, exemptions, deductions"
        ],
        "importantSections": [
          "Gross salary breakdown",
          "Exemptions claimed (HRA, LTA, etc.)",
          "Deductions under Chapter VI-A",
          "Tax deducted month-wise",
          "Quarterly TDS details"
        ],
        "whenIssued": "Before May 31st of assessment year",
        "validity": "Valid for the specific financial year",
        "commonIssues": [
          "Delayed issuance by employer",
          "Incorrect salary breakup",
          "Missing exemption details",
          "TDS mismatch with 26AS"
        ]
      }
    },
    {
      "id": "form16a",
      "title": "Form 16A",
      "category": "Tax Certificates",
      "description": "TDS certificate for non-salary payments",
      "icon": "assignment",
      "color": ["#EF4444", "#DC2626"],
      "applicableFor": "All taxpayers",
      "incomeLimit": "Above threshold limits",
      "lastUpdated": "FY 2024-25",
      "details": {
        "overview": "Form 16A is issued for TDS deducted on payments other than salary, such as interest, rent, professional fees, etc.",
        "commonSources": [
          "Bank interest (Section 194A)",
          "Professional fees (Section 194J)",
          "Rent payments (Section 194I)",
          "Contractor payments (Section 194C)",
          "Commission payments (Section 194H)"
        ],
        "requiredFields": [
          "TAN of deductor",
          "PAN of deductee",
          "Amount paid/credited",
          "Tax deducted",
          "Date of deduction"
        ],
        "verification": [
          "Check against Form 26AS",
          "Verify TAN details",
          "Cross-check payment amounts",
          "Confirm deduction rates"
        ],
        "importance": "Essential for claiming TDS credit in ITR filing"
      }
    }
  ],
  "investment_documents": [
    {
      "id": "80c_investments",
      "title": "Section 80C Investments",
      "category": "Investment Documents",
      "description": "Tax-saving investments up to ₹1.5 lakhs",
      "icon": "savings",
      "color": ["#06B6D4", "#0891B2"],
      "applicableFor": "All taxpayers",
      "incomeLimit": "No limit",
      "lastUpdated": "FY 2024-25",
      "details": {
        "overview": "Section 80C allows deduction up to ₹1.5 lakh for specified investments and expenses.",
        "eligibleInvestments": [
          {
            "name": "Public Provident Fund (PPF)",
            "limit": "₹1.5 lakh per year",
            "lockIn": "15 years",
            "returns": "Tax-free"
          },
          {
            "name": "Equity Linked Savings Scheme (ELSS)",
            "limit": "No limit (80C benefit up to ₹1.5L)",
            "lockIn": "3 years",
            "returns": "Market-linked"
          },
          {
            "name": "Life Insurance Premium",
            "limit": "10% of sum assured or ₹1.5L",
            "lockIn": "Policy term",
            "returns": "Guaranteed/market-linked"
          },
          {
            "name": "National Savings Certificate (NSC)",
            "limit": "No limit (80C benefit up to ₹1.5L)",
            "lockIn": "5 years",
            "returns": "Fixed interest"
          }
        ],
        "requiredDocuments": [
          "Investment receipts",
          "Annual statements",
          "Interest certificates",
          "Insurance premium receipts"
        ],
        "tips": [
          "Plan investments before March 31",
          "Diversify across different instruments",
          "Consider lock-in periods",
          "Keep all investment proofs"
        ]
      }
    }
  ],
  "compliance_documents": [
    {
      "id": "advance_tax",
      "title": "Advance Tax",
      "category": "Tax Compliance",
      "description": "Quarterly tax payment for current year",
      "icon": "schedule_send",
      "color": ["#F59E0B", "#D97706"],
      "applicableFor": "High income earners",
      "incomeLimit": "Tax liability > ₹10,000",
      "lastUpdated": "FY 2024-25",
      "details": {
        "overview": "Advance tax is pay-as-you-earn system where taxpayers pay estimated tax in quarterly installments.",
        "dueDates": [
          {
            "installment": "1st Installment",
            "date": "June 15, 2024",
            "percentage": "15% of total tax"
          },
          {
            "installment": "2nd Installment", 
            "date": "September 15, 2024",
            "percentage": "45% of total tax"
          },
          {
            "installment": "3rd Installment",
            "date": "December 15, 2024", 
            "percentage": "75% of total tax"
          },
          {
            "installment": "4th Installment",
            "date": "March 15, 2025",
            "percentage": "100% of total tax"
          }
        ],
        "exemptions": [
          "Senior citizens (60+ years) without business income",
          "Tax liability less than ₹10,000"
        ],
        "interestRates": [
          "Late payment: 1% per month",
          "Short payment: 1% per month", 
          "Excess payment: No interest paid"
        ],
        "calculationSteps": [
          "Estimate total income for the year",
          "Calculate tax liability",
          "Reduce TDS and other tax payments",
          "Pay balance as advance tax"
        ]
      }
    }
  ]
};
