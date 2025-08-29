import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sendOtpEmail, generateOtp } from '../services/email';

const OtpCircle = ({ show }) => (
  <Animated.View style={[styles.otpCircle, show ? { backgroundColor: '#D96F32' } : null]}/>
);

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [sentOtp, setSentOtp] = React.useState(null);
  const [isOtpSent, setIsOtpSent] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    const newOtp = generateOtp();
    setSentOtp(newOtp);
    const emailSent = await sendOtpEmail(email, newOtp);
    setIsLoading(false);
    if (emailSent) {
      setIsOtpSent(true);
      Alert.alert('OTP Sent', `An OTP has been sent to ${email}.`);
    } else {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp === sentOtp) {
      try {
        const userData = { name: 'Valued User', email: email.toLowerCase() };
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
        navigation.replace('MainApp');
      } catch (e) {
        Alert.alert('Error', 'Failed to save user data.');
      }
    } else {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  // Visual OTP digit feedback (for entered OTP length)
  const digitCircles = Array.from({ length: 6 }, (_, i) => (
    <OtpCircle key={i} show={otp.length > i} />
  ));

  return (
    <LinearGradient colors={['#F3E9DC', '#FDF6E3']} style={styles.gradientBG}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'center' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.cardContainer}>
            {/* Logo */}
            <View style={styles.logoWrapper}>
              <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.logoBG}>
                <MaterialIcons name="calculate" size={42} color="#fff" />
              </LinearGradient>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>
              {isOtpSent ? 'Enter OTP' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isOtpSent
                ? `We sent a verification code to\n${email}`
                : 'Access your tax consultation dashboard'}
            </Text>

            {/* Input */}
            {!isOtpSent ? (
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={22} color="#D96F32" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#B8860B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="dialpad" size={22} color="#D96F32" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit verification code"
                    placeholderTextColor="#B8860B"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>
                <View style={styles.otpVisualRow}>{digitCircles}</View>
              </>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.button,
                isOtpSent ? styles.buttonGradient : styles.buttonGradientAlt,
                isLoading && { opacity: 0.7 }
              ]}
              onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isOtpSent ? ['#D96F32', '#C75D2C'] : ['#F8B259', '#D96F32']}
                style={styles.buttonGradientStyle}
              >
                <Text style={styles.buttonText}>
                  {isLoading
                    ? (isOtpSent ? 'Verifying...' : 'Sending OTP...')
                    : isOtpSent ? 'Verify & Continue' : 'Send Verification Code'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {isOtpSent && (
              <TouchableOpacity onPress={() => { setIsOtpSent(false); setOtp(''); }} style={{marginTop:16}}>
                <Text style={styles.switchText}>
                  <MaterialIcons name="arrow-back-ios" size={14} color="#D96F32" />
                  <Text style={styles.switchLink}> Change Email Address</Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Footer Info */}
            <View style={styles.footerInfo}>
              <MaterialIcons name="security" size={16} color="#C75D2C" />
              <Text style={styles.footerText}>Secure tax consultation platform</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBG: {
    flex: 1
  },
  cardContainer: {
    marginHorizontal: 22,
    backgroundColor: '#ffffffee',
    borderRadius: 26,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#D96F32',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 13,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  logoWrapper: {
    marginBottom: 16,
    marginTop: 8,
  },
  logoBG: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D96F32',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#C75D2C',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B5A2B',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 0,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF6E3',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F8B259',
    shadowColor: '#D96F32',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    height: 52,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.9,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#C75D2C',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  otpVisualRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  otpCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FDF6E3',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#F8B259',
  },
  button: {
    marginTop: 20,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonGradientStyle: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  buttonGradient: {
    backgroundColor: '#D96F32',
  },
  buttonGradientAlt: {
    backgroundColor: '#F8B259',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  switchText: {
    textAlign: 'center',
    color: '#D96F32',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLink: {
    color: '#C75D2C',
    fontWeight: '700',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F8B259',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#8B5A2B',
    fontWeight: '500',
  },
});

export default LoginScreen;
