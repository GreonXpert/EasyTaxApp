// screens/RegisterScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateEntrance();
    startLogoAnimation();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  };

  const startLogoAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name.');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return false;
    }
    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the Terms of Service and Privacy Policy.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeAnimation();
      return;
    }

    setIsLoading(true);
    animateButton();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Simulate registration delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if user already exists
      const existingUser = await AsyncStorage.getItem('@user_data');
      if (existingUser) {
        const userData = JSON.parse(existingUser);
        if (userData.email === email.toLowerCase()) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert('Error', 'An account with this email already exists.');
          setIsLoading(false);
          return;
        }
      }

      const userData = {
        name: name.trim(),
        email: email.toLowerCase(),
        password, // Note: In a real app, you should hash the password
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Success!',
        'Your account has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.replace('MainApp')
          }
        ]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Social Registration',
      `${provider} registration would be implemented here.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5FD6A3" />
      
      <LinearGradient
        colors={['#5FD6A3', '#4DB894']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { translateX: shakeAnim }
                  ]
                }
              ]}
            >
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Animated.View 
                  style={[
                    styles.logoContainer,
                    { transform: [{ rotate: logoRotate }] }
                  ]}
                >
                  <View style={styles.logoBackground}>
                    <View style={styles.logoGradient}>
                      <Ionicons name="location" size={32} color="#FFFFFF" />
                    </View>
                  </View>
                </Animated.View>
                
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join Carbeez to start your eco journey</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {/* Full Name Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <MaterialIcons name="person" size={20} color="#5FD6A3" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <MaterialIcons name="email" size={20} color="#5FD6A3" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <MaterialIcons name="lock" size={20} color="#5FD6A3" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <MaterialIcons name="lock-outline" size={20} color="#5FD6A3" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Requirements */}
                <View style={styles.passwordRequirements}>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={password.length >= 6 ? "#5FD6A3" : "rgba(255, 255, 255, 0.6)"} 
                    />
                    <Text style={styles.requirementText}>At least 6 characters</Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={password === confirmPassword && password ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={password === confirmPassword && password ? "#5FD6A3" : "rgba(255, 255, 255, 0.6)"} 
                    />
                    <Text style={styles.requirementText}>Passwords match</Text>
                  </View>
                </View>

                {/* Terms & Conditions */}
                <TouchableOpacity 
                  style={styles.termsContainer}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                >
                  <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                    {acceptTerms && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                {/* Register Button */}
                <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                  <TouchableOpacity 
                    style={[styles.registerButton, isLoading && styles.registerButtonLoading]}
                    onPress={handleRegister}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#4B9B7A', '#388A5F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.registerButtonGradient}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <Animated.View style={styles.loadingSpinner}>
                            <Ionicons name="refresh" size={20} color="#FFFFFF" />
                          </Animated.View>
                          <Text style={styles.buttonText}>Creating Account...</Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>Create Account</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Registration */}
                <View style={styles.socialContainer}>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialRegister('Google')}
                  >
                    <Ionicons name="logo-google" size={24} color="#EA4335" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialRegister('Apple')}
                  >
                    <Ionicons name="logo-apple" size={24} color="#000000" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialRegister('Facebook')}
                  >
                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  </TouchableOpacity>
                </View>

                {/* Login Link */}
                <TouchableOpacity 
                  style={styles.loginContainer}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.switchText}>
                    Already have an account? <Text style={styles.switchLink}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(75, 155, 122, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIconContainer: {
    marginRight: 12,
    backgroundColor: 'rgba(95, 214, 163, 0.1)',
    padding: 8,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
  },
  passwordRequirements: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5FD6A3',
    borderColor: '#5FD6A3',
  },
  termsText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  linkText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  loginContainer: {
    alignItems: 'center',
  },
  switchText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  switchLink: {
    color: '#FFFFFF',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
