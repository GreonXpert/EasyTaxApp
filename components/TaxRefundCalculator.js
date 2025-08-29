// components/TaxRefundCalculator.js

import React, { useState, useRef, forwardRef, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// ✅ Memoized InputField Component to prevent re-renders on keystrokes
const InputField = memo(
  forwardRef(({ label, value, onChangeText, placeholder, icon, onSubmitEditing, returnKeyType, keyboardType = 'numeric' }, ref) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputHeader}>
        {icon && <MaterialIcons name={icon} size={18} color="#D96F32" />}
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#8B7355"
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
      />
    </View>
  ))
);

const TaxRefundCalculator = () => {
  const navigation = useNavigation();
  
  // Income and Tax Details
  const [totalIncome, setTotalIncome] = useState('');
  const [taxDeducted, setTaxDeducted] = useState('');
  const [advanceTaxPaid, setAdvanceTaxPaid] = useState('');
  const [selfAssessmentTax, setSelfAssessmentTax] = useState('');
  const [taxLiability, setTaxLiability] = useState('');
  
  // Assessment Details
  const [assessmentYear, setAssessmentYear] = useState('2025-26');
  const [itrType, setItrType] = useState('ITR-1');
  
  const [refundResult, setRefundResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Refs for focusing on the next input field
  const totalIncomeRef = useRef(null);
  const taxDeductedRef = useRef(null);
  const advanceTaxPaidRef = useRef(null);
  const selfAssessmentTaxRef = useRef(null);
  const taxLiabilityRef = useRef(null);

  const calculateRefund = () => {
    setIsCalculating(true);
    
    // Animate the calculation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      const income = parseFloat(totalIncome) || 0;
      const tdsAmount = parseFloat(taxDeducted) || 0;
      const advanceTax = parseFloat(advanceTaxPaid) || 0;
      const selfTax = parseFloat(selfAssessmentTax) || 0;
      const liability = parseFloat(taxLiability) || 0;

      if (income === 0) {
        Alert.alert('Missing Information', 'Please enter your total income for accurate refund calculation.');
        setIsCalculating(false);
        return;
      }

      // Calculate total tax paid
      const totalTaxPaid = tdsAmount + advanceTax + selfTax;
      
      // Calculate refund or payable amount
      let refundAmount = 0;
      let payableAmount = 0;
      let status = '';

      if (totalTaxPaid > liability) {
        refundAmount = totalTaxPaid - liability;
        status = 'refund';
      } else if (liability > totalTaxPaid) {
        payableAmount = liability - totalTaxPaid;
        status = 'payable';
      } else {
        status = 'balanced';
      }

      // Calculate effective tax rate
      const effectiveTaxRate = income > 0 ? (liability / income) * 100 : 0;

      // Estimate refund processing time
      const processingTime = refundAmount > 0 ? getProcessingTime(refundAmount) : null;

      setRefundResult({
        totalIncome: income,
        totalTaxPaid,
        taxLiability: liability,
        refundAmount,
        payableAmount,
        status,
        effectiveTaxRate,
        processingTime,
        breakdown: {
          tdsAmount,
          advanceTax,
          selfTax
        }
      });

      setIsCalculating(false);
    }, 1000);
  };

  // Get estimated processing time based on refund amount
  const getProcessingTime = (amount) => {
    if (amount <= 100000) return '20-30 days';
    if (amount <= 500000) return '30-45 days';
    return '45-60 days';
  };

  const resetCalculator = () => {
    setTotalIncome('');
    setTaxDeducted('');
    setAdvanceTaxPaid('');
    setSelfAssessmentTax('');
    setTaxLiability('');
    setRefundResult(null);
    animatedValue.setValue(0);
  };

  const ResultCard = () => {
    if (!refundResult) return null;

    return (
      <View style={styles.resultContainer}>
        <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.resultGradient}>
          <View style={styles.resultHeader}>
            <MaterialIcons name="account-balance" size={24} color="#ffffff" />
            <Text style={styles.resultTitle}>Tax Refund Analysis</Text>
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total Income</Text>
              <Text style={styles.resultValue}>₹{refundResult.totalIncome.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Tax Liability</Text>
              <Text style={styles.resultValue}>₹{refundResult.taxLiability.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total Tax Paid</Text>
              <Text style={styles.resultValue}>₹{refundResult.totalTaxPaid.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Effective Tax Rate</Text>
              <Text style={styles.resultValue}>{refundResult.effectiveTaxRate.toFixed(2)}%</Text>
            </View>
          </View>

          {/* Refund/Payable Status */}
          <View style={styles.statusContainer}>
            {refundResult.status === 'refund' && (
              <View style={styles.refundStatusCard}>
                <MaterialIcons name="trending-up" size={32} color="#10B981" />
                <View style={styles.statusText}>
                  <Text style={styles.statusLabel}>Expected Refund</Text>
                  <Text style={styles.refundAmount}>₹{Math.round(refundResult.refundAmount).toLocaleString('en-IN')}</Text>
                  {refundResult.processingTime && (
                    <Text style={styles.processingTime}>Processing: {refundResult.processingTime}</Text>
                  )}
                </View>
              </View>
            )}

            {refundResult.status === 'payable' && (
              <View style={styles.payableStatusCard}>
                <MaterialIcons name="trending-down" size={32} color="#EF4444" />
                <View style={styles.statusText}>
                  <Text style={styles.statusLabel}>Tax Payable</Text>
                  <Text style={styles.payableAmount}>₹{Math.round(refundResult.payableAmount).toLocaleString('en-IN')}</Text>
                  <Text style={styles.processingTime}>Pay before due date to avoid penalty</Text>
                </View>
              </View>
            )}

            {refundResult.status === 'balanced' && (
              <View style={styles.balancedStatusCard}>
                <MaterialIcons name="check-circle" size={32} color="#F8B259" />
                <View style={styles.statusText}>
                  <Text style={styles.statusLabel}>Tax Balanced</Text>
                  <Text style={styles.balancedText}>No refund or payment required</Text>
                </View>
              </View>
            )}
          </View>

          {/* Tax Payment Breakdown */}
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Tax Payment Breakdown</Text>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>TDS Deducted</Text>
              <Text style={styles.breakdownValue}>₹{refundResult.breakdown.tdsAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Advance Tax</Text>
              <Text style={styles.breakdownValue}>₹{refundResult.breakdown.advanceTax.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Self Assessment Tax</Text>
              <Text style={styles.breakdownValue}>₹{refundResult.breakdown.selfTax.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tax Refund Calculator</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
            <MaterialIcons name="refresh" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          
          {/* Assessment Year Selector */}
          <View style={styles.assessmentContainer}>
            <Text style={styles.assessmentTitle}>Assessment Year</Text>
            <View style={styles.assessmentToggle}>
              <TouchableOpacity
                style={[
                  styles.assessmentButton,
                  assessmentYear === '2025-26' && styles.assessmentButtonActive
                ]}
                onPress={() => setAssessmentYear('2025-26')}
              >
                <Text style={[
                  styles.assessmentButtonText,
                  assessmentYear === '2025-26' && styles.assessmentButtonTextActive
                ]}>2025-26</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.assessmentButton,
                  assessmentYear === '2024-25' && styles.assessmentButtonActive
                ]}
                onPress={() => setAssessmentYear('2024-25')}
              >
                <Text style={[
                  styles.assessmentButtonText,
                  assessmentYear === '2024-25' && styles.assessmentButtonTextActive
                ]}>2024-25</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Income Details Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="account-balance-wallet" size={24} color="#D96F32" />
              <Text style={styles.sectionTitle}>Income & Tax Details</Text>
            </View>

            <InputField
              label="Total Income (Annual)"
              value={totalIncome}
              onChangeText={setTotalIncome}
              placeholder="Enter your total annual income"
              icon="monetization-on"
              ref={totalIncomeRef}
              onSubmitEditing={() => taxDeductedRef.current?.focus()}
              returnKeyType="next"
            />

            <InputField
              label="Tax Deducted at Source (TDS)"
              value={taxDeducted}
              onChangeText={setTaxDeducted}
              placeholder="Enter total TDS amount"
              icon="receipt"
              ref={taxDeductedRef}
              onSubmitEditing={() => advanceTaxPaidRef.current?.focus()}
              returnKeyType="next"
            />

            <InputField
              label="Advance Tax Paid"
              value={advanceTaxPaid}
              onChangeText={setAdvanceTaxPaid}
              placeholder="Enter advance tax paid"
              icon="schedule"
              ref={advanceTaxPaidRef}
              onSubmitEditing={() => selfAssessmentTaxRef.current?.focus()}
              returnKeyType="next"
            />

            <InputField
              label="Self Assessment Tax"
              value={selfAssessmentTax}
              onChangeText={setSelfAssessmentTax}
              placeholder="Enter self assessment tax paid"
              icon="payment"
              ref={selfAssessmentTaxRef}
              onSubmitEditing={() => taxLiabilityRef.current?.focus()}
              returnKeyType="next"
            />

            <InputField
              label="Total Tax Liability"
              value={taxLiability}
              onChangeText={setTaxLiability}
              placeholder="Enter your total tax liability"
              icon="calculate"
              ref={taxLiabilityRef}
              returnKeyType="done"
            />
          </View>

          {/* Info Box */}
          <View style={styles.infoContainer}>
            <MaterialIcons name="info" size={20} color="#F8B259" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Refund Information</Text>
              <Text style={styles.infoText}>
                • Check Form 26AS for accurate TDS details{'\n'}
                • Include all challan payments in advance tax{'\n'}
                • Tax liability can be calculated using tax calculator{'\n'}
                • Refunds are processed electronically
              </Text>
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity style={styles.calculateButton} onPress={calculateRefund}>
            <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.calculateGradient}>
              <View style={styles.buttonContent}>
                {isCalculating ? (
                  <View style={styles.calculatingContainer}>
                    <Text style={styles.calculatingText}>Calculating Refund...</Text>
                  </View>
                ) : (
                  <>
                    <MaterialIcons name="account-balance" size={20} color="#ffffff" />
                    <Text style={styles.calculateButtonText}>Calculate Tax Refund</Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <ResultCard />
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  headerGradient: {
    elevation: 8,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  resetButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  assessmentContainer: {
    marginBottom: 24,
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  assessmentToggle: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  assessmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  assessmentButtonActive: {
    backgroundColor: '#D96F32',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  assessmentButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B7355',
  },
  assessmentButtonTextActive: {
    color: '#ffffff',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    letterSpacing: 0.3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D1810',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2D1810',
    fontWeight: '600',
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.2)',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(248, 178, 89, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(248, 178, 89, 0.2)',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#8B7355',
    lineHeight: 18,
  },
  calculateButton: {
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#F8B259',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  calculateGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  calculatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calculatingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  resultGradient: {
    padding: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  resultGrid: {
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  resultLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '800',
  },
  statusContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  refundStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payableStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balancedStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  refundAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981',
  },
  payableAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EF4444',
  },
  balancedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8B259',
  },
  processingTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontStyle: 'italic',
  },
  breakdownContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottomSpacer: {
    height: 60,
  },
});

export default TaxRefundCalculator;
