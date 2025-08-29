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
  ActivityIndicator,
  Keyboard, // ✅ FIXED: Import the Keyboard API
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { generateTaxPlan } from '../services/taxPlanner';

// ✅ FIXED: Wrapped InputField with React.memo and React.forwardRef
const InputField = memo(
  forwardRef(({ label, value, onChangeText, placeholder, icon, keyboardType = 'default', onSubmitEditing, returnKeyType }, ref) => (
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
        autoCorrect={false}
        autoCapitalize="none"
        textContentType="none"
        autoComplete="off"
      />
    </View>
  ))
);

const TaxPlanning = () => {
  const navigation = useNavigation();

  // Personal Details
  const [age, setAge] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [dependents, setDependents] = useState('');

  // Investment Details
  const [currentPPF, setCurrentPPF] = useState('');
  const [currentELSS, setCurrentELSS] = useState('');
  const [currentInsurance, setCurrentInsurance] = useState('');
  const [currentFD, setCurrentFD] = useState('');

  // Goals and Preferences
  const [retirementGoal, setRetirementGoal] = useState('');
  const [childEducation, setChildEducation] = useState('');
  const [homeLoan, setHomeLoan] = useState('');
  const [riskAppetite, setRiskAppetite] = useState('moderate');
  const [taxRegime, setTaxRegime] = useState('new');
  const [timeHorizon, setTimeHorizon] = useState('long');

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [taxPlan, setTaxPlan] = useState(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Refs for focusing on next input
  const annualIncomeRef = useRef(null);
  const currentSavingsRef = useRef(null);
  const dependentsRef = useRef(null);
  const currentPPFRef = useRef(null);
  const currentELSSRef = useRef(null);
  const currentInsuranceRef = useRef(null);
  const currentFDRef = useRef(null);
  const retirementGoalRef = useRef(null);
  const childEducationRef = useRef(null);
  const homeLoanRef = useRef(null);

  const resetForm = () => {
    setAge('');
    setAnnualIncome('');
    setCurrentSavings('');
    setDependents('');
    setCurrentPPF('');
    setCurrentELSS('');
    setCurrentInsurance('');
    setCurrentFD('');
    setRetirementGoal('');
    setChildEducation('');
    setHomeLoan('');
    setRiskAppetite('moderate');
    setTaxRegime('new');
    setTimeHorizon('long');
    setTaxPlan(null);
    animatedValue.setValue(0);
  };

  const generatePlan = async () => {
    Keyboard.dismiss(); // ✅ FIXED: Explicitly dismiss the keyboard on button click
    if (!age || !annualIncome) {
      Alert.alert('Required Fields', 'Please fill in your age and annual income to generate a tax plan.');
      return;
    }

    setIsGenerating(true);

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    try {
      const userProfile = {
        personalDetails: {
          age: parseInt(age),
          annualIncome: parseFloat(annualIncome),
          currentSavings: parseFloat(currentSavings) || 0,
          dependents: parseInt(dependents) || 0,
        },
        currentInvestments: {
          ppf: parseFloat(currentPPF) || 0,
          elss: parseFloat(currentELSS) || 0,
          insurance: parseFloat(currentInsurance) || 0,
          fixedDeposits: parseFloat(currentFD) || 0,
        },
        financialGoals: {
          retirement: parseFloat(retirementGoal) || 0,
          childEducation: parseFloat(childEducation) || 0,
          homeLoan: parseFloat(homeLoan) || 0,
        },
        preferences: {
          riskAppetite,
          taxRegime,
          timeHorizon,
        }
      };

      const result = await generateTaxPlan(userProfile);
      setTaxPlan(result);
    } catch (error) {
      console.error('Error generating tax plan:', error);
      Alert.alert(
        'Generation Error',
        'Failed to generate your tax plan. Please try again or check your internet connection.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const SelectionButton = ({ options, selected, onSelect, title }) => (
    <View style={styles.selectionContainer}>
      <Text style={styles.selectionTitle}>{title}</Text>
      <View style={styles.selectionRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectionButton,
              selected === option.value && styles.selectionButtonActive
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.selectionButtonText,
                selected === option.value && styles.selectionButtonTextActive
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const PlanResultCard = () => {
    if (!taxPlan) return null;

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
            <MaterialCommunityIcons name="chart-line" size={24} color="#ffffff" />
            <Text style={styles.resultTitle}>Your Personalized Tax Plan</Text>
          </View>

          {taxPlan.recommendations && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>AI Recommendations</Text>
              <Text style={styles.recommendationsText}>{taxPlan.recommendations}</Text>
            </View>
          )}

          {taxPlan.investmentSuggestions && taxPlan.investmentSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Investment Suggestions</Text>
              {taxPlan.investmentSuggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <View style={styles.suggestionHeader}>
                    <MaterialCommunityIcons name="trending-up" size={16} color="#F8B259" />
                    <Text style={styles.suggestionInstrument}>{suggestion.instrument}</Text>
                  </View>
                  <Text style={styles.suggestionAmount}>₹{suggestion.amount?.toLocaleString('en-IN')}</Text>
                  <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
                </View>
              ))}
            </View>
          )}

          {taxPlan.taxSavings && (
            <View style={styles.savingsContainer}>
              <Text style={styles.savingsTitle}>Estimated Tax Savings</Text>
              <Text style={styles.savingsAmount}>₹{Math.round(taxPlan.taxSavings).toLocaleString('en-IN')}</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const riskOptions = [
    { value: 'conservative', label: 'Conservative' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'aggressive', label: 'Aggressive' }
  ];

  const regimeOptions = [
    { value: 'new', label: 'New Regime' },
    { value: 'old', label: 'Old Regime' }
  ];

  const horizonOptions = [
    { value: 'short', label: 'Short (1-3 yrs)' },
    { value: 'medium', label: 'Medium (3-7 yrs)' },
    { value: 'long', label: 'Long (7+ yrs)' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tax Planning</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
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
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          bounces={false}
          overScrollMode="never"
          nestedScrollEnabled={true}
        >
          {/* Personal Details Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-circle" size={24} color="#D96F32" />
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>

            <InputField
              label="Age *"
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              icon="calendar"
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => annualIncomeRef.current?.focus()}
            />

            <InputField
              label="Annual Income (₹) *"
              value={annualIncome}
              onChangeText={setAnnualIncome}
              placeholder="Total annual income"
              icon="currency-inr"
              keyboardType="numeric"
              returnKeyType="next"
              ref={annualIncomeRef}
              onSubmitEditing={() => currentSavingsRef.current?.focus()}
            />

            <InputField
              label="Current Savings (₹)"
              value={currentSavings}
              onChangeText={setCurrentSavings}
              placeholder="Current savings amount"
              icon="bank"
              keyboardType="numeric"
              returnKeyType="next"
              ref={currentSavingsRef}
              onSubmitEditing={() => dependentsRef.current?.focus()}
            />

            <InputField
              label="Number of Dependents"
              value={dependents}
              onChangeText={setDependents}
              placeholder="Spouse, children, parents"
              icon="account-group"
              keyboardType="numeric"
              returnKeyType="next"
              ref={dependentsRef}
              onSubmitEditing={() => currentPPFRef.current?.focus()}
            />
          </View>

          {/* Current Investments Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="chart-pie" size={24} color="#F8B259" />
              <Text style={styles.sectionTitle}>Current Investments</Text>
            </View>

            <InputField
              label="PPF Investment (₹/year)"
              value={currentPPF}
              onChangeText={setCurrentPPF}
              placeholder="Current PPF contribution"
              icon="shield-check"
              keyboardType="numeric"
              returnKeyType="next"
              ref={currentPPFRef}
              onSubmitEditing={() => currentELSSRef.current?.focus()}
            />

            <InputField
              label="ELSS Investment (₹/year)"
              value={currentELSS}
              onChangeText={setCurrentELSS}
              placeholder="Current ELSS investment"
              icon="trending-up"
              keyboardType="numeric"
              returnKeyType="next"
              ref={currentELSSRef}
              onSubmitEditing={() => currentInsuranceRef.current?.focus()}
            />

            <InputField
              label="Insurance Premium (₹/year)"
              value={currentInsurance}
              onChangeText={setCurrentInsurance}
              placeholder="Life & health insurance"
              icon="medical-bag"
              keyboardType="numeric"
              returnKeyType="next"
              ref={currentInsuranceRef}
              onSubmitEditing={() => currentFDRef.current?.focus()}
            />

            <InputField
              label="Fixed Deposits (₹)"
              value={currentFD}
              onChangeText={setCurrentFD}
              placeholder="Current FD investments"
              icon="bank-outline"
              keyboardType="numeric"
              returnKeyType="next"
              ref={currentFDRef}
              onSubmitEditing={() => retirementGoalRef.current?.focus()}
            />
          </View>

          {/* Financial Goals Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="target" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Financial Goals</Text>
            </View>

            <InputField
              label="Retirement Corpus (₹)"
              value={retirementGoal}
              onChangeText={setRetirementGoal}
              placeholder="Target retirement amount"
              icon="account-clock"
              keyboardType="numeric"
              returnKeyType="next"
              ref={retirementGoalRef}
              onSubmitEditing={() => childEducationRef.current?.focus()}
            />

            <InputField
              label="Child Education Fund (₹)"
              value={childEducation}
              onChangeText={setChildEducation}
              placeholder="Education expenses target"
              icon="school"
              keyboardType="numeric"
              returnKeyType="next"
              ref={childEducationRef}
              onSubmitEditing={() => homeLoanRef.current?.focus()}
            />

            <InputField
              label="Home Loan (₹)"
              value={homeLoan}
              onChangeText={setHomeLoan}
              placeholder="Home loan amount (if any)"
              icon="home"
              keyboardType="numeric"
              returnKeyType="done"
              ref={homeLoanRef}
            />
          </View>

          {/* Preferences Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="settings" size={24} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Investment Preferences</Text>
            </View>

            <SelectionButton
              title="Risk Appetite"
              options={riskOptions}
              selected={riskAppetite}
              onSelect={setRiskAppetite}
            />

            <SelectionButton
              title="Tax Regime Preference"
              options={regimeOptions}
              selected={taxRegime}
              onSelect={setTaxRegime}
            />

            <SelectionButton
              title="Investment Time Horizon"
              options={horizonOptions}
              selected={timeHorizon}
              onSelect={setTimeHorizon}
            />
          </View>

          {/* Generate Plan Button */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generatePlan}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#F8B259', '#D96F32']} style={styles.generateGradient}>
              {isGenerating ? (
                <View style={styles.generatingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.generatingText}>Generating Your Tax Plan...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialCommunityIcons name="chart-line" size={20} color="#ffffff" />
                  <Text style={styles.generateButtonText}>Generate AI Tax Plan</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <PlanResultCard />

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
  selectionContainer: {
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  selectionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.2)',
    alignItems: 'center',
  },
  selectionButtonActive: {
    backgroundColor: '#D96F32',
    borderColor: '#D96F32',
  },
  selectionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B7355',
  },
  selectionButtonTextActive: {
    color: '#ffffff',
  },
  generateButton: {
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
  generateGradient: {
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
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  generatingText: {
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
  recommendationsContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  recommendationsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  suggestionItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  suggestionInstrument: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8B259',
  },
  suggestionAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  suggestionReason: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
  savingsContainer: {
    backgroundColor: 'rgba(248, 178, 89, 0.3)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  savingsTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '900',
  },
  bottomSpacer: {
    height: 60,
  },
});

export default TaxPlanning;
