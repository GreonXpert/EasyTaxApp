// services/email.js

// !!! IMPORTANT !!!
// Replace this with the URL you get from Vercel/Netlify after deploying
const API_ENDPOINT = 'https://easyzztaz.netlify.app/.netlify/functions/send-otp';

/**
 * Generates a random 6-digit OTP for tax verification
 */
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calls YOUR secure EasyTax backend API to send the OTP email
 * @param {string} email - The recipient's email
 * @param {string} otp - The 6-digit OTP
 * @param {string} userName - The user's name (optional)
 */
export const sendOtpEmail = async (email, otp, userName = 'Taxpayer') => {
  if (API_ENDPOINT.includes('easytaxapp')) {
    console.warn("Please update the API_ENDPOINT in services/email.js with your actual domain");
  }

  try {
    console.log('📧 Sending tax verification OTP to:', email);
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        otp, 
        userName,
        appName: 'EasyTax',
        service: 'Tax Consultation Platform'
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Tax verification OTP sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send tax OTP:', data.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Network error calling EasyTax email service:', error);
    return false;
  }
};

/**
 * Validates email format for tax registration
 * @param {string} email - The email to validate
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sends welcome email after successful tax registration
 * @param {string} email - The user's email
 * @param {string} userName - The user's name
 */
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const response = await fetch(API_ENDPOINT.replace('send-tax-otp', 'send-welcome-email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        userName,
        appName: 'EasyTax',
        service: 'Tax Consultation Platform'
      }),
    });

    const data = await response.json();
    return response.ok && data.success;
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
};
