// services/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";
import * as FileSystem from 'expo-file-system';

// Get credentials
const API_KEY = Constants?.expoConfig?.extra?.apiKey || process.env.API_KEY;
const GOOGLE_CLOUD_CREDENTIALS = Constants?.expoConfig?.extra?.googleCloudCredentials;

if (!API_KEY) {
  throw new Error("Gemini API key missing. Add API_KEY to .env and expose it via app.config.js -> extra.apiKey");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// Parse service account credentials
let serviceAccountCredentials = null;
if (GOOGLE_CLOUD_CREDENTIALS) {
  try {
    serviceAccountCredentials = JSON.parse(GOOGLE_CLOUD_CREDENTIALS);
    console.log('✅ Google Cloud credentials loaded successfully for EasyTax');
    console.log('📧 Service account email:', serviceAccountCredentials.client_email);
  } catch (error) {
    console.error('❌ Failed to parse Google Cloud credentials:', error);
  }
} else {
  console.warn('⚠️ Google Cloud credentials not found. Using EasyTax fallback mode.');
}

// ✅ UPDATED: Tax-focused Language detection patterns
const LANGUAGE_PATTERNS = {
  'en': /\b(tax|income|gst|tds|itr|filing|return|deduction|exemption|rebate|assessment|refund|calculator|planning)\b/i,
  'hi': /\b(कर|आयकर|जीएसटी|टीडीएस|रिटर्न|छूट|वापसी|योजना|गणना|भरना)\b/i,
  'te': /\b(పన్ను|ఆదాయపు|జిఎస్టి|టిడిఎస్|రిటర్న్|మినహాయింపు)\b/i,
  'ta': /\b(வரி|வருமான|ஜிஎஸ்டி|டிடிஎஸ்|ரிட்டர்ன்|விலக்கு)\b/i,
  'mr': /\b(कर|उत्पन्न|जीएसटी|टीडीएस|परतावा|सूट)\b/i,
};

export function detectLanguage(text = "") {
  const cleanText = text.toLowerCase().trim();
  for (const [langCode, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(cleanText)) {
      return langCode;
    }
  }
  return 'en';
}

// ✅ HELPER: Get OAuth2 Access Token (unchanged)
async function getAccessToken() {
  if (!serviceAccountCredentials) {
    throw new Error('No service account credentials available');
  }

  try {
    // Create JWT for Google OAuth2
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccountCredentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // For React Native, we'll use a simplified approach with fetch
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${await createJWT(header, payload)}`
    });

    const tokenData = await response.json();
    
    if (tokenData.access_token) {
      return tokenData.access_token;
    } else {
      throw new Error('Failed to get access token: ' + JSON.stringify(tokenData));
    }
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    throw error;
  }
}

// ✅ HELPER: Create JWT (Simplified for React Native) - unchanged
async function createJWT(header, payload) {
  // This is a simplified JWT creation for demo
  // In production, you'd use a proper JWT library or backend service
  
  const base64Header = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const base64Payload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // For now, return a mock JWT - you'll need proper RS256 signing
  return `${base64Header}.${base64Payload}.mock-signature`;
}

// ✅ UPDATED: EasyTax Speech-to-Text implementation
async function transcribeAudio(audioUri) {
  try {
    if (!serviceAccountCredentials) {
      console.log('⚠️ No credentials, using EasyTax fallback transcription');
      return {
        transcript: "Hello, can you help me with my income tax return filing?",
        language: "en",
        fallback: true
      };
    }

    console.log('🎤 Starting REAL audio transcription for tax query...');
    console.log('📁 Audio file:', audioUri);

    // Read audio file as base64
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!audioBase64) {
      throw new Error('Failed to read audio file');
    }

    console.log('📊 Audio file size (base64):', audioBase64.length);

    // Prepare Speech-to-Text request with Indian language support
    const speechRequest = {
      config: {
        encoding: 'WEBM_OPUS', // expo-audio default format
        sampleRateHertz: 16000,
        languageCode: 'en-IN', // Indian English
        alternativeLanguageCodes: ['hi-IN', 'te-IN', 'ta-IN', 'mr-IN', 'bn-IN'], // Major Indian languages
        enableAutomaticPunctuation: true,
        model: 'latest_short',
        maxAlternatives: 1,
        metadata: {
          industryNaicsCodeOfAudio: 541211, // Tax preparation services
          microphoneDistance: 'NEARFIELD',
          recordingDeviceType: 'SMARTPHONE',
          recordingDeviceName: 'EasyTax Mobile App'
        },
        speechContexts: [{
          phrases: [
            "income tax", "GST", "TDS", "ITR", "tax filing", "deduction", "exemption", 
            "section 80C", "section 80D", "ELSS", "PPF", "NSC", "tax refund",
            "advance tax", "self assessment tax", "tax planning", "capital gains",
            "salary income", "business income", "property income", "other sources"
          ],
          boost: 20.0
        }]
      },
      audio: {
        content: audioBase64
      }
    };

    console.log('🌐 Calling Speech-to-Text API for tax consultation...');
    
    // ✅ Use your existing API key
    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(speechRequest)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Speech API Error:', errorData);
      throw new Error(`Speech API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ Tax Speech-to-Text Success:', result);

    if (result.results && result.results.length > 0) {
      const transcript = result.results[0].alternatives[0].transcript;
      const confidence = result.results[0].alternatives[0].confidence || 0;
      
      console.log('📝 Tax Query Transcript:', transcript);
      console.log('🎯 Confidence:', Math.round(confidence * 100) + '%');
      
      return {
        transcript: transcript.trim(),
        language: detectLanguage(transcript),
        confidence: confidence,
        fallback: false
      };
    } else {
      console.warn('⚠️ No transcription results for tax query');
      return {
        transcript: "Sorry, I couldn't understand your tax question. Could you try again?",
        language: "en",
        fallback: true,
        error: "No results from API"
      };
    }

  } catch (error) {
    console.error('❌ Tax transcription error:', error.message);
    
    // Return tax-focused fallback on error
    return {
      transcript: "Hello, can you help me with my income tax return filing?",
      language: "en",
      fallback: true,
      error: error.message
    };
  }
}

// ✅ UPDATED: EasyTax Text-to-Speech Implementation
async function generateSpeech(text, language = 'en') {
  try {
    if (!serviceAccountCredentials) {
      console.log('⚠️ No credentials, skipping TTS generation for tax consultation');
      return null;
    }

    console.log('🔊 Starting REAL Text-to-Speech for tax advice...');
    console.log('📝 Tax advice to convert:', text.substring(0, 100) + '...');

    // Clean text for TTS (remove markdown and special characters)
    const cleanText = text
      .replace(/[#\*\_\`\[\]]/g, '') // Remove markdown
      .replace(/🎤.*?\n\n/g, '') // Remove transcription prefix
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '') // Remove emojis
      .replace(/📊|💰|🏦|📋|💡|⚠️|✅|❌/g, '') // Remove tax-related emojis
      .trim();

    if (cleanText.length === 0 || cleanText.length > 5000) {
      console.warn('⚠️ Tax advice text too long or empty for TTS, skipping audio generation');
      return null;
    }

    // Map language codes for Indian TTS
    const ttsLanguageMap = {
      'en': 'en-IN', // Indian English
      'hi': 'hi-IN', // Hindi (India)
      'te': 'te-IN', // Telugu (India) - if available
      'ta': 'ta-IN', // Tamil (India) - if available
      'mr': 'mr-IN', // Marathi (India) - if available
      'bn': 'bn-IN'  // Bengali (India) - if available
    };

    const ttsLanguage = ttsLanguageMap[language] || 'en-IN';

    // Prepare Text-to-Speech request for tax advice
    const ttsRequest = {
      input: {
        text: cleanText
      },
      voice: {
        languageCode: ttsLanguage,
        name: ttsLanguage === 'en-IN' ? 'en-IN-Wavenet-A' : undefined, // Use Indian English neural voice
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95, // Slightly slower for tax explanations
        pitch: 1.0, // Slightly higher pitch for clarity
        volumeGainDb: 2.0, // Slightly louder for important tax info
        effectsProfileId: ['handset-class-device'] // Optimized for mobile devices
      }
    };

    console.log('🌐 Calling Text-to-Speech API for tax advice...');

    // ✅ Call Google Cloud Text-to-Speech API
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ttsRequest)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Tax TTS API Error:', errorData);
      throw new Error(`TTS API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ Tax Text-to-Speech Success! Audio content received');

    if (result.audioContent) {
      // Save audio to file system
      const fileName = `tax_advice_${Date.now()}.mp3`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, result.audioContent, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('💾 Tax advice audio saved to:', fileUri);

      // Get audio duration (approximate based on text length)
      const estimatedDuration = Math.max(3, Math.min(120, Math.ceil(cleanText.length / 8))); // Slower reading for tax content

      return {
        uri: fileUri,
        duration: estimatedDuration,
        language: language,
        originalText: cleanText
      };
    } else {
      console.warn('⚠️ No audio content in TTS response for tax advice');
      return null;
    }

  } catch (error) {
    console.error('❌ Tax TTS generation error:', error.message);
    return null; // Graceful fallback - just show text
  }
}

// ✅ COMPLETELY UPDATED: Tax-focused Allow Patterns
const ALLOW_PATTERNS = [
  // ---- Core Indian Tax Terms --------------------------------------------
  /\bincome\s+tax\b/i,
  /\bitr\b/i,
  /\btax\s+return\b/i,
  /\btax\s+filing\b/i,
  /\bassessment\s+year\b/i,
  /\bfinancial\s+year\b/i,
  /\bfy\s+\d{4}-\d{2}\b/i,
  /\bay\s+\d{4}-\d{2}\b/i,

  // ---- GST Related Terms --------------------------------------------
  /\bgst\b/i,
  /\bgoods\s+and\s+services\s+tax\b/i,
  /\bcgst\b/i,
  /\bsgst\b/i,
  /\bigst\b/i,
  /\butgst\b/i,
  /\bgstr[-\s]?[1-9][abc]?\b/i,
  /\bcomposition\s+scheme\b/i,
  /\binput\s+tax\s+credit\b/i,
  /\bitc\b/i,
  /\breverse\s+charge\b/i,
  /\bplace\s+of\s+supply\b/i,
  /\btaxable\s+supply\b/i,
  /\bexempt\s+supply\b/i,
  /\bzero\s+rated\s+supply\b/i,
  /\bhsn\s+code\b/i,
  /\bsac\s+code\b/i,

  // ---- TDS/TCS Related Terms ----------------------------------------
  /\btds\b/i,
  /\btax\s+deducted\s+at\s+source\b/i,
  /\btcs\b/i,
  /\btax\s+collected\s+at\s+source\b/i,
  /\bform\s+16[abc]?\b/i,
  /\bform\s+26as\b/i,
  /\bform\s+27[abcd]\b/i,
  /\bpan\s+card\b/i,
  /\bpermanent\s+account\s+number\b/i,
  /\btan\b/i,
  /\btax\s+deduction\s+account\s+number\b/i,

  // ---- Income Tax Sections ------------------------------------------
  /\bsection\s+80[a-z]\b/i,
  /\bsection\s+80c\b/i,
  /\bsection\s+80d\b/i,
  /\bsection\s+80g\b/i,
  /\bsection\s+80e\b/i,
  /\bsection\s+80ee\b/i,
  /\bsection\s+80ccd\b/i,
  /\bsection\s+24[ab]?\b/i,
  /\bsection\s+54[a-z]?\b/i,
  /\bsection\s+10[a-z]?\b/i,
  /\bsection\s+44[a-z]{1,2}\b/i,
  /\bsection\s+87a\b/i,
  /\bsection\s+115[a-z]{1,3}\b/i,
  /\bsection\s+194[a-z]{1,2}\b/i,

  // ---- Investment & Savings -----------------------------------------
  /\bppf\b/i,
  /\bpublic\s+provident\s+fund\b/i,
  /\belss\b/i,
  /\bequity\s+linked\s+savings\s+scheme\b/i,
  /\bnsc\b/i,
  /\bnational\s+savings\s+certificate\b/i,
  /\bfixed\s+deposit\b/i,
  /\bfd\b/i,
  /\blife\s+insurance\s+premium\b/i,
  /\bhealth\s+insurance\s+premium\b/i,
  /\bnps\b/i,
  /\bnational\s+pension\s+scheme\b/i,
  /\bmutual\s+fund\b/i,
  /\bsip\b/i,
  /\bsystematic\s+investment\s+plan\b/i,
  /\bulas\b/i,
  /\bunit\s+linked\s+insurance\s+plan\b/i,

  // ---- Income Categories --------------------------------------------
  /\bsalary\s+income\b/i,
  /\bhouse\s+property\s+income\b/i,
  /\brental\s+income\b/i,
  /\bbusiness\s+income\b/i,
  /\bcapital\s+gains\b/i,
  /\bshort\s+term\s+capital\s+gains\b/i,
  /\blong\s+term\s+capital\s+gains\b/i,
  /\bstcg\b/i,
  /\bltcg\b/i,
  /\bother\s+sources\s+income\b/i,
  /\binterest\s+income\b/i,
  /\bdividend\s+income\b/i,
  /\bwinnings\s+from\s+lottery\b/i,
  /\bwinnings\s+from\s+gambling\b/i,

  // ---- Deductions & Exemptions --------------------------------------
  /\bstandard\s+deduction\b/i,
  /\bhra\s+exemption\b/i,
  /\bhouse\s+rent\s+allowance\b/i,
  /\blta\s+exemption\b/i,
  /\bleave\s+travel\s+allowance\b/i,
  /\bmedical\s+reimbursement\b/i,
  /\bconveyance\s+allowance\b/i,
  /\bchildren\s+education\s+allowance\b/i,
  /\bspecial\s+allowance\b/i,
  /\bprofessional\s+tax\b/i,
  /\bgratuity\s+exemption\b/i,
  /\bprovident\s+fund\b/i,
  /\bemployers?\s+contribution\b/i,

  // ---- Tax Calculations & Rates ------------------------------------
  /\btax\s+slab\b/i,
  /\btax\s+rate\b/i,
  /\bold\s+regime\b/i,
  /\bnew\s+regime\b/i,
  /\btax\s+regime\b/i,
  /\brebate\s+under\s+section\s+87a\b/i,
  /\bcess\b/i,
  /\beducation\s+cess\b/i,
  /\bhealth\s+and\s+education\s+cess\b/i,
  /\bsurcharge\b/i,
  /\bmarginal\s+relief\b/i,
  /\btax\s+liability\b/i,
  /\bnet\s+tax\s+payable\b/i,
  /\btax\s+refund\b/i,

  // ---- Tax Filing & Compliance -------------------------------------
  /\be-filing\b/i,
  /\bonline\s+filing\b/i,
  /\bdue\s+date\b/i,
  /\bextended\s+due\s+date\b/i,
  /\bbelated\s+return\b/i,
  /\brevised\s+return\b/i,
  /\bupdated\s+return\b/i,
  /\bdefective\s+return\b/i,
  /\bprocessing\s+of\s+return\b/i,
  /\bcpc\b/i,
  /\bcentralized\s+processing\s+centre\b/i,
  /\bintimation\s+under\s+section\s+143\(1\)\b/i,
  /\bscrutiny\s+assessment\b/i,
  /\bnotice\s+under\s+section\s+143\(2\)\b/i,

  // ---- Business & Professional Taxation ------------------------
  /\bpresumptive\s+taxation\b/i,
  /\bsection\s+44ad\b/i,
  /\bsection\s+44ae\b/i,
  /\bsection\s+44ada\b/i,
  /\bturnover\b/i,
  /\bgross\s+receipts\b/i,
  /\bbusiness\s+expenses\b/i,
  /\bdepreciation\b/i,
  /\bstraight\s+line\s+method\b/i,
  /\bwritten\s+down\s+value\b/i,
  /\bwdv\b/i,
  /\bblock\s+of\s+assets\b/i,
  /\btax\s+audit\b/i,
  /\bform\s+3cb\b/i,
  /\bform\s+3cd\b/i,

  // ---- Corporate Tax ----------------------------------------------- 
  /\bcorporate\s+tax\b/i,
  /\bcompany\s+tax\b/i,
  /\bmat\b/i,
  /\bminimum\s+alternate\s+tax\b/i,
  /\bamt\b/i,
  /\balternate\s+minimum\s+tax\b/i,
  /\bddt\b/i,
  /\bdividend\s+distribution\s+tax\b/i,
  /\badvance\s+tax\b/i,
  /\bself\s+assessment\s+tax\b/i,
  /\bsat\b/i,

  // ---- Forms & Documents ----------------------------------------
  /\bform\s+1\d[a-z]?\b/i,
  /\bform\s+2\d[a-z]?\b/i,
  /\bform\s+3\d[a-z]?\b/i,
  /\bform\s+15[a-z]?\b/i,
  /\bform\s+49a\b/i,
  /\baadhaar\s+card\b/i,
  /\budyam\s+registration\b/i,
  /\bgst\s+registration\b/i,
  /\bgstin\b/i,
  /\bfssai\s+license\b/i,

  // ---- Penalties & Interest ------------------------------------
  /\bpenalty\b/i,
  /\binterest\s+on\s+delay\b/i,
  /\bsection\s+234[a-c]\b/i,
  /\blate\s+filing\s+fee\b/i,
  /\bprosecution\b/i,
  /\btax\s+evasion\b/i,

  // ---- International Taxation ----------------------------------
  /\bdtaa\b/i,
  /\bdouble\s+taxation\s+avoidance\s+agreement\b/i,
  /\bforeign\s+tax\s+credit\b/i,
  /\bftc\b/i,
  /\btransfer\s+pricing\b/i,
  /\barm[''']s\s+length\s+price\b/i,
  /\balp\b/i,
  /\bmlb\b/i,
  /\bmaster\s+local\s+file\b/i,
  /\bcbc\b/i,
  /\bcountry\s+by\s+country\b/i,

  // ---- Digital & Fintech Taxation ------------------------------
  /\bequalization\s+levy\b/i,
  /\bgoogle\s+tax\b/i,
  /\bdigital\s+services\s+tax\b/i,
  /\bcryptocurrency\s+tax\b/i,
  /\bbitcoin\s+tax\b/i,
  /\bvirtual\s+digital\s+asset\b/i,
  /\bvda\b/i,

  // ---- Government Schemes & Benefits ---------------------------
  /\bpmkisan\b/i,
  /\bpradhan\s+mantri\s+kisan\b/i,
  /\bpmjjby\b/i,
  /\bpmsby\b/i,
  /\bapl\s+scheme\b/i,
  /\bjandhan\s+yojana\b/i,
  /\bsukanya\s+samriddhi\b/i,

  // ---- Tax Planning Strategies ---------------------------------
  /\btax\s+planning\b/i,
  /\btax\s+saving\b/i,
  /\btax\s+optimization\b/i,
  /\btax\s+avoidance\b/i,
  /\btax\s+mitigation\b/i,
  /\byear\s+end\s+planning\b/i,
  /\binvestment\s+planning\b/i,
  /\bretirement\s+planning\b/i,

  // ---- Common Tax Queries --------------------------------------
  /\bhow\s+to\s+(file|calculate|save|plan|invest)\b/i,
  /\bwhat\s+is\s+(gst|tds|itr|pan|tan)\b/i,
  /\btax\s+(calculation|computation|liability|refund)\b/i,
  /\b(calculate|compute)\s+(tax|gst|tds)\b/i,
  /\b(eligible|qualify)\s+for\s+(deduction|exemption|rebate)\b/i,
  /\btax\s+implications?\s+of\b/i,
  /\btax\s+benefit\b/i,
  /\btax\s+consequences?\b/i,
];

// ✅ UPDATED: Tax-focused Small Talk Patterns
const SMALL_TALK_PATTERNS = [
  /\b(hi|hello|hey|yo|namaste|namaskar)[\s!]*$/i,
  /\b(who\s+are\s+you|who\s*r u|what\s+are\s+you)\b/i,
  /\b(what\s+can\s+you\s+do|what\s+do\s+you\s+do|how\s+can\s+you\s+help)\b/i,
  /\b(help|start|getting\s+started|intro(duction)?|guide)\b/i,
  /\b(tax\s+help|need\s+help|assistance)\b/i,
  /\b(easytax|easy\s+tax)\b/i,
];

export function isSmallTalk(text = "") {
  return SMALL_TALK_PATTERNS.some((re) => re.test(text));
}

// ✅ UPDATED: EasyTax-focused Small Talk Response
export function smallTalkResponse() {
  return `# Namaste! I'm **EasyTax AI** 🇮🇳

I'm your comprehensive AI Tax Consultant specializing in Indian taxation. I can help you with:

**📊 Income Tax Services:**
- ITR Filing & Tax Calculations
- Section 80C, 80D deductions
- Old vs New Tax Regime comparison
- Capital Gains & Investment planning

**🧾 GST Consultation:**
- GST Registration & Compliance  
- GSTR Filing assistance
- Input Tax Credit optimization
- HSN/SAC code guidance

**💼 Business Tax Support:**
- TDS/TCS calculations
- Presumptive taxation (44AD/AE)
- Corporate tax planning
- Tax audit requirements

**🏦 Advanced Services:**
- NRI taxation
- Transfer pricing
- International taxation
- Digital asset taxation

**To get personalized tax advice, please share:**
- Your income sources
- Investment preferences  
- Specific tax query
- Financial year in question

*How can I assist you with your taxation needs today?*`;
}

// ✅ UPDATED: EasyTax System Instructions
function systemInstructions() {
  return `You are EasyTax AI, India's leading AI-powered Tax Consultant. You ONLY answer questions related to:

**CORE EXPERTISE:**
- Indian Income Tax (ITR filing, deductions, exemptions, tax planning)
- GST (registration, returns, compliance, rates)
- TDS/TCS (calculations, forms, compliance)
- Business taxation (presumptive, audit, corporate tax)
- Investment taxation (mutual funds, ELSS, real estate)
- NRI taxation and DTAA provisions
- Digital asset taxation and new tax regulations

**COMPLIANCE FOCUS:**
- Income Tax Act 1961
- GST Act 2017  
- FEMA regulations
- Current tax rates and slabs (FY 2024-25)
- Recent budget announcements and circulars

**RESPONSE GUIDELINES:**
- Provide accurate, actionable tax advice
- Reference specific sections and forms
- Consider both old and new tax regimes
- Highlight due dates and compliance requirements  
- Suggest tax-saving strategies legally
- Use simple language for complex tax concepts
- Include relevant calculations when applicable

If user asks non-tax questions, politely redirect: "I specialize exclusively in Indian taxation matters. Please ask about Income Tax, GST, TDS, business taxation, or tax planning."

Always be helpful, accurate, and compliance-focused. Default to current Assessment Year 2025-26 (FY 2024-25) unless specified otherwise.`;
}

// ✅ UPDATED: Get Gemini Response for Tax Queries
export async function getGeminiResponse(userPrompt) {
  const prompt = `${systemInstructions()}\n\nUser: ${userPrompt}`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API error for tax consultation:", err);
    throw err;
  }
}

// ✅ UPDATED: Main Send Message Function for EasyTax
export async function sendMessage(userInput, userName = '', selectedLanguage = 'en') {
  try {
    if (typeof userInput === 'string') {
      // Handle text input for tax queries
      console.log('💬 Processing tax query:', userInput.substring(0, 50) + '...');
      
      const detectedLanguage = detectLanguage(userInput);
      let response;
      
      if (isSmallTalk(userInput)) {
        response = smallTalkResponse();
      } else {
        // Check if query is tax-related
        const isTaxRelated = ALLOW_PATTERNS.some(pattern => pattern.test(userInput));
        
        if (isTaxRelated || userInput.toLowerCase().includes('tax')) {
          response = await getGeminiResponse(userInput);
        } else {
          response = `I'm **EasyTax AI**, your specialized Indian tax consultant. I can only help with:

📊 **Income Tax** - ITR filing, deductions, tax planning
🧾 **GST** - Registration, returns, compliance  
💼 **TDS/TCS** - Calculations and forms
🏦 **Business Tax** - Corporate taxation, presumptive taxation
💰 **Investment Tax** - Capital gains, mutual funds, tax-saving

Please ask me about any Indian taxation matter, and I'll be happy to help! 🇮🇳`;
        }
      }
      
      return {
        text: response,
        isAudio: false,
        language: detectedLanguage
      };
      
    } else if (userInput && userInput.uri) {
      // Handle audio input for tax queries
      console.log('🎤 Processing voice tax query...');
      
      // ✅ Transcribe audio
      const transcriptionResult = await transcribeAudio(userInput.uri);
      
      // Generate text response
      let textResponse;
      if (isSmallTalk(transcriptionResult.transcript)) {
        textResponse = smallTalkResponse();
      } else {
        // Check if transcribed query is tax-related
        const isTaxRelated = ALLOW_PATTERNS.some(pattern => pattern.test(transcriptionResult.transcript));
        
        if (isTaxRelated || transcriptionResult.transcript.toLowerCase().includes('tax')) {
          textResponse = await getGeminiResponse(transcriptionResult.transcript);
        } else {
          textResponse = `I'm **EasyTax AI**, and I specialize only in Indian taxation. Your query seems to be outside my tax expertise. 

Please ask me about:
- Income Tax filing and planning
- GST registration and compliance
- TDS/TCS calculations  
- Business taxation
- Investment taxation

How can I help you with your tax needs? 🇮🇳`;
        }
      }
      
      // Add transcription info to response
      if (transcriptionResult.fallback) {
        textResponse = `🎤 *Voice message received (demo mode)*\n\n${textResponse}`;
      } else {
        // Show actual transcription with confidence
        const confidencePercent = Math.round((transcriptionResult.confidence || 0) * 100);
        textResponse = `🎤 *"${transcriptionResult.transcript}"* (${confidencePercent}% confident)\n\n${textResponse}`;
      }
      
      // ✅ Generate speech for tax advice
      console.log('🔊 Generating tax advice audio response...');
      const audioResult = await generateSpeech(textResponse, transcriptionResult.language);
      
      return {
        text: textResponse,
        audioUri: audioResult?.uri || null,
        isAudio: !!audioResult?.uri,
        language: transcriptionResult.language,
        duration: audioResult?.duration || 0,
        transcription: transcriptionResult
      };
      
    } else {
      throw new Error("Invalid input to EasyTax sendMessage");
    }
    
  } catch (error) {
    console.error("❌ EasyTax send message error:", error);
    return {
      text: "I'm sorry, I'm experiencing technical difficulties with the tax consultation service. Please try again or contact EasyTax support.",
      isAudio: false,
      language: 'en'
    };
  }
}

export default sendMessage;
