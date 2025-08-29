import React, { useState, useEffect, useRef, forwardRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateITRReport, calculateTaxLiability } from '../services/itrService';

// Wrapped InputField with React.memo and React.forwardRef to prevent unnecessary re-renders
const InputField = memo(
  forwardRef(({ label, value, onChangeText, placeholder, keyboardType = 'default', onSubmitEditing, returnKeyType }, ref) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        ref={ref}
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#8B7355"
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        blurOnSubmit={false}
      />
    </View>
  ))
);

const ITRFiling = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [itrReport, setItrReport] = useState(null);

  // ITR Form Data
  const [itrData, setItrData] = useState({
    // Personal Details
    personalInfo: {
      name: '',
      pan: '',
      aadhaar: '',
      dateOfBirth: '',
      address: '',
      mobile: '',
      email: '',
      assessmentYear: '2025-26',
      financialYear: '2024-25',
    },

    // Income Sources
    incomeDetails: {
      salaryIncome: '',
      housePropertyIncome: '',
      businessIncome: '',
      capitalGains: '',
      otherSources: '',
    },

    // Deductions
    deductions: {
      section80C: '',
      section80D: '',
      section80G: '',
      section80E: '',
      section80TTA: '',
      standardDeduction: 50000,
    },

    // Tax Payments
    taxPayments: {
      tdsDeducted: '',
      advanceTax: '',
      selfAssessmentTax: '',
    },

    // Bank Details
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    },
  });

  // Refs for managing focus between input fields
  const panRef = useRef(null);
  const aadhaarRef = useRef(null);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const salaryIncomeRef = useRef(null);
  const housePropertyIncomeRef = useRef(null);
  const businessIncomeRef = useRef(null);
  const capitalGainsRef = useRef(null);
  const otherSourcesRef = useRef(null);
  const section80CRef = useRef(null);
  const section80DRef = useRef(null);
  const section80GRef = useRef(null);
  const section80ERef = useRef(null);
  const section80TTARef = useRef(null); 
  const tdsDeductedRef = useRef(null);
  const advanceTaxRef = useRef(null);
  const selfAssessmentTaxRef = useRef(null);
  const accountNumberRef = useRef(null);
  const ifscCodeRef = useRef(null);
  const bankNameRef = useRef(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('@user_data');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setUserData(user);
        setItrData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            name: user.name || '',
            email: user.email || '',
          }
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const steps = [
    { id: 1, title: 'Personal Info', icon: 'person' },
    { id: 2, title: 'Income Details', icon: 'account-balance-wallet' },
    { id: 3, title: 'Deductions', icon: 'receipt' },
    { id: 4, title: 'Tax Payments', icon: 'payment' },
    { id: 5, title: 'Review & File', icon: 'check-circle' },
  ];

  const updateItrData = (section, field, value) => {
    setItrData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }));
  };

  const handleNext = () => {
    Keyboard.dismiss();
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    Keyboard.dismiss();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateReport = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      // ✅ FIXED: Parse string values to numbers before passing to the service
      const numericItrData = {
        ...itrData,
        incomeDetails: Object.fromEntries(
          Object.entries(itrData.incomeDetails).map(([key, value]) => [key, parseFloat(value) || 0])
        ),
        deductions: Object.fromEntries(
          Object.entries(itrData.deductions).map(([key, value]) => [key, parseFloat(value) || 0])
        ),
        taxPayments: Object.fromEntries(
          Object.entries(itrData.taxPayments).map(([key, value]) => [key, parseFloat(value) || 0])
        ),
      };
      
      const report = await generateITRReport(numericItrData);
      setItrReport(report);
      setReportModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate ITR report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveITRData = async () => {
    Keyboard.dismiss();
    try {
      await AsyncStorage.setItem('@itr_data', JSON.stringify(itrData));
      Alert.alert('Success', 'ITR data saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save ITR data.');
    }
  };

  const StepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep >= step.id && styles.stepCircleActive
          ]}>
            <MaterialIcons
              name={step.icon}
              size={16}
              color={currentStep >= step.id ? '#ffffff' : '#8B7355'}
            />
          </View>
          <Text style={[
            styles.stepText,
            currentStep >= step.id && styles.stepTextActive
          ]}>
            {step.title}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              currentStep > step.id && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <InputField
              label="Full Name *"
              value={itrData.personalInfo.name}
              onChangeText={(value) => updateItrData('personalInfo', 'name', value)}
              placeholder="Enter full name as per PAN"
              returnKeyType="next"
              onSubmitEditing={() => panRef.current?.focus()}
            />
            <InputField
              label="PAN Number *"
              value={itrData.personalInfo.pan}
              onChangeText={(value) => updateItrData('personalInfo', 'pan', value.toUpperCase())}
              placeholder="ABCDE1234F"
              returnKeyType="next"
              ref={panRef}
              onSubmitEditing={() => aadhaarRef.current?.focus()}
            />
            <InputField
              label="Aadhaar Number"
              value={itrData.personalInfo.aadhaar}
              onChangeText={(value) => updateItrData('personalInfo', 'aadhaar', value)}
              placeholder="1234 5678 9012"
              keyboardType="numeric"
              returnKeyType="next"
              ref={aadhaarRef}
              onSubmitEditing={() => mobileRef.current?.focus()}
            />
            <InputField
              label="Mobile Number *"
              value={itrData.personalInfo.mobile}
              onChangeText={(value) => updateItrData('personalInfo', 'mobile', value)}
              placeholder="9876543210"
              keyboardType="phone-pad"
              returnKeyType="next"
              ref={mobileRef}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            <InputField
              label="Email Address *"
              value={itrData.personalInfo.email}
              onChangeText={(value) => updateItrData('personalInfo', 'email', value)}
              placeholder="email@example.com"
              keyboardType="email-address"
              returnKeyType="done"
              ref={emailRef}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Income Details</Text>
            <Text style={styles.stepSubtitle}>Enter your income from various sources for FY 2024-25</Text>

            <InputField
              label="Salary Income"
              value={itrData.incomeDetails.salaryIncome}
              onChangeText={(value) => updateItrData('incomeDetails', 'salaryIncome', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={salaryIncomeRef}
              onSubmitEditing={() => housePropertyIncomeRef.current?.focus()}
            />
            <InputField
              label="House Property Income"
              value={itrData.incomeDetails.housePropertyIncome}
              onChangeText={(value) => updateItrData('incomeDetails', 'housePropertyIncome', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={housePropertyIncomeRef}
              onSubmitEditing={() => businessIncomeRef.current?.focus()}
            />
            <InputField
              label="Business/Professional Income"
              value={itrData.incomeDetails.businessIncome}
              onChangeText={(value) => updateItrData('incomeDetails', 'businessIncome', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={businessIncomeRef}
              onSubmitEditing={() => capitalGainsRef.current?.focus()}
            />
            <InputField
              label="Capital Gains"
              value={itrData.incomeDetails.capitalGains}
              onChangeText={(value) => updateItrData('incomeDetails', 'capitalGains', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={capitalGainsRef}
              onSubmitEditing={() => otherSourcesRef.current?.focus()}
            />
            <InputField
              label="Income from Other Sources"
              value={itrData.incomeDetails.otherSources}
              onChangeText={(value) => updateItrData('incomeDetails', 'otherSources', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="done"
              ref={otherSourcesRef}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Deductions & Exemptions</Text>
            
            <InputField
              label="Section 80C (PPF, ELSS, Life Insurance)"
              value={itrData.deductions.section80C}
              onChangeText={(value) => updateItrData('deductions', 'section80C', value)}
              placeholder="Max: ₹1,50,000"
              keyboardType="numeric"
              returnKeyType="next"
              ref={section80CRef}
              onSubmitEditing={() => section80DRef.current?.focus()}
            />
            <InputField
              label="Section 80D (Health Insurance)"
              value={itrData.deductions.section80D}
              onChangeText={(value) => updateItrData('deductions', 'section80D', value)}
              placeholder="Max: ₹75,000"
              keyboardType="numeric"
              returnKeyType="next"
              ref={section80DRef}
              onSubmitEditing={() => section80GRef.current?.focus()}
            />
            <InputField
              label="Section 80G (Donations)"
              value={itrData.deductions.section80G}
              onChangeText={(value) => updateItrData('deductions', 'section80G', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={section80GRef}
              onSubmitEditing={() => section80ERef.current?.focus()}
            />
            <InputField
              label="Section 80E (Education Loan Interest)"
              value={itrData.deductions.section80E}
              onChangeText={(value) => updateItrData('deductions', 'section80E', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={section80ERef}
              onSubmitEditing={() => section80TTARef.current?.focus()}
            />
             <InputField
              label="Section 80TTA (Savings Account Interest)"
              value={itrData.deductions.section80TTA}
              onChangeText={(value) => updateItrData('deductions', 'section80TTA', value)}
              placeholder="Max: ₹10,000"
              keyboardType="numeric"
              returnKeyType="done"
              ref={section80TTARef}
            />
            
            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={20} color="#F8B259" />
              <Text style={styles.infoText}>
                Standard deduction of ₹50,000 is automatically applied for salary income.
              </Text>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tax Payments</Text>
            
            <InputField
              label="TDS Deducted (Form 16/26AS)"
              value={itrData.taxPayments.tdsDeducted}
              onChangeText={(value) => updateItrData('taxPayments', 'tdsDeducted', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={tdsDeductedRef}
              onSubmitEditing={() => advanceTaxRef.current?.focus()}
            />
            <InputField
              label="Advance Tax Paid"
              value={itrData.taxPayments.advanceTax}
              onChangeText={(value) => updateItrData('taxPayments', 'advanceTax', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={advanceTaxRef}
              onSubmitEditing={() => selfAssessmentTaxRef.current?.focus()}
            />
            <InputField
              label="Self Assessment Tax"
              value={itrData.taxPayments.selfAssessmentTax}
              onChangeText={(value) => updateItrData('taxPayments', 'selfAssessmentTax', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={selfAssessmentTaxRef}
              onSubmitEditing={() => accountNumberRef.current?.focus()}
            />

            <Text style={styles.sectionHeader}>Bank Details (For Refund)</Text>
            <InputField
              label="Account Number"
              value={itrData.bankDetails.accountNumber}
              onChangeText={(value) => updateItrData('bankDetails', 'accountNumber', value)}
              placeholder="Account number"
              keyboardType="numeric"
              returnKeyType="next"
              ref={accountNumberRef}
              onSubmitEditing={() => ifscCodeRef.current?.focus()}
            />
            <InputField
              label="IFSC Code"
              value={itrData.bankDetails.ifscCode}
              onChangeText={(value) => updateItrData('bankDetails', 'ifscCode', value.toUpperCase())}
              placeholder="ABCD0123456"
              returnKeyType="next"
              ref={ifscCodeRef}
              onSubmitEditing={() => bankNameRef.current?.focus()}
            />
            <InputField
              label="Bank Name"
              value={itrData.bankDetails.bankName}
              onChangeText={(value) => updateItrData('bankDetails', 'bankName', value)}
              placeholder="Bank name"
              returnKeyType="done"
              ref={bankNameRef}
            />
          </View>
        );

      case 5:
        // Parse numbers from strings for calculation and display
        const incomeDetails = Object.fromEntries(
          Object.entries(itrData.incomeDetails).map(([key, value]) => [key, parseFloat(value) || 0])
        );
        const deductions = Object.fromEntries(
          Object.entries(itrData.deductions).map(([key, value]) => [key, parseFloat(value) || 0])
        );
        const taxPayments = Object.fromEntries(
          Object.entries(itrData.taxPayments).map(([key, value]) => [key, parseFloat(value) || 0])
        );
        
        const totalIncome = Object.values(incomeDetails).reduce((a, b) => a + b, 0);
        const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
        const totalTaxPaid = Object.values(taxPayments).reduce((a, b) => a + b, 0);

        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & File ITR</Text>
            <Text style={styles.stepSubtitle}>Please review your details before filing</Text>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Income Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Income:</Text>
                <Text style={styles.summaryValue}>
                  ₹{totalIncome.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Deductions:</Text>
                <Text style={styles.summaryValue}>
                  ₹{totalDeductions.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax Paid:</Text>
                <Text style={styles.summaryValue}>
                  ₹{totalTaxPaid.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.generateReportBtn} onPress={generateReport}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.generateReportGradient}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="assessment" size={20} color="#ffffff" />
                    <Text style={styles.generateReportText}>Generate ITR Report</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ITR Filing Assistant</Text>
          <TouchableOpacity style={styles.saveButton} onPress={saveITRData}>
            <MaterialIcons name="save" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Step {currentStep} of 5</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 5) * 100}%` }]} />
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <StepIndicator />
          {renderStepContent()}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrevious}>
            <Text style={styles.prevButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < 5 && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.nextButtonGradient}>
              <Text style={styles.nextButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* ITR Report Modal */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ITR Report</Text>
            <TouchableOpacity onPress={() => setReportModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>
          
          {itrReport && (
            <ScrollView style={styles.reportContent}>
              <View style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <MaterialCommunityIcons name="calculator-variant" size={24} color="#D96F32" />
                  <Text style={styles.reportTitle}>Tax Calculation Summary</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Gross Total Income:</Text>
                  <Text style={styles.reportValue}>₹{itrReport.grossIncome?.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Total Deductions:</Text>
                  <Text style={styles.reportValue}>₹{itrReport.totalDeductions?.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Taxable Income:</Text>
                  <Text style={styles.reportValue}>₹{itrReport.taxableIncome?.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Tax Liability:</Text>
                  <Text style={styles.reportValue}>₹{itrReport.taxLiability?.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Tax Paid:</Text>
                  <Text style={styles.reportValue}>₹{itrReport.taxPaid?.toLocaleString('en-IN')}</Text>
                </View>
                <View style={[styles.reportRow, styles.reportRowHighlight]}>
                  <Text style={styles.reportLabelHighlight}>
                    {itrReport.refundDue > 0 ? 'Refund Due:' : 'Tax Payable:'}
                  </Text>
                  <Text style={[styles.reportValueHighlight, 
                    itrReport.refundDue > 0 ? styles.refundText : styles.payableText
                  ]}>
                    ₹{Math.abs(itrReport.refundDue || itrReport.taxPayable || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <View style={styles.reportCard}>
                <Text style={styles.reportTitle}>Recommendations</Text>
                <Text style={styles.recommendationText}>{itrReport.recommendations}</Text>
              </View>

              <TouchableOpacity style={styles.fileITRButton}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.fileITRGradient}>
                  <MaterialIcons name="cloud-upload" size={20} color="#ffffff" />
                  <Text style={styles.fileITRText}>Proceed to File ITR</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  saveButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    position: 'relative',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#D96F32',
    borderColor: '#D96F32',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7355',
    textAlign: 'center',
  },
  stepTextActive: {
    color: '#D96F32',
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: -1,
  },
  stepLineActive: {
    backgroundColor: '#D96F32',
  },
  stepContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2D1810',
    backgroundColor: '#F9F9F9',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(248, 178, 89, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#8B7355',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D1810',
    marginTop: 20,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8B7355',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
  },
  generateReportBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  generateReportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  generateReportText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 111, 50, 0.1)',
  },
  prevButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D96F32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButtonText: {
    color: '#D96F32',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  reportContent: {
    flex: 1,
    padding: 20,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reportRowHighlight: {
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  reportLabel: {
    fontSize: 14,
    color: '#8B7355',
  },
  reportValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
  },
  reportLabelHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
  },
  reportValueHighlight: {
    fontSize: 16,
    fontWeight: '800',
  },
  refundText: {
    color: '#10B981',
  },
  payableText: {
    color: '#EF4444',
  },
  recommendationText: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
  },
  fileITRButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  fileITRGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  fileITRText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default ITRFiling;
