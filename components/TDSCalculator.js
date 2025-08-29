// components/TDSCalculator.js

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

const TDSCalculator = () => {
  const navigation = useNavigation();
  const [selectedTDSType, setSelectedTDSType] = useState('salary');
  
  // Income inputs
  const [salaryIncome, setSalaryIncome] = useState('');
  const [professionalIncome, setProfessionalIncome] = useState('');
  const [interestIncome, setInterestIncome] = useState('');
  const [rentIncome, setRentIncome] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  
  // TDS inputs
  const [customTDSRate, setCustomTDSRate] = useState('');
  
  const [tdsResult, setTdsResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Refs for focusing on the next input field
  const salaryIncomeRef = useRef(null);
  const professionalIncomeRef = useRef(null);
  const interestIncomeRef = useRef(null);
  const rentIncomeRef = useRef(null);
  const otherIncomeRef = useRef(null);
  const customTDSRateRef = useRef(null);

  // TDS rates for different income types (as per current rates)
  const tdsRates = {
    salary: { rate: 0, description: 'Based on tax slab rates' },
    professional: { rate: 10, description: '10% on professional fees' },
    interest: { rate: 10, description: '10% on interest income' },
    rent: { rate: 10, description: '10% on rent income' },
    contractor: { rate: 2, description: '2% on contractor payments' },
    commission: { rate: 5, description: '5% on commission payments' },
    other: { rate: 10, description: 'Custom rate' }
  };

  const calculateTDS = () => {
    setIsCalculating(true);
    
    // Animate the calculation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      const totalIncome = 
        (parseFloat(salaryIncome) || 0) +
        (parseFloat(professionalIncome) || 0) +
        (parseFloat(interestIncome) || 0) +
        (parseFloat(rentIncome) || 0) +
        (parseFloat(otherIncome) || 0);

      if (totalIncome === 0) {
        Alert.alert('No Income', 'Please enter some income amount to calculate TDS.');
        setIsCalculating(false);
        return;
      }

      let tdsCalculations = [];
      let totalTDS = 0;

      // Calculate TDS for each income type
      if (parseFloat(salaryIncome) > 0) {
        const salaryTDS = calculateSalaryTDS(parseFloat(salaryIncome));
        tdsCalculations.push({
          type: 'Salary',
          income: parseFloat(salaryIncome),
          rate: salaryTDS.rate,
          tds: salaryTDS.amount,
          section: 'Section 192'
        });
        totalTDS += salaryTDS.amount;
      }

      if (parseFloat(professionalIncome) > 0) {
        const profTDS = (parseFloat(professionalIncome) * tdsRates.professional.rate) / 100;
        tdsCalculations.push({
          type: 'Professional Fees',
          income: parseFloat(professionalIncome),
          rate: tdsRates.professional.rate,
          tds: profTDS,
          section: 'Section 194J'
        });
        totalTDS += profTDS;
      }

      if (parseFloat(interestIncome) > 0) {
        const intTDS = parseFloat(interestIncome) > 40000 ? 
          (parseFloat(interestIncome) * tdsRates.interest.rate) / 100 : 0;
        tdsCalculations.push({
          type: 'Interest Income',
          income: parseFloat(interestIncome),
          rate: parseFloat(interestIncome) > 40000 ? tdsRates.interest.rate : 0,
          tds: intTDS,
          section: 'Section 194A'
        });
        totalTDS += intTDS;
      }

      if (parseFloat(rentIncome) > 0) {
        const rentTDS = parseFloat(rentIncome) > 240000 ?
          (parseFloat(rentIncome) * tdsRates.rent.rate) / 100 : 0;
        tdsCalculations.push({
          type: 'Rent Income',
          income: parseFloat(rentIncome),
          rate: parseFloat(rentIncome) > 240000 ? tdsRates.rent.rate : 0,
          tds: rentTDS,
          section: 'Section 194I'
        });
        totalTDS += rentTDS;
      }

      if (parseFloat(otherIncome) > 0) {
        const customRate = parseFloat(customTDSRate) || 10;
        const otherTDS = (parseFloat(otherIncome) * customRate) / 100;
        tdsCalculations.push({
          type: 'Other Income',
          income: parseFloat(otherIncome),
          rate: customRate,
          tds: otherTDS,
          section: 'Various Sections'
        });
        totalTDS += otherTDS;
      }

      setTdsResult({
        totalIncome,
        totalTDS,
        breakdown: tdsCalculations,
        netIncome: totalIncome - totalTDS
      });

      setIsCalculating(false);
    }, 1000);
  };

  // Calculate salary TDS based on basic tax slabs
  const calculateSalaryTDS = (salary) => {
    let taxableIncome = salary - 50000; // Standard deduction
    let tax = 0;

    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 700000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 20000 + (taxableIncome - 700000) * 0.10;
    } else if (taxableIncome <= 1200000) {
      tax = 50000 + (taxableIncome - 1000000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      tax = 80000 + (taxableIncome - 1200000) * 0.20;
    } else {
      tax = 140000 + (taxableIncome - 1500000) * 0.30;
    }

    // Add cess
    tax = tax * 1.04;
    
    return {
      amount: tax,
      rate: salary > 0 ? (tax / salary) * 100 : 0
    };
  };

  const resetCalculator = () => {
    setSalaryIncome('');
    setProfessionalIncome('');
    setInterestIncome('');
    setRentIncome('');
    setOtherIncome('');
    setCustomTDSRate('');
    setTdsResult(null);
    animatedValue.setValue(0);
  };

  const TDSTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Income Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {Object.entries(tdsRates).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.selectorButton,
              selectedTDSType === key && styles.selectorButtonActive
            ]}
            onPress={() => setSelectedTDSType(key)}
          >
            <Text style={[
              styles.selectorButtonText,
              selectedTDSType === key && styles.selectorButtonTextActive
            ]}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ResultCard = () => {
    if (!tdsResult) return null;

    return (
      <View style={styles.resultContainer}>
        <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.resultGradient}>
          <View style={styles.resultHeader}>
            <MaterialIcons name="assessment" size={24} color="#ffffff" />
            <Text style={styles.resultTitle}>TDS Calculation Result</Text>
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total Income</Text>
              <Text style={styles.resultValue}>₹{tdsResult.totalIncome.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total TDS</Text>
              <Text style={styles.resultValue}>₹{Math.round(tdsResult.totalTDS).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Net Income</Text>
              <Text style={styles.resultValue}>₹{Math.round(tdsResult.netIncome).toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>TDS Breakdown</Text>
            {tdsResult.breakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownType}>{item.type}</Text>
                  <Text style={styles.breakdownSection}>{item.section}</Text>
                </View>
                <View style={styles.breakdownDetails}>
                  <Text style={styles.breakdownText}>
                    Income: ₹{item.income.toLocaleString('en-IN')} | 
                    Rate: {item.rate.toFixed(2)}% | 
                    TDS: ₹{Math.round(item.tds).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            ))}
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
          <Text style={styles.headerTitle}>TDS Calculator</Text>
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
          
          {/* Income Details Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="account-balance-wallet" size={24} color="#D96F32" />
              <Text style={styles.sectionTitle}>Income Details</Text>
            </View>

            <InputField
              label="Salary Income (Annual)"
              value={salaryIncome}
              onChangeText={setSalaryIncome}
              placeholder="Enter your annual salary"
              icon="work"
              ref={salaryIncomeRef}
              onSubmitEditing={() => professionalIncomeRef.current?.focus()}
              returnKeyType="next"
            />

            <InputField
              label="Professional/Consultant Income"
              value={professionalIncome}
              onChangeText={setProfessionalIncome}
              placeholder="Enter professional fees received"
              icon="business-center"
              ref={professionalIncomeRef}
              onSubmitEditing={() => interestIncomeRef.current?.focus()}
              returnKeyType="next"
            />

            <InputField
              label="Interest Income (Bank/FD)"
              value={interestIncome}
              onChangeText={setInterestIncome}
              placeholder="Enter interest income"
              icon="savings"
              ref={interestIncomeRef}
              onSubmitEditing={() => rentIncomeRef.current?.focus()}
              returnKeyType="next"
            />

            <InputField
              label="Rent Income"
              value={rentIncome}
              onChangeText={setRentIncome}
              placeholder="Enter rental income"
              icon="home"
              ref={rentIncomeRef}
              onSubmitEditing={() => otherIncomeRef.current?.focus()}
              returnKeyType="next"
            />

            <InputField
              label="Other Income"
              value={otherIncome}
              onChangeText={setOtherIncome}
              placeholder="Enter other taxable income"
              icon="monetization-on"
              ref={otherIncomeRef}
              onSubmitEditing={() => customTDSRateRef.current?.focus()}
              returnKeyType="next"
            />

            <InputField
              label="Custom TDS Rate for Other Income (%)"
              value={customTDSRate}
              onChangeText={setCustomTDSRate}
              placeholder="10"
              icon="percent"
              ref={customTDSRateRef}
              returnKeyType="done"
            />
          </View>

          {/* TDS Rates Info */}
          <View style={styles.infoContainer}>
            <MaterialIcons name="info" size={20} color="#F8B259" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>TDS Rates (FY 2024-25)</Text>
              <Text style={styles.infoText}>
                • Salary: As per tax slabs{'\n'}
                • Professional Fees: 10% (Section 194J){'\n'}
                • Interest: 10% if {'>'}₹40,000 (Section 194A){'\n'}
                • Rent: 10% if {'>'}₹2.4L (Section 194I)
              </Text>
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity style={styles.calculateButton} onPress={calculateTDS}>
            <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.calculateGradient}>
              <View style={styles.buttonContent}>
                {isCalculating ? (
                  <View style={styles.calculatingContainer}>
                    <Text style={styles.calculatingText}>Calculating TDS...</Text>
                  </View>
                ) : (
                  <>
                    <MaterialIcons name="calculate" size={20} color="#ffffff" />
                    <Text style={styles.calculateButtonText}>Calculate TDS</Text>
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
  breakdownContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  breakdownItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  breakdownType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8B259',
  },
  breakdownSection: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },
  breakdownDetails: {
    marginTop: 4,
  },
  breakdownText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 60,
  },
});

export default TDSCalculator;
