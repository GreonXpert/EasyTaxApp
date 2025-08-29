// components/HelpCenter.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Alert,
  Linking,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const faqs = [
  { 
    question: 'What is EasyTax and how does it help with Indian taxation?', 
    answer: 'EasyTax is India\'s leading AI-powered tax consultation platform. We help individuals and businesses with Income Tax filing, GST compliance, TDS management, and comprehensive tax planning. Our certified tax experts ensure compliance with latest Indian tax laws and regulations.',
    category: 'General'
  },
  { 
    question: 'Which tax services do you provide for Indian taxpayers?', 
    answer: 'We provide comprehensive tax services including: ITR filing (all forms), GST registration and returns, TDS compliance, tax planning and optimization, audit support, advance tax calculations, and business tax consultation for Indian entities.',
    category: 'Services'
  },
  { 
    question: 'How do I file my Income Tax Return (ITR) online?', 
    answer: 'Simply upload your documents, chat with our AI tax assistant, and we\'ll guide you through ITR filing. We support all ITR forms (ITR-1 to ITR-7), ensure accurate calculations, and file directly with the Income Tax Department of India.',
    category: 'Income Tax'
  },
  { 
    question: 'Can you help with GST registration and compliance?', 
    answer: 'Absolutely! Our GST experts help with registration, GSTR-1/3B filing, input tax credit optimization, GST audit, annual returns (GSTR-9), and handling GST notices. We ensure timely compliance with GSTN requirements.',
    category: 'GST'
  },
  { 
    question: 'Is my financial data secure with bank-grade encryption?', 
    answer: 'Yes! We use 256-bit SSL encryption, secure cloud storage, and comply with RBI data localization norms. Your Aadhaar, PAN, and financial data are completely secure and never shared with third parties.',
    category: 'Security'
  },
  { 
    question: 'What are your tax consultation charges and packages?', 
    answer: 'We offer transparent pricing: Basic ITR filing from ₹499, GST compliance from ₹999/month, comprehensive tax planning from ₹2999. No hidden charges, and we provide detailed invoices for all services.',
    category: 'Pricing'
  },
  {
    question: 'Do you handle TDS compliance and Form 16 issues?',
    answer: 'Yes! We help with TDS calculations, quarterly returns (24Q, 26Q, 27Q), TDS reconciliation, Form 16 verification, and resolving TDS mismatches. Our experts ensure proper TDS compliance for businesses.',
    category: 'TDS'
  },
  {
    question: 'Can you help with tax planning and investment advice?',
    answer: 'Our certified tax planners help optimize your tax liability through Section 80C, 80D investments, tax-saving mutual funds, ELSS, PPF planning, and suggest the best tax-saving strategies based on your income profile.',
    category: 'Planning'
  }
];

const supportOptions = [
  {
    title: 'AI Tax Assistant',
    subtitle: 'Get instant tax answers 24/7',
    icon: 'robot',
    iconLib: 'MaterialCommunityIcons',
    color: '#D96F32',
    action: () => Alert.alert('AI Assistant', 'Connect with EasyTax AI for instant tax guidance!')
  },
  {
    title: 'CA Consultation',
    subtitle: 'Book session with certified CAs',
    icon: 'account-tie',
    iconLib: 'MaterialCommunityIcons',
    color: '#C75D2C',
    action: () => Alert.alert('CA Consultation', 'Schedule a session with our certified Chartered Accountants!')
  },
  {
    title: 'Tax Emergency',
    subtitle: 'Urgent tax issue resolution',
    icon: 'phone',
    iconLib: 'Feather',
    color: '#F8B259',
    action: () => Linking.openURL('tel:+919876543210')
  },
  {
    title: 'ITR Filing Portal',
    subtitle: 'Direct access to filing system',
    icon: 'file-document',
    iconLib: 'MaterialCommunityIcons',
    color: '#8B4513',
    action: () => Alert.alert('ITR Portal', 'Access our secure ITR filing portal!')
  }
];

const FaqItem = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleOpen = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsOpen(!isOpen);
  };

  const heightInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity onPress={toggleOpen} style={styles.questionContainer}>
        <View style={styles.questionContent}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.question}>{item.question}</Text>
        </View>
        <Animated.View 
          style={[
            styles.expandIcon, 
            { 
              transform: [{ 
                rotate: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg']
                })
              }] 
            }
          ]}
        >
          <Feather name="chevron-down" size={20} color="#D96F32" />
        </Animated.View>
      </TouchableOpacity>
      
      <Animated.View style={[styles.answerContainer, { maxHeight: heightInterpolation }]}>
        <View style={styles.answerContent}>
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    'General': '#D96F32',
    'Services': '#C75D2C',
    'Income Tax': '#F8B259',
    'GST': '#8B4513',
    'Security': '#D96F32',
    'Pricing': '#C75D2C',
    'TDS': '#F8B259',
    'Planning': '#8B4513'
  };
  return colors[category] || '#D96F32';
};

const SupportOption = ({ option }) => {
  const IconComponent = option.iconLib === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Feather;
  
  return (
    <TouchableOpacity style={styles.supportOption} onPress={option.action}>
      <LinearGradient
        colors={[option.color, `${option.color}CC`]}
        style={styles.supportIcon}
      >
        <IconComponent name={option.icon} size={24} color="#ffffff" />
      </LinearGradient>
      <View style={styles.supportContent}>
        <Text style={styles.supportTitle}>{option.title}</Text>
        <Text style={styles.supportSubtitle}>{option.subtitle}</Text>
      </View>
      <View style={styles.supportArrow}>
        <Feather name="chevron-right" size={20} color="#8B4513" />
      </View>
    </TouchableOpacity>
  );
};

const HelpCenter = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D96F32" />
      
      {/* ✅ Enhanced Header with EasyTax Branding */}
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
            <Feather name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Tax Help Center</Text>
            <View style={styles.expertBadge}>
              <MaterialCommunityIcons name="shield-check" size={12} color="#D96F32" />
              <Text style={styles.expertBadgeText}>CERTIFIED</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Feather name="search" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* ✅ Enhanced Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIconContainer}>
            <MaterialCommunityIcons name="account-tie" size={32} color="#ffffff" />
          </View>
          <Text style={styles.welcomeTitle}>Expert Tax Guidance</Text>
          <Text style={styles.welcomeSubtitle}>
            Get professional help with Income Tax, GST, TDS, and comprehensive tax planning from certified experts
          </Text>
          
          {/* ✅ Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>ITR Filed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>AI Support</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Secure</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* ✅ Enhanced Quick Support Options */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#D96F32', '#C75D2C']}
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons name="headset" size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Instant Tax Support</Text>
            </View>
            
            <View style={styles.supportGrid}>
              {supportOptions.map((option, index) => (
                <SupportOption key={index} option={option} />
              ))}
            </View>
          </View>

          {/* ✅ Enhanced FAQ Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#F8B259', '#D96F32']}
                style={styles.iconContainer}
              >
                <Feather name="help-circle" size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Tax Questions & Answers</Text>
            </View>
            
            <View style={styles.faqContainer}>
              {filteredFaqs.map((faq, index) => (
                <FaqItem key={index} item={faq} index={index} />
              ))}
            </View>
          </View>

          {/* ✅ Enhanced Contact Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#C75D2C', '#8B4513']}
                style={styles.iconContainer}
              >
                <Feather name="phone" size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Contact Our Tax Experts</Text>
            </View>
            
            <View style={styles.contactCard}>
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Feather name="mail" size={16} color="#D96F32" />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactText}>support@easytax.in</Text>
                  <Text style={styles.contactSubtext}>General inquiries & support</Text>
                </View>
              </View>
              
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Feather name="phone" size={16} color="#D96F32" />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactText}>+91 98765 43210</Text>
                  <Text style={styles.contactSubtext}>Tax emergency hotline</Text>
                </View>
              </View>
              
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <MaterialCommunityIcons name="whatsapp" size={16} color="#D96F32" />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactText}>WhatsApp Tax Support</Text>
                  <Text style={styles.contactSubtext}>Quick queries & document sharing</Text>
                </View>
              </View>
              
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Feather name="clock" size={16} color="#F8B259" />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactText}>Mon-Sat: 9 AM - 8 PM IST</Text>
                  <Text style={styles.contactSubtext}>Extended hours during tax season</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ✅ Enhanced Tax Season Notice */}
          <View style={styles.importantNotice}>
            <LinearGradient
              colors={['rgba(248, 178, 89, 0.1)', 'rgba(217, 111, 50, 0.05)']}
              style={styles.noticeGradient}
            >
              <View style={styles.noticeHeader}>
                <View style={styles.noticeIconContainer}>
                  <MaterialIcons name="schedule" size={24} color="#D96F32" />
                </View>
                <Text style={styles.noticeTitle}>Important Tax Deadlines 2025-26</Text>
              </View>
              
              <View style={styles.noticeContent}>
                <View style={styles.noticeItem}>
                  <Text style={styles.noticeEmoji}>📅</Text>
                  <View>
                    <Text style={styles.noticeItemTitle}>ITR Filing Deadline</Text>
                    <Text style={styles.noticeItemText}>July 31, 2026 (Individual) • Oct 31, 2026 (Audit)</Text>
                  </View>
                </View>
                
                <View style={styles.noticeItem}>
                  <Text style={styles.noticeEmoji}>💰</Text>
                  <View>
                    <Text style={styles.noticeItemTitle}>Advance Tax Installments</Text>
                    <Text style={styles.noticeItemText}>Jun 15 • Sep 15 • Dec 15 • Mar 15</Text>
                  </View>
                </View>
                
                <View style={styles.noticeItem}>
                  <Text style={styles.noticeEmoji}>📋</Text>
                  <View>
                    <Text style={styles.noticeItemTitle}>GST Returns</Text>
                    <Text style={styles.noticeItemText}>GSTR-1: 11th • GSTR-3B: 20th of every month</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* ✅ App Version & Security Info */}
          <View style={styles.footerSection}>
            <View style={styles.securityInfo}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#D96F32" />
              <Text style={styles.securityText}>Bank-grade security • RBI compliant • SSL encrypted</Text>
            </View>
            <Text style={styles.versionText}>EasyTax v1.0.0 • Build 2025.08.28 • Made in India 🇮🇳</Text>
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
    paddingBottom: 30,
    elevation: 12,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
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
  headerTitleContainer: {
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  expertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  expertBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D96F32',
    letterSpacing: 0.5,
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  welcomeSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  welcomeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 15,
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
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
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
    marginRight: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    letterSpacing: 0.3,
  },
  supportGrid: {
    gap: 14,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: 'rgba(243, 233, 220, 0.5)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.15)',
  },
  supportIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  supportSubtitle: {
    fontSize: 13,
    color: '#8B4513',
    fontWeight: '600',
  },
  supportArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqContainer: {
    gap: 14,
  },
  faqItem: {
    backgroundColor: 'rgba(243, 233, 220, 0.3)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.15)',
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
  },
  questionContent: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  expandIcon: {
    marginLeft: 12,
    marginTop: 4,
  },
  answerContainer: {
    overflow: 'hidden',
  },
  answerContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  answer: {
    fontSize: 14,
    color: '#5D4E37',
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  contactCard: {
    backgroundColor: 'rgba(243, 233, 220, 0.3)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.15)',
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  contactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 111, 50, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactText: {
    fontSize: 15,
    color: '#2D1810',
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  contactSubtext: {
    fontSize: 13,
    color: '#8B4513',
    fontWeight: '500',
  },
  importantNotice: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(217, 111, 50, 0.3)',
  },
  noticeGradient: {
    padding: 24,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  noticeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(217, 111, 50, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D96F32',
    letterSpacing: 0.3,
  },
  noticeContent: {
    gap: 14,
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noticeEmoji: {
    fontSize: 18,
    marginTop: 2,
  },
  noticeItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C75D2C',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  noticeItemText: {
    fontSize: 13,
    color: '#8B4513',
    fontWeight: '500',
    lineHeight: 18,
  },
  footerSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 111, 50, 0.2)',
    gap: 12,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  securityText: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
  },
  versionText: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HelpCenter;
