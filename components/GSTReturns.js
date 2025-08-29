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
import RNPickerSelect from 'react-native-picker-select';
import { generateGSTReport, calculateGSTLiability, validateGSTIN } from '../services/gstService';

// Wrapped InputField with React.memo and React.forwardRef to prevent unnecessary re-renders
const InputField = memo(
  forwardRef(({ label, value, onChangeText, placeholder, keyboardType = 'default', isRequired = false, onSubmitEditing, returnKeyType }, ref) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
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

// ✅ FIXED: Created a reusable PickerField component
const PickerField = memo(
  forwardRef(({ label, value, onValueChange, items, isRequired = false, placeholder = "Select an option..." }, ref) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.pickerContainer}>
        <RNPickerSelect
          ref={ref}
          onValueChange={onValueChange}
          items={items}
          value={value}
          placeholder={{
            label: placeholder,
            value: null,
            color: '#8B7355',
          }}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
          Icon={() => {
            return <MaterialIcons name="keyboard-arrow-down" size={24} color="#8B7355" />;
          }}
        />
      </View>
    </View>
  ))
);

const GSTReturns = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [gstReport, setGstReport] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // GST Form Data
  const [gstData, setGstData] = useState({
    businessInfo: {
      gstin: '',
      legalName: '',
      tradeName: '',
      businessType: 'regular',
      returnType: 'GSTR3B',
      filingMonth: '',
      filingYear: '',
    },
    outwardSupplies: {
      b2bSupplies: '',
      b2cSupplies: '',
      exportSupplies: '',
      exemptSupplies: '',
      nilRatedSupplies: '',
      cgstAmount: '',
      sgstAmount: '',
      igstAmount: '',
      utgstAmount: '',
      cessAmount: '',
    },
    inwardSupplies: {
      b2bPurchases: '',
      importGoods: '',
      importServices: '',
      inwardSuppliesLiableToRCM: '',
      itcCgst: '',
      itcSgst: '',
      itcIgst: '',
      itcUtgst: '',
      itcCess: '',
    },
    gstPayment: {
      cgstPayable: '',
      sgstPayable: '',
      igstPayable: '',
      utgstPayable: '',
      cessPayable: '',
      interestPayable: '',
      lateFee: '',
      penalty: '',
    },
    hsnSummary: [],
    amendments: {
      b2bAmendments: '',
      b2cAmendments: '',
      exportAmendments: '',
    },
  });

  // Refs for managing focus between input fields
  const legalNameRef = useRef(null);
  const tradeNameRef = useRef(null);
  const b2bSuppliesRef = useRef(null);
  const b2cSuppliesRef = useRef(null);
  const exportSuppliesRef = useRef(null);
  const exemptSuppliesRef = useRef(null);
  const nilRatedSuppliesRef = useRef(null);
  const cgstAmountRef = useRef(null);
  const sgstAmountRef = useRef(null);
  const igstAmountRef = useRef(null);
  const cessAmountRef = useRef(null);
  const b2bPurchasesRef = useRef(null);
  const importGoodsRef = useRef(null);
  const importServicesRef = useRef(null);
  const inwardSuppliesLiableToRCMRef = useRef(null);
  const itcCgstRef = useRef(null);
  const itcSgstRef = useRef(null);
  const itcIgstRef = useRef(null);
  const itcCessRef = useRef(null);

  useEffect(() => {
    loadUserData();
    setCurrentMonth();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('@user_data');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setUserData(user);
        
        const savedGstData = await AsyncStorage.getItem('@gst_data');
        if (savedGstData) {
          const parsedGstData = JSON.parse(savedGstData);
          setGstData(prev => ({
            ...prev,
            businessInfo: {
              ...prev.businessInfo,
              legalName: user.name || '',
              ...parsedGstData.businessInfo,
            },
            outwardSupplies: { ...prev.outwardSupplies, ...parsedGstData.outwardSupplies },
            inwardSupplies: { ...prev.inwardSupplies, ...parsedGstData.inwardSupplies },
            gstPayment: { ...prev.gstPayment, ...parsedGstData.gstPayment },
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const setCurrentMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    setGstData(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        filingMonth: getMonthName(currentMonth),
        filingYear: currentYear.toString(),
      }
    }));
  };

  const steps = [
    { id: 1, title: 'Business Info', icon: 'business' },
    { id: 2, title: 'Outward Supplies', icon: 'trending-up' },
    { id: 3, title: 'Inward Supplies', icon: 'trending-down' },
    { id: 4, title: 'ITC & Payments', icon: 'payment' },
    { id: 5, title: 'Review & File', icon: 'check-circle' },
  ];

  const returnTypes = [
    { label: 'GSTR-1 (Outward Supplies)', value: 'GSTR1' },
    { label: 'GSTR-3B (Monthly Return)', value: 'GSTR3B' },
    { label: 'GSTR-9 (Annual Return)', value: 'GSTR9' },
    { label: 'GSTR-9C (Audit Certificate)', value: 'GSTR9C' },
  ];

  const businessTypes = [
    { label: 'Regular Taxpayer', value: 'regular' },
    { label: 'Composition Taxpayer', value: 'composition' },
    { label: 'Casual Taxpayer', value: 'casual' },
    { label: 'Non-Resident Taxpayer', value: 'nonResident' },
  ];

  const months = [
    { label: 'January', value: 0 },
    { label: 'February', value: 1 },
    { label: 'March', value: 2 },
    { label: 'April', value: 3 },
    { label: 'May', value: 4 },
    { label: 'June', value: 5 },
    { label: 'July', value: 6 },
    { label: 'August', value: 7 },
    { label: 'September', value: 8 },
    { label: 'October', value: 9 },
    { label: 'November', value: 10 },
    { label: 'December', value: 11 },
  ];

  const years = [
    { label: '2023', value: 2023 },
    { label: '2024', value: 2024 },
    { label: '2025', value: 2025 },
  ];

  const getMonthName = (monthIndex) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthIndex];
  };

  const updateGstData = (section, field, value) => {
    setGstData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }));
  };

  const handleNext = () => {
    Keyboard.dismiss();
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    Keyboard.dismiss();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!gstData.businessInfo.gstin || !gstData.businessInfo.legalName) {
          Alert.alert('Required Fields', 'Please fill in GSTIN and Legal Name');
          return false;
        }
        if (!validateGSTIN(gstData.businessInfo.gstin)) {
          Alert.alert('Invalid GSTIN', 'Please enter a valid 15-digit GSTIN');
          return false;
        }
        break;
      case 2:
        if (gstData.outwardSupplies.b2bSupplies === '' && gstData.outwardSupplies.b2cSupplies === '') {
          Alert.alert('No Sales Data', 'Please enter at least some outward supply data');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const calculateGSTAmounts = () => {
    const outwardSupplies = {
      b2bSupplies: parseFloat(gstData.outwardSupplies.b2bSupplies) || 0,
      b2cSupplies: parseFloat(gstData.outwardSupplies.b2cSupplies) || 0,
      exportSupplies: parseFloat(gstData.outwardSupplies.exportSupplies) || 0,
      cgstAmount: parseFloat(gstData.outwardSupplies.cgstAmount) || 0,
      sgstAmount: parseFloat(gstData.outwardSupplies.sgstAmount) || 0,
      igstAmount: parseFloat(gstData.outwardSupplies.igstAmount) || 0,
      cessAmount: parseFloat(gstData.outwardSupplies.cessAmount) || 0,
    };
    const inwardSupplies = {
      itcCgst: parseFloat(gstData.inwardSupplies.itcCgst) || 0,
      itcSgst: parseFloat(gstData.inwardSupplies.itcSgst) || 0,
      itcIgst: parseFloat(gstData.inwardSupplies.itcIgst) || 0,
      itcCess: parseFloat(gstData.inwardSupplies.itcCess) || 0,
    };

    const totalTurnover = outwardSupplies.b2bSupplies + outwardSupplies.b2cSupplies + outwardSupplies.exportSupplies;
    const outputGST = outwardSupplies.cgstAmount + outwardSupplies.sgstAmount + outwardSupplies.igstAmount + outwardSupplies.cessAmount;
    const inputGST = inwardSupplies.itcCgst + inwardSupplies.itcSgst + inwardSupplies.itcIgst + inwardSupplies.itcCess;
    const netGstPayable = Math.max(0, outputGST - inputGST);
    
    return {
      totalTurnover,
      outputGST,
      inputGST,
      netGstPayable,
    };
  };

  const generateReport = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const calculations = calculateGSTAmounts();
      const numericGstData = {
        ...gstData,
        outwardSupplies: {
          b2bSupplies: parseFloat(gstData.outwardSupplies.b2bSupplies) || 0,
          b2cSupplies: parseFloat(gstData.outwardSupplies.b2cSupplies) || 0,
          exportSupplies: parseFloat(gstData.outwardSupplies.exportSupplies) || 0,
          exemptSupplies: parseFloat(gstData.outwardSupplies.exemptSupplies) || 0,
          nilRatedSupplies: parseFloat(gstData.outwardSupplies.nilRatedSupplies) || 0,
          cgstAmount: parseFloat(gstData.outwardSupplies.cgstAmount) || 0,
          sgstAmount: parseFloat(gstData.outwardSupplies.sgstAmount) || 0,
          igstAmount: parseFloat(gstData.outwardSupplies.igstAmount) || 0,
          utgstAmount: parseFloat(gstData.outwardSupplies.utgstAmount) || 0,
          cessAmount: parseFloat(gstData.outwardSupplies.cessAmount) || 0,
        },
        inwardSupplies: {
          b2bPurchases: parseFloat(gstData.inwardSupplies.b2bPurchases) || 0,
          importGoods: parseFloat(gstData.inwardSupplies.importGoods) || 0,
          importServices: parseFloat(gstData.inwardSupplies.importServices) || 0,
          inwardSuppliesLiableToRCM: parseFloat(gstData.inwardSupplies.inwardSuppliesLiableToRCM) || 0,
          itcCgst: parseFloat(gstData.inwardSupplies.itcCgst) || 0,
          itcSgst: parseFloat(gstData.inwardSupplies.itcSgst) || 0,
          itcIgst: parseFloat(gstData.inwardSupplies.itcIgst) || 0,
          itcUtgst: parseFloat(gstData.inwardSupplies.itcUtgst) || 0,
          itcCess: parseFloat(gstData.inwardSupplies.itcCess) || 0,
        },
        gstPayment: {
          cgstPayable: parseFloat(gstData.gstPayment.cgstPayable) || 0,
          sgstPayable: parseFloat(gstData.gstPayment.sgstPayable) || 0,
          igstPayable: parseFloat(gstData.gstPayment.igstPayable) || 0,
          utgstPayable: parseFloat(gstData.gstPayment.utgstPayable) || 0,
          cessPayable: parseFloat(gstData.gstPayment.cessPayable) || 0,
          interestPayable: parseFloat(gstData.gstPayment.interestPayable) || 0,
          lateFee: parseFloat(gstData.gstPayment.lateFee) || 0,
          penalty: parseFloat(gstData.gstPayment.penalty) || 0,
        },
      };

      const report = await generateGSTReport({
        ...numericGstData,
        calculations,
      });

      setGstReport(report);
      setReportModalVisible(true);
    } catch (error) {
      console.error('Error generating GST report:', error);
      Alert.alert('Error', 'Failed to generate GST report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveGSTData = async () => {
    Keyboard.dismiss();
    try {
      await AsyncStorage.setItem('@gst_data', JSON.stringify(gstData));
      Alert.alert('Success', 'GST return data saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save GST data.');
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
            <Text style={styles.stepTitle}>Business Information</Text>
            <Text style={styles.stepSubtitle}>Enter your GST registration details for EasyTax</Text>
            
            <InputField
              label="GSTIN"
              value={gstData.businessInfo.gstin}
              onChangeText={(value) => updateGstData('businessInfo', 'gstin', value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              isRequired
              returnKeyType="next"
              onSubmitEditing={() => legalNameRef.current?.focus()}
            />
            
            <InputField
              label="Legal Name"
              value={gstData.businessInfo.legalName}
              onChangeText={(value) => updateGstData('businessInfo', 'legalName', value)}
              placeholder="Legal business name as per GST certificate"
              isRequired
              ref={legalNameRef}
              returnKeyType="next"
              onSubmitEditing={() => tradeNameRef.current?.focus()}
            />
            
            <InputField
              label="Trade Name"
              value={gstData.businessInfo.tradeName}
              onChangeText={(value) => updateGstData('businessInfo', 'tradeName', value)}
              placeholder="Trade/Brand name (if different)"
              ref={tradeNameRef}
              returnKeyType="done"
            />
            
            <PickerField
              label="Business Type"
              value={gstData.businessInfo.businessType}
              onValueChange={(value) => updateGstData('businessInfo', 'businessType', value)}
              items={businessTypes}
              isRequired
              placeholder="Select business type..."
            />
            
            <PickerField
              label="Return Type"
              value={gstData.businessInfo.returnType}
              onValueChange={(value) => updateGstData('businessInfo', 'returnType', value)}
              items={returnTypes}
              isRequired
              placeholder="Select return type..."
            />

            <View style={styles.monthYearContainer}>
              <View style={styles.monthYearItem}>
                <PickerField
                  label="Filing Month"
                  value={selectedMonth}
                  onValueChange={(value) => {
                    setSelectedMonth(value);
                    updateGstData('businessInfo', 'filingMonth', getMonthName(value));
                  }}
                  items={months}
                  isRequired
                  placeholder="Select month..."
                />
              </View>
              
              <View style={styles.monthYearItem}>
                <PickerField
                  label="Filing Year"
                  value={selectedYear}
                  onValueChange={(value) => {
                    setSelectedYear(value);
                    updateGstData('businessInfo', 'filingYear', value.toString());
                  }}
                  items={years}
                  isRequired
                  placeholder="Select year..."
                />
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Outward Supplies (Sales)</Text>
            <Text style={styles.stepSubtitle}>Enter your sales data for {gstData.businessInfo.filingMonth} {gstData.businessInfo.filingYear}</Text>
            
            <InputField
              label="B2B Supplies (Taxable Value)"
              value={gstData.outwardSupplies.b2bSupplies}
              onChangeText={(value) => updateGstData('outwardSupplies', 'b2bSupplies', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={b2bSuppliesRef}
              onSubmitEditing={() => b2cSuppliesRef.current?.focus()}
            />
            
            <InputField
              label="B2C Supplies (Taxable Value)"
              value={gstData.outwardSupplies.b2cSupplies}
              onChangeText={(value) => updateGstData('outwardSupplies', 'b2cSupplies', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={b2cSuppliesRef}
              onSubmitEditing={() => exportSuppliesRef.current?.focus()}
            />
            
            <InputField
              label="Export Supplies (Taxable Value)"
              value={gstData.outwardSupplies.exportSupplies}
              onChangeText={(value) => updateGstData('outwardSupplies', 'exportSupplies', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={exportSuppliesRef}
              onSubmitEditing={() => exemptSuppliesRef.current?.focus()}
            />
            
            <InputField
              label="Exempt Supplies"
              value={gstData.outwardSupplies.exemptSupplies}
              onChangeText={(value) => updateGstData('outwardSupplies', 'exemptSupplies', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={exemptSuppliesRef}
              onSubmitEditing={() => nilRatedSuppliesRef.current?.focus()}
            />
            
            <InputField
              label="Nil Rated Supplies"
              value={gstData.outwardSupplies.nilRatedSupplies}
              onChangeText={(value) => updateGstData('outwardSupplies', 'nilRatedSupplies', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="done"
              ref={nilRatedSuppliesRef}
            />

            <Text style={styles.sectionHeader}>Output GST Amount</Text>
            
            <View style={styles.gstAmountRow}>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="CGST"
                  value={gstData.outwardSupplies.cgstAmount}
                  onChangeText={(value) => updateGstData('outwardSupplies', 'cgstAmount', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  returnKeyType="next"
                  ref={cgstAmountRef}
                  onSubmitEditing={() => sgstAmountRef.current?.focus()}
                />
              </View>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="SGST/UTGST"
                  value={gstData.outwardSupplies.sgstAmount}
                  onChangeText={(value) => updateGstData('outwardSupplies', 'sgstAmount', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  returnKeyType="next"
                  ref={sgstAmountRef}
                  onSubmitEditing={() => igstAmountRef.current?.focus()}
                />
              </View>
            </View>
            
            <View style={styles.gstAmountRow}>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="IGST"
                  value={gstData.outwardSupplies.igstAmount}
                  onChangeText={(value) => updateGstData('outwardSupplies', 'igstAmount', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  returnKeyType="next"
                  ref={igstAmountRef}
                  onSubmitEditing={() => cessAmountRef.current?.focus()}
                />
              </View>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="Cess"
                  value={gstData.outwardSupplies.cessAmount}
                  onChangeText={(value) => updateGstData('outwardSupplies', 'cessAmount', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  returnKeyType="done"
                  ref={cessAmountRef}
                />
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Inward Supplies (Purchases)</Text>
            <Text style={styles.stepSubtitle}>Enter your purchase data and eligible ITC</Text>
            
            <InputField
              label="B2B Purchases (Taxable Value)"
              value={gstData.inwardSupplies.b2bPurchases}
              onChangeText={(value) => updateGstData('inwardSupplies', 'b2bPurchases', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={b2bPurchasesRef}
              onSubmitEditing={() => importGoodsRef.current?.focus()}
            />
            
            <InputField
              label="Import of Goods"
              value={gstData.inwardSupplies.importGoods}
              onChangeText={(value) => updateGstData('inwardSupplies', 'importGoods', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={importGoodsRef}
              onSubmitEditing={() => importServicesRef.current?.focus()}
            />
            
            <InputField
              label="Import of Services"
              value={gstData.inwardSupplies.importServices}
              onChangeText={(value) => updateGstData('inwardSupplies', 'importServices', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="next"
              ref={importServicesRef}
              onSubmitEditing={() => inwardSuppliesLiableToRCMRef.current?.focus()}
            />
            
            <InputField
              label="Inward Supplies liable to RCM"
              value={gstData.inwardSupplies.inwardSuppliesLiableToRCM}
              onChangeText={(value) => updateGstData('inwardSupplies', 'inwardSuppliesLiableToRCM', value)}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="done"
              ref={inwardSuppliesLiableToRCMRef}
            />

            <Text style={styles.sectionHeader}>Input Tax Credit (ITC)</Text>
            
            <View style={styles.gstAmountRow}>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="ITC CGST"
                  value={gstData.inwardSupplies.itcCgst}
                  onChangeText={(value) => updateGstData('inwardSupplies', 'itcCgst', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  returnKeyType="next"
                  ref={itcCgstRef}
                  onSubmitEditing={() => itcSgstRef.current?.focus()}
                />
              </View>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="ITC SGST"
                  value={gstData.inwardSupplies.itcSgst}
                  onChangeText={(value) => updateGstData('inwardSupplies', 'itcSgst', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  returnKeyType="next"
                  ref={itcSgstRef}
                  onSubmitEditing={() => itcIgstRef.current?.focus()}
                />
              </View>
            </View>
            
            <View style={styles.gstAmountRow}>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="ITC IGST"
                  value={gstData.inwardSupplies.itcIgst}
                  onChangeText={(value) => updateGstData('inwardSupplies', 'itcIgst', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  returnKeyType="next"
                  ref={itcIgstRef}
                  onSubmitEditing={() => itcCessRef.current?.focus()}
                />
              </View>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="ITC Cess"
                  value={gstData.inwardSupplies.itcCess}
                  onChangeText={(value) => updateGstData('inwardSupplies', 'itcCess', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  returnKeyType="done"
                  ref={itcCessRef}
                />
              </View>
            </View>
            
            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={20} color="#F8B259" />
              <Text style={styles.infoText}>
                Ensure all ITC amounts are eligible and supported by valid tax invoices.
              </Text>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>GST Liability & Payments</Text>
            <Text style={styles.stepSubtitle}>Calculate and enter GST payments made</Text>
            
            {(() => {
              const calculations = calculateGSTAmounts();
              return (
                <>
                  <View style={styles.calculationCard}>
                    <Text style={styles.calculationTitle}>GST Liability Calculation</Text>
                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>Total Turnover:</Text>
                      <Text style={styles.calculationValue}>₹{calculations.totalTurnover.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>Output GST:</Text>
                      <Text style={styles.calculationValue}>₹{calculations.outputGST.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>Less: ITC:</Text>
                      <Text style={styles.calculationValue}>₹{calculations.inputGST.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={[styles.calculationRow, styles.calculationHighlight]}>
                      <Text style={styles.calculationLabelHighlight}>Net GST Payable:</Text>
                      <Text style={styles.calculationValueHighlight}>₹{calculations.netGstPayable.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                </>
              );
            })()}
            
            <Text style={styles.sectionHeader}>GST Payments Made</Text>
            
            <View style={styles.gstAmountRow}>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="CGST Paid"
                  value={gstData.gstPayment.cgstPayable}
                  onChangeText={(value) => updateGstData('gstPayment', 'cgstPayable', value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="SGST Paid"
                  value={gstData.gstPayment.sgstPayable}
                  onChangeText={(value) => updateGstData('gstPayment', 'sgstPayable', value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.gstAmountRow}>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="IGST Paid"
                  value={gstData.gstPayment.igstPayable}
                  onChangeText={(value) => updateGstData('gstPayment', 'igstPayable', value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gstAmountItem}>
                <InputField
                  label="Cess Paid"
                  value={gstData.gstPayment.cessPayable}
                  onChangeText={(value) => updateGstData('gstPayment', 'cessPayable', value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <InputField
              label="Interest Paid (if any)"
              value={gstData.gstPayment.interestPayable}
              onChangeText={(value) => updateGstData('gstPayment', 'interestPayable', value)}
              placeholder="0"
              keyboardType="numeric"
            />
            
            <InputField
              label="Late Fee Paid"
              value={gstData.gstPayment.lateFee}
              onChangeText={(value) => updateGstData('gstPayment', 'lateFee', value)}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        );

      case 5:
        // Parse numbers from strings for calculation and display
        const calculations = calculateGSTAmounts();
        const totalPayments = Object.values(gstData.gstPayment).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
        
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & File GST Return</Text>
            <Text style={styles.stepSubtitle}>Review your GST return with EasyTax before filing</Text>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Return Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Return Type:</Text>
                <Text style={styles.summaryValue}>{gstData.businessInfo.returnType}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Period:</Text>
                <Text style={styles.summaryValue}>{gstData.businessInfo.filingMonth} {gstData.businessInfo.filingYear}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Turnover:</Text>
                <Text style={styles.summaryValue}>
                  ₹{calculations.totalTurnover.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Net GST Payable:</Text>
                <Text style={styles.summaryValue}>
                  ₹{calculations.netGstPayable.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total GST Paid:</Text>
                <Text style={styles.summaryValue}>
                  ₹{totalPayments.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.generateReportBtn} onPress={generateReport}>
              <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.generateReportGradient}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="assessment" size={20} color="#ffffff" />
                    <Text style={styles.generateReportText}>Generate EasyTax GST Report</Text>
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
      <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>EasyTax GST Returns</Text>
          <TouchableOpacity style={styles.saveButton} onPress={saveGSTData}>
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
            <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.nextButtonGradient}>
              <Text style={styles.nextButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* GST Report Modal */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>EasyTax GST Report</Text>
            <TouchableOpacity onPress={() => setReportModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>
          
          {gstReport && (
            <ScrollView style={styles.reportContent}>
              <View style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <MaterialCommunityIcons name="calculator-variant" size={24} color="#D96F32" />
                  <Text style={styles.reportTitle}>GST Return Summary</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Return Period:</Text>
                  <Text style={styles.reportValue}>{gstReport.period}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Total Turnover:</Text>
                  <Text style={styles.reportValue}>₹{gstReport.totalTurnover?.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Output GST:</Text>
                  <Text style={styles.reportValue}>₹{gstReport.outputGST?.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>ITC Availed:</Text>
                  <Text style={styles.reportValue}>₹{gstReport.itcAvailed?.toLocaleString('en-IN')}</Text>
                </View>
                <View style={[styles.reportRow, styles.reportRowHighlight]}>
                  <Text style={styles.reportLabelHighlight}>Net GST Payable:</Text>
                  <Text style={styles.reportValueHighlight}>₹{gstReport.netPayable?.toLocaleString('en-IN')}</Text>
                </View>
              </View>

              <View style={styles.reportCard}>
                <Text style={styles.reportTitle}>Compliance Status</Text>
                <Text style={styles.recommendationText}>{gstReport.complianceStatus}</Text>
              </View>

              <View style={styles.reportCard}>
                <Text style={styles.reportTitle}>EasyTax Recommendations</Text>
                <Text style={styles.recommendationText}>{gstReport.recommendations}</Text>
              </View>

              <TouchableOpacity style={styles.fileGSTButton}>
                <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.fileGSTGradient}>
                  <MaterialIcons name="cloud-upload" size={20} color="#ffffff" />
                  <Text style={styles.fileGSTText}>File GST Return with EasyTax</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Styles for react-native-picker-select
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
    borderRadius: 12,
    color: '#2D1810',
    paddingRight: 30,
    backgroundColor: '#F9F9F9',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
    borderRadius: 12,
    color: '#2D1810',
    paddingRight: 30,
    backgroundColor: '#F9F9F9',
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  headerGradient: {
    paddingBottom: 20,
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
    paddingBottom: 15,
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
  saveButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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
  required: {
    color: '#EF4444',
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
  pickerContainer: {
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  monthYearContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  monthYearItem: {
    flex: 1,
  },
  gstAmountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gstAmountItem: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D1810',
    marginTop: 20,
    marginBottom: 16,
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
  calculationCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#8B7355',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
  },
  calculationHighlight: {
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  calculationLabelHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D96F32',
  },
  calculationValueHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D96F32',
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
    shadowColor: '#F8B259',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
    color: '#D96F32',
  },
  recommendationText: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
  },
  fileGSTButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#F8B259',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fileGSTGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  fileGSTText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default GSTReturns;
