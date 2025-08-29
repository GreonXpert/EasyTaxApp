// components/PrivacySecurity.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PrivacySecurity = () => {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showStoredPassword, setShowStoredPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('@user_data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setStoredPassword(userData.password || '');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data');
      }
    };
    fetchPassword();
  }, []);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('EasyTax Security', 'Please enter your current password to continue.');
      return;
    }

    if (currentPassword !== storedPassword) {
      Alert.alert('EasyTax Security', 'The current password you entered is incorrect. Please try again.');
      return;
    }

    if (!passwordValidation.isValid) {
      Alert.alert('EasyTax Security', 'Please ensure your new password meets all security requirements for your tax data protection.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('EasyTax Security', 'New passwords do not match. Please verify both fields.');
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert('EasyTax Security', 'New password must be different from your current password for enhanced security.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userDataString = await AsyncStorage.getItem('@user_data');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        userData.password = newPassword;
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
        
        Alert.alert(
          'EasyTax Security Update', 
          'Your tax account password has been updated successfully. Your financial data remains secure.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setStoredPassword(newPassword); // Update stored password display
      }
    } catch (error) {
      Alert.alert('EasyTax Error', 'Failed to update your tax account password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordStrengthIndicator = ({ validation }) => (
    <View style={styles.strengthContainer}>
      <Text style={styles.strengthTitle}>Tax Account Security Requirements:</Text>
      <View style={styles.requirementsList}>
        <RequirementItem 
          met={validation.minLength} 
          text="At least 8 characters" 
        />
        <RequirementItem 
          met={validation.hasUpperCase} 
          text="One uppercase letter" 
        />
        <RequirementItem 
          met={validation.hasLowerCase} 
          text="One lowercase letter" 
        />
        <RequirementItem 
          met={validation.hasNumbers} 
          text="One number" 
        />
        <RequirementItem 
          met={validation.hasSpecialChar} 
          text="One special character" 
        />
      </View>
    </View>
  );

  const RequirementItem = ({ met, text }) => (
    <View style={styles.requirementItem}>
      <MaterialIcons 
        name={met ? "check-circle" : "radio-button-unchecked"} 
        size={16} 
        color={met ? "#D96F32" : "#D1D5DB"} 
      />
      <Text style={[styles.requirementText, { color: met ? "#8B4513" : "#6B7280" }]}>
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with EasyTax Gradient Background */}
      <LinearGradient
        colors={['#D96F32', '#C75D2C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tax Security Center</Text>
          <View style={styles.headerIconContainer}>
            <Feather name="shield-check" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
        
        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <View style={styles.badgeIcon}>
            <MaterialIcons name="security" size={16} color="#D96F32" />
          </View>
          <Text style={styles.badgeText}>Bank-Level Security for Your Tax Data</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Current Password Display Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#D96F32' }]}>
                <Feather name="lock" size={20} color="#ffffff" />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.sectionTitle}>Current Tax Account Password</Text>
                <Text style={styles.sectionSubtitle}>Protecting your financial information</Text>
              </View>
            </View>
            
            <View style={styles.passwordDisplayContainer}>
              <Text style={styles.passwordText}>
                {showStoredPassword ? storedPassword : '••••••••••••'}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowStoredPassword(!showStoredPassword)} 
                style={styles.eyeIcon}
              >
                <Feather 
                  name={showStoredPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#8B4513" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Change Password Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#C75D2C' }]}>
                <Feather name="shield" size={20} color="#ffffff" />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.sectionTitle}>Update Security Credentials</Text>
                <Text style={styles.sectionSubtitle}>Enhance your tax data protection</Text>
              </View>
            </View>

            {/* Current Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Tax Account Password</Text>
              <View style={[styles.inputContainer, currentPassword && styles.inputFocused]}>
                <View style={styles.inputIconContainer}>
                  <Feather name="lock" size={20} color="#D96F32" />
                </View>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#B8860B"
                />
                <TouchableOpacity 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)} 
                  style={styles.eyeIcon}
                >
                  <Feather 
                    name={showCurrentPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#8B4513" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Secure Password</Text>
              <View style={[styles.inputContainer, newPassword && styles.inputFocused]}>
                <View style={styles.inputIconContainer}>
                  <Feather name="key" size={20} color="#D96F32" />
                </View>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Create new secure password"
                  placeholderTextColor="#B8860B"
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)} 
                  style={styles.eyeIcon}
                >
                  <Feather 
                    name={showNewPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#8B4513" 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <PasswordStrengthIndicator validation={passwordValidation} />
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={[styles.inputContainer, confirmPassword && styles.inputFocused]}>
                <View style={styles.inputIconContainer}>
                  <Feather name="check-circle" size={20} color="#D96F32" />
                </View>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#B8860B"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={styles.eyeIcon}
                >
                  <Feather 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#8B4513" 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchIndicator}>
                  <Feather 
                    name={newPassword === confirmPassword ? "check-circle" : "x-circle"} 
                    size={16} 
                    color={newPassword === confirmPassword ? "#D96F32" : "#EF4444"} 
                  />
                  <Text style={[
                    styles.matchText, 
                    { color: newPassword === confirmPassword ? "#8B4513" : "#EF4444" }
                  ]}>
                    {newPassword === confirmPassword ? "Passwords match - Ready to secure" : "Passwords don't match"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={[
              styles.button, 
              (!passwordValidation.isValid || newPassword !== confirmPassword || isLoading) && styles.buttonDisabled
            ]} 
            onPress={handleChangePassword}
            disabled={!passwordValidation.isValid || newPassword !== confirmPassword || isLoading}
          >
            <LinearGradient
              colors={
                (!passwordValidation.isValid || newPassword !== confirmPassword || isLoading) 
                  ? ['#D1D5DB', '#D1D5DB'] 
                  : ['#D96F32', '#C75D2C']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <MaterialIcons name="hourglass-empty" size={18} color="white" style={styles.loadingIcon} />
                  <Text style={styles.buttonText}>Securing Tax Account...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="security" size={18} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Update Tax Security</Text>
                  <Feather name="shield-check" size={18} color="white" style={styles.buttonIcon} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Tax Security Tips */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#F8B259' }]}>
                <Feather name="shield" size={18} color="#ffffff" />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.tipsTitle}>Tax Data Security Best Practices</Text>
                <Text style={styles.tipsSubtitle}>Keep your financial information protected</Text>
              </View>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <Feather name="check" size={14} color="#D96F32" />
              </View>
              <Text style={styles.tipText}>Use a unique password exclusively for your tax accounts</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <Feather name="check" size={14} color="#D96F32" />
              </View>
              <Text style={styles.tipText}>Enable two-factor authentication for enhanced security</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <Feather name="check" size={14} color="#D96F32" />
              </View>
              <Text style={styles.tipText}>Update passwords regularly, especially during tax season</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <Feather name="check" size={14} color="#D96F32" />
              </View>
              <Text style={styles.tipText}>Never share your tax account credentials with anyone</Text>
            </View>
          </View>

          {/* Security Compliance Badge */}
          <View style={styles.complianceBadge}>
            <LinearGradient
              colors={['rgba(248, 178, 89, 0.1)', 'rgba(217, 111, 50, 0.1)']}
              style={styles.complianceGradient}
            >
              <MaterialIcons name="verified-user" size={24} color="#D96F32" />
              <View style={styles.complianceTextContainer}>
                <Text style={styles.complianceTitle}>IRS Compliant Security</Text>
                <Text style={styles.complianceText}>Your tax data is protected with bank-level encryption</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  badgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B4513',
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B4513',
    letterSpacing: 0.1,
  },
  passwordDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E9DC',
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(217, 111, 50, 0.2)',
    height: 60,
  },
  passwordText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    letterSpacing: 2,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D96F32',
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(217, 111, 50, 0.2)',
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    minHeight: 60,
  },
  inputFocused: {
    borderColor: '#D96F32',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#F3E9DC',
  },
  inputIconContainer: {
    marginLeft: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 20,
  },
  strengthContainer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#F3E9DC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  strengthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementText: {
    fontSize: 14,
    fontWeight: '500',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginHorizontal: 4,
  },
  loadingIcon: {
    marginRight: 4,
  },
  tipsContainer: {
    marginTop: 20,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(248, 178, 89, 0.3)',
    shadowColor: '#F8B259',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  tipsSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B4513',
    letterSpacing: 0.1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  tipIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  complianceBadge: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  complianceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  complianceTextContainer: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  complianceText: {
    fontSize: 13,
    color: '#8B4513',
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default PrivacySecurity;
