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

// ✅ FIXED: Wrapped InputField with React.memo and React.forwardRef to prevent re-renders on keystrokes
const InputField = memo(
  forwardRef(({ label, value, onChangeText, placeholder, icon, onSubmitEditing, returnKeyType, keyboardType = 'numeric' }, ref) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputHeader}>
        <MaterialCommunityIcons name={icon} size={20} color="#D96F32" />
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
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={false}
      />
    </View>
  ))
);

const TaxCalculator = () => {
  const navigation = useNavigation();
  const [selectedRegime, setSelectedRegime] = useState('new');
  const [basicSalary, setBasicSalary] = useState('');
  const [hra, setHra] = useState('');
  const [otherIncome, setOtherIncome] = useState('');

  // Deductions
  const [section80C, setSection80C] = useState('');
  const [section80D, setSection80D] = useState('');
  const [homeLoanInterest, setHomeLoanInterest] = useState('');

  const [taxResult, setTaxResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Refs for focusing on the next input field
  const basicSalaryRef = useRef(null);
  const hraRef = useRef(null);
  const otherIncomeRef = useRef(null);
  const section80CRef = useRef(null);
  const section80DRef = useRef(null);
  const homeLoanInterestRef = useRef(null);

  const calculateTax = () => {
    setIsCalculating(true);

    // Animate the calculation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      const totalIncome =
        (parseFloat(basicSalary) || 0) +
        (parseFloat(hra) || 0) +
        (parseFloat(otherIncome) || 0);

      let totalDeductions = 0;
      let taxableIncome = totalIncome;

      if (selectedRegime === 'old') {
        totalDeductions =
          (parseFloat(section80C) || 0) +
          (parseFloat(section80D) || 0) +
          (parseFloat(homeLoanInterest) || 0);
        taxableIncome = totalIncome - totalDeductions;
      }

      // Calculate tax based on regime
      let calculatedTax = 0;
      let taxBreakdown = [];

      if (selectedRegime === 'new') {
        // New Tax Regime (FY 2024-25)
        if (taxableIncome <= 300000) {
          calculatedTax = 0;
          taxBreakdown.push({ slab: '₹0 - ₹3,00,000', rate: '0%', tax: 0 });
        } else if (taxableIncome <= 700000) {
          calculatedTax = 0.05 * (taxableIncome - 300000);
          taxBreakdown.push(
            { slab: '₹0 - ₹3,00,000', rate: '0%', tax: 0 },
            { slab: '₹3,00,001 - ₹7,00,000', rate: '5%', tax: calculatedTax }
          );
        } else if (taxableIncome <= 1000000) {
          const tax1 = 0.05 * 400000;
          const tax2 = 0.10 * (taxableIncome - 700000);
          calculatedTax = tax1 + tax2;
          taxBreakdown.push(
            { slab: '₹0 - ₹3,00,000', rate: '0%', tax: 0 },
            { slab: '₹3,00,001 - ₹7,00,000', rate: '5%', tax: tax1 },
            { slab: '₹7,00,001 - ₹10,00,000', rate: '10%', tax: tax2 }
          );
        } else if (taxableIncome <= 1200000) {
          const tax1 = 0.05 * 400000;
          const tax2 = 0.10 * 300000;
          const tax3 = 0.15 * (taxableIncome - 1000000);
          calculatedTax = tax1 + tax2 + tax3;
          taxBreakdown.push(
            { slab: '₹0 - ₹3,00,000', rate: '0%', tax: 0 },
            { slab: '₹3,00,001 - ₹7,00,000', rate: '5%', tax: tax1 },
            { slab: '₹7,00,001 - ₹10,00,000', rate: '10%', tax: tax2 },
            { slab: '₹10,00,001 - ₹12,00,000', rate: '15%', tax: tax3 }
          );
        } else if (taxableIncome <= 1500000) {
          const tax1 = 0.05 * 400000;
          const tax2 = 0.10 * 300000;
          const tax3 = 0.15 * 200000;
          const tax4 = 0.20 * (taxableIncome - 1200000);
          calculatedTax = tax1 + tax2 + tax3 + tax4;
          taxBreakdown.push(
            { slab: '₹0 - ₹3,00,000', rate: '0%', tax: 0 },
            { slab: '₹3,00,001 - ₹7,00,000', rate: '5%', tax: tax1 },
            { slab: '₹7,00,001 - ₹10,00,000', rate: '10%', tax: tax2 },
            { slab: '₹10,00,001 - ₹12,00,000', rate: '15%', tax: tax3 },
            { slab: '₹12,00,001 - ₹15,00,000', rate: '20%', tax: tax4 }
          );
        } else {
          const tax1 = 0.05 * 400000;
          const tax2 = 0.10 * 300000;
          const tax3 = 0.15 * 200000;
          const tax4 = 0.20 * 300000;
          const tax5 = 0.30 * (taxableIncome - 1500000);
          calculatedTax = tax1 + tax2 + tax3 + tax4 + tax5;
          taxBreakdown.push(
            { slab: '₹0 - ₹3,00,000', rate: '0%', tax: 0 },
            { slab: '₹3,00,001 - ₹7,00,000', rate: '5%', tax: tax1 },
            { slab: '₹7,00,001 - ₹10,00,000', rate: '10%', tax: tax2 },
            { slab: '₹10,00,001 - ₹12,00,000', rate: '15%', tax: tax3 },
            { slab: '₹12,00,001 - ₹15,00,000', rate: '20%', tax: tax4 },
            { slab: 'Above ₹15,00,000', rate: '30%', tax: tax5 }
          );
        }
      } else {
        // Old Tax Regime
        if (taxableIncome <= 250000) {
          calculatedTax = 0;
        } else if (taxableIncome <= 500000) {
          calculatedTax = 0.05 * (taxableIncome - 250000);
        } else if (taxableIncome <= 1000000) {
          calculatedTax = 12500 + 0.20 * (taxableIncome - 500000);
        } else {
          calculatedTax = 112500 + 0.30 * (taxableIncome - 1000000);
        }
      }

      // Add Health & Education Cess (4%)
      const cess = calculatedTax * 0.04;
      const totalTax = calculatedTax + cess;

      setTaxResult({
        totalIncome,
        totalDeductions,
        taxableIncome,
        baseTax: calculatedTax,
        cess,
        totalTax,
        regime: selectedRegime,
        breakdown: taxBreakdown,
        takeHome: totalIncome - totalTax
      });

      setIsCalculating(false);
    }, 1000);
  };

  const resetCalculator = () => {
    setBasicSalary('');
    setHra('');
    setOtherIncome('');
    setSection80C('');
    setSection80D('');
    setHomeLoanInterest('');
    setTaxResult(null);
    animatedValue.setValue(0);
  };

  const RegimeToggle = () => (
    <View style={styles.regimeContainer}>
      <Text style={styles.regimeTitle}>Select Tax Regime</Text>
      <View style={styles.regimeToggle}>
        <TouchableOpacity
          style={[styles.regimeButton, selectedRegime === 'new' && styles.regimeButtonActive]}
          onPress={() => setSelectedRegime('new')}
        >
          <Text style={[styles.regimeButtonText, selectedRegime === 'new' && styles.regimeButtonTextActive]}>
            New Regime
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.regimeButton, selectedRegime === 'old' && styles.regimeButtonActive]}
          onPress={() => setSelectedRegime('old')}
        >
          <Text style={[styles.regimeButtonText, selectedRegime === 'old' && styles.regimeButtonTextActive]}>
            Old Regime
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ResultCard = () => {
    if (!taxResult) return null;

    return (
      <Animated.View
        style={[
          styles.resultContainer,
          {
            opacity: animatedValue,
            transform: [{
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.resultGradient}>
          <View style={styles.resultHeader}>
            <MaterialCommunityIcons name="calculator" size={24} color="#ffffff" />
            <Text style={styles.resultTitle}>Tax Calculation Result</Text>
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total Income</Text>
              <Text style={styles.resultValue}>₹{taxResult.totalIncome.toLocaleString('en-IN')}</Text>
            </View>

            {selectedRegime === 'old' && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Deductions</Text>
                <Text style={styles.resultValue}>₹{taxResult.totalDeductions.toLocaleString('en-IN')}</Text>
              </View>
            )}

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Taxable Income</Text>
              <Text style={styles.resultValue}>₹{taxResult.taxableIncome.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Income Tax</Text>
              <Text style={styles.resultValue}>₹{taxResult.baseTax.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Cess (4%)</Text>
              <Text style={styles.resultValue}>₹{taxResult.cess.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.totalTaxContainer}>
            <Text style={styles.totalTaxLabel}>Total Tax Payable</Text>
            <Text style={styles.totalTaxValue}>₹{Math.round(taxResult.totalTax).toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.takeHomeContainer}>
            <Text style={styles.takeHomeLabel}>Take Home Income</Text>
            <Text style={styles.takeHomeValue}>₹{Math.round(taxResult.takeHome).toLocaleString('en-IN')}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tax Calculator</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
            <MaterialIcons name="refresh" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        enabled={true}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          // ✅ FIXED: These properties are crucial for the bug fix
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
        >
          <RegimeToggle />

          {/* Income Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="cash-multiple" size={24} color="#D96F32" />
              <Text style={styles.sectionTitle}>Income Details</Text>
            </View>

            <InputField
              label="Basic Salary (Annual)"
              value={basicSalary}
              onChangeText={setBasicSalary}
              placeholder="Enter your basic salary"
              icon="currency-inr"
              returnKeyType="next"
              onSubmitEditing={() => hraRef.current.focus()}
            />

            <InputField
              label="HRA Received (Annual)"
              value={hra}
              onChangeText={setHra}
              placeholder="House rent allowance"
              icon="home-currency-usd"
              returnKeyType="next"
              ref={hraRef}
              onSubmitEditing={() => otherIncomeRef.current.focus()}
            />

            <InputField
              label="Other Income (Annual)"
              value={otherIncome}
              onChangeText={setOtherIncome}
              placeholder="Business, investment income etc."
              icon="trending-up"
              returnKeyType={selectedRegime === 'old' ? 'next' : 'done'}
              ref={otherIncomeRef}
              onSubmitEditing={() => {
                if (selectedRegime === 'old') {
                  section80CRef.current.focus();
                }
              }}
            />
          </View>

          {/* Deductions Section - Only show for Old Regime */}
          {selectedRegime === 'old' && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="receipt" size={24} color="#F8B259" />
                <Text style={styles.sectionTitle}>Deductions (Old Regime)</Text>
              </View>

              <InputField
                label="Section 80C (Max ₹1.5L)"
                value={section80C}
                onChangeText={setSection80C}
                placeholder="PPF, ELSS, Insurance etc."
                icon="shield-check"
                returnKeyType="next"
                ref={section80CRef}
                onSubmitEditing={() => section80DRef.current.focus()}
              />

              <InputField
                label="Section 80D (Health Insurance)"
                value={section80D}
                onChangeText={setSection80D}
                placeholder="Health insurance premium"
                icon="medical-bag"
                returnKeyType="next"
                ref={section80DRef}
                onSubmitEditing={() => homeLoanInterestRef.current.focus()}
              />

              <InputField
                label="Home Loan Interest"
                value={homeLoanInterest}
                onChangeText={setHomeLoanInterest}
                placeholder="Interest paid on home loan"
                icon="home"
                returnKeyType="done"
                ref={homeLoanInterestRef}
              />
            </View>
          )}

          {/* Calculate Button */}
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculateTax}
            disabled={isCalculating}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#F8B259', '#D96F32']} style={styles.calculateGradient}>
              {isCalculating ? (
                <View style={styles.calculatingContainer}>
                  <MaterialCommunityIcons name="loading" size={20} color="#ffffff" />
                  <Text style={styles.calculatingText}>Calculating...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialCommunityIcons name="calculator-variant" size={20} color="#ffffff" />
                  <Text style={styles.calculateButtonText}>Calculate Tax</Text>
                </View>
              )}
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
  regimeContainer: {
    marginBottom: 24,
  },
  regimeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  regimeToggle: {
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
  regimeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  regimeButtonActive: {
    backgroundColor: '#D96F32',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  regimeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B7355',
  },
  regimeButtonTextActive: {
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
  totalTaxContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalTaxLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  totalTaxValue: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '900',
  },
  takeHomeContainer: {
    backgroundColor: 'rgba(248, 178, 89, 0.3)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  takeHomeLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  takeHomeValue: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '900',
  },
  bottomSpacer: {
    height: 60,
  },
});

export default TaxCalculator;
