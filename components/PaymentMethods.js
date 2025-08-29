// screens/PaymentMethods.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const PREMIUM_FEATURES = [
  {
    icon: 'calculate',
    title: 'Advanced Tax Calculations',
    subtitle: 'Complex tax scenarios & planning',
    color: '#D96F32',
  },
  {
    icon: 'bookmark',
    title: 'Save Tax Consultations',
    subtitle: 'Keep important tax advice',
    color: '#C75D2C',
  },
  {
    icon: 'share',
    title: 'Share Tax Reports',
    subtitle: 'Export & share with accountants',
    color: '#F8B259',
  },
  {
    icon: 'volume-up',
    title: 'Audio Tax Guidance',
    subtitle: 'Voice-enabled tax assistance',
    color: '#D96F32',
  },
  {
    icon: 'language',
    title: 'Multi-language Support',
    subtitle: 'Tax help in multiple languages',
    color: '#C75D2C',
  },
  {
    icon: 'priority-high',
    title: 'Priority Tax Support',
    subtitle: '24/7 premium tax assistance',
    color: '#F8B259',
  },
  {
    icon: 'analytics',
    title: 'Detailed Tax Analytics',
    subtitle: 'Comprehensive tax reports',
    color: '#D96F32',
  },
  {
    icon: 'file-download',
    title: 'Tax Document Exports',
    subtitle: 'ITR, PDF & Excel exports',
    color: '#C75D2C',
  },
  {
    icon: 'schedule',
    title: 'Tax Deadline Alerts',
    subtitle: 'Never miss filing deadlines',
    color: '#F8B259',
  },
  {
    icon: 'security',
    title: 'Enhanced Data Security',
    subtitle: 'Bank-grade tax data protection',
    color: '#D96F32',
  },
];

const PAYMENT_METHODS = [
  { id: 'card', icon: 'credit-card', name: 'Credit/Debit Card', subtitle: 'Visa, Mastercard, RuPay, Amex' },
  { id: 'upi', icon: 'account-balance-wallet', name: 'UPI Payment', subtitle: 'PhonePe, GPay, Paytm' },
  { id: 'netbanking', icon: 'account-balance', name: 'Net Banking', subtitle: 'All major Indian banks' },
  { id: 'wallet', icon: 'account-balance-wallet', name: 'Digital Wallet', subtitle: 'Paytm, Amazon Pay' },
];

const PaymentMethods = () => {
  const navigation = useNavigation();
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedPayment, setSelectedPayment] = useState('card');

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const premiumStatus = await AsyncStorage.getItem('@premium_status');
        setIsPremium(premiumStatus === 'true');
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };
    checkPremiumStatus();
  }, []);

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to EasyTax Premium',
      `Are you sure you want to upgrade to Premium ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            // Here you would integrate with actual payment processing
            await AsyncStorage.setItem('@premium_status', 'true');
            setIsPremium(true);
            Alert.alert('Success!', 'Welcome to EasyTax Premium! 🎉 Your tax filing just got easier.');
          }
        },
      ]
    );
  };

  const FeatureCard = ({ feature }) => (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
        <MaterialIcons name={feature.icon} size={24} color={feature.color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
      </View>
      <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
    </View>
  );

  const PlanCard = ({ planType, price, originalPrice, isPopular = false }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        selectedPlan === planType && styles.planCardSelected,
        isPopular && styles.planCardPopular
      ]}
      onPress={() => setSelectedPlan(planType)}
      activeOpacity={0.8}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>BEST VALUE</Text>
        </View>
      )}
      
      <Text style={styles.planType}>
        {planType === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}
      </Text>
      
      <View style={styles.priceContainer}>
        <Text style={styles.currencySymbol}>₹</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.pricePeriod}>/{planType === 'monthly' ? 'month' : 'year'}</Text>
      </View>
      
      {originalPrice && (
        <View style={styles.savingsContainer}>
          <Text style={styles.originalPrice}>₹{originalPrice}/year</Text>
          <Text style={styles.savings}>Save ₹{originalPrice - price}!</Text>
        </View>
      )}
      
      <Text style={styles.planDescription}>
        {planType === 'monthly' 
          ? 'Perfect for seasonal tax filing'
          : 'Best value - 2 months free!'
        }
      </Text>
    </TouchableOpacity>
  );

  const PaymentMethodCard = ({ method }) => (
    <TouchableOpacity
      style={[
        styles.paymentCard,
        selectedPayment === method.id && styles.paymentCardSelected
      ]}
      onPress={() => setSelectedPayment(method.id)}
      activeOpacity={0.7}
    >
      <View style={styles.paymentIcon}>
        <MaterialIcons name={method.icon} size={24} color="#D96F32" />
      </View>
      <View style={styles.paymentContent}>
        <Text style={styles.paymentName}>{method.name}</Text>
        <Text style={styles.paymentSubtitle}>{method.subtitle}</Text>
      </View>
      <View style={[
        styles.radioButton,
        selectedPayment === method.id && styles.radioButtonSelected
      ]}>
        {selectedPayment === method.id && (
          <View style={styles.radioButtonInner} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (isPremium) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#D96F32', '#C75D2C']}
          style={styles.headerGradient}
        >
          <SafeAreaView>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Premium Status</Text>
              <View style={styles.headerRight} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView style={styles.contentContainer}>
          <View style={styles.premiumStatusCard}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.statusGradient}
            >
              <MaterialIcons name="workspace-premium" size={64} color="#ffffff" />
              <Text style={styles.statusTitle}>Premium Member</Text>
              <Text style={styles.statusSubtitle}>Enjoying full tax consultation benefits</Text>
            </LinearGradient>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Premium Tax Features</Text>
            <Text style={styles.sectionSubtitle}>
              Access all advanced tax consultation features and priority support
            </Text>
            {PREMIUM_FEATURES.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </View>

          {/* Tax Season Info */}
          <View style={styles.taxSeasonCard}>
            <MaterialIcons name="event" size={32} color="#D96F32" />
            <Text style={styles.taxSeasonTitle}>Tax Season Ready</Text>
            <Text style={styles.taxSeasonText}>
              You're all set for tax filing season with premium features and priority support.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#D96F32', '#C75D2C']}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Upgrade to Premium</Text>
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.contentContainer}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <MaterialIcons name="workspace-premium" size={48} color="#D96F32" />
          <Text style={styles.heroTitle}>EasyTax Premium</Text>
          <Text style={styles.heroSubtitle}>
            Unlock advanced tax features and get priority support from certified tax experts
          </Text>
        </View>

        {/* Premium Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="star" size={28} color="#D96F32" />
            <Text style={styles.sectionTitle}>Premium Tax Features</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Everything you need for comprehensive tax planning and filing
          </Text>
          
          {PREMIUM_FEATURES.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </View>

        {/* Pricing Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <Text style={styles.sectionSubtitle}>
            Flexible pricing options for your tax consultation needs
          </Text>
          <View style={styles.plansContainer}>
            <PlanCard planType="monthly" price={999} />
            <PlanCard planType="yearly" price={9999} originalPrice={11988} isPopular={true} />
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text style={styles.sectionSubtitle}>
            Secure payment options available in India
          </Text>
          {PAYMENT_METHODS.map((method, index) => (
            <PaymentMethodCard key={index} method={method} />
          ))}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <MaterialIcons name="security" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We use bank-grade security.
          </Text>
        </View>

        {/* Upgrade Button */}
        <View style={styles.upgradeSection}>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D96F32', '#C75D2C']}
              style={styles.upgradeGradient}
            >
              <MaterialIcons name="workspace-premium" size={24} color="#ffffff" />
              <Text style={styles.upgradeText}>
                Upgrade to Premium - ₹{selectedPlan === 'monthly' ? '999/month' : '9,999/year'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            Cancel anytime. Your subscription will be charged to your selected payment method. All prices include applicable taxes.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

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
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
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
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#8B5A2B',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8B5A2B',
    marginBottom: 20,
    lineHeight: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#8B5A2B',
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F8B259',
    position: 'relative',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardSelected: {
    borderColor: '#D96F32',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  planCardPopular: {
    borderColor: '#4CAF50',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  planType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D96F32',
    marginRight: 2,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#D96F32',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#8B5A2B',
    marginLeft: 4,
  },
  savingsContainer: {
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#8B5A2B',
    textDecorationLine: 'line-through',
  },
  savings: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 12,
    color: '#8B5A2B',
    textAlign: 'center',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F8B259',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentCardSelected: {
    borderColor: '#D96F32',
    backgroundColor: '#FDF6E3',
    shadowOpacity: 0.1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentContent: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 13,
    color: '#8B5A2B',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F8B259',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#D96F32',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D96F32',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 16,
  },
  upgradeSection: {
    padding: 20,
    paddingBottom: 40,
  },
  upgradeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  upgradeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: '#8B5A2B',
    textAlign: 'center',
    lineHeight: 16,
  },
  premiumStatusCard: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  statusGradient: {
    padding: 40,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  taxSeasonCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  taxSeasonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 8,
  },
  taxSeasonText: {
    fontSize: 14,
    color: '#8B5A2B',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PaymentMethods;
