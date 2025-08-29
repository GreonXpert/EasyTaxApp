// components/About.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Linking,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const teamMembers = [
  {
    name: 'Mohamed Fazil',
    role: 'Chief Technology Officer & CA',
    expertise: 'Tax Technology & AI Systems',
    icon: 'account-tie',
    color: '#D96F32'
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Tax Compliance',
    expertise: 'Income Tax & GST Expert',
    icon: 'certificate',
    color: '#C75D2C'
  },
  {
    name: 'Rajesh Kumar',
    role: 'Lead Tax Consultant',
    expertise: 'Corporate Tax & Planning',
    icon: 'calculator-variant',
    color: '#F8B259'
  }
];

const features = [
  {
    title: 'AI-Powered Tax Filing',
    description: 'Advanced algorithms for accurate ITR preparation and filing with 100% compliance',
    icon: 'robot',
    color: '#D96F32',
    metrics: '99.9% Accuracy'
  },
  {
    title: 'GST Automation',
    description: 'Complete GST lifecycle management from registration to returns filing',
    icon: 'autorenew',
    color: '#C75D2C',
    metrics: 'Real-time Sync'
  },
  {
    title: 'Tax Compliance',
    description: 'Adherence to IT Act, GST Laws, and all Indian taxation regulations',
    icon: 'shield-check',
    color: '#F8B259',
    metrics: '100% Compliant'
  },
  {
    title: 'Smart Tax Planning',
    description: 'AI-driven tax optimization and savings recommendations',
    icon: 'lightbulb',
    color: '#8B4513',
    metrics: 'Max Savings'
  }
];

const achievements = [
  { label: 'ITRs Filed', value: '50,000+', icon: 'file-document' },
  { label: 'Tax Saved', value: '₹500 Cr+', icon: 'currency-inr' },
  { label: 'Happy Clients', value: '25,000+', icon: 'account-heart' },
  { label: 'Years Experience', value: '15+', icon: 'clock-outline' }
];

const About = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('overview');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, []);

  const handleSocialPress = (platform) => {
    const urls = {
      website: 'https://easytax.in',
      linkedin: 'https://linkedin.com/company/easytax',
      twitter: 'https://twitter.com/easytax_in',
      email: 'mailto:support@easytax.in'
    };
    
    if (urls[platform]) {
      Linking.openURL(urls[platform]).catch(() => 
        Alert.alert('Error', 'Could not open link')
      );
    }
  };

  const TabButton = ({ id, title, icon }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === id && styles.activeTabButton]}
      onPress={() => setActiveTab(id)}
    >
      <Feather 
        name={icon} 
        size={18} 
        color={activeTab === id ? '#ffffff' : '#8B7355'} 
      />
      <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const FeatureCard = ({ feature }) => (
    <View style={styles.featureCard}>
      <LinearGradient
        colors={[feature.color, `${feature.color}CC`]}
        style={styles.featureIcon}
      >
        {feature.icon === 'robot' ? (
          <MaterialCommunityIcons name={feature.icon} size={24} color="#ffffff" />
        ) : (
          <MaterialCommunityIcons name={feature.icon} size={24} color="#ffffff" />
        )}
      </LinearGradient>
      <View style={styles.featureContent}>
        <View style={styles.featureHeader}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <View style={styles.featureMetric}>
            <Text style={styles.featureMetricText}>{feature.metrics}</Text>
          </View>
        </View>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  const TeamMember = ({ member }) => (
    <View style={styles.teamMember}>
      <LinearGradient
        colors={[member.color, `${member.color}CC`]}
        style={styles.memberAvatar}
      >
        <MaterialCommunityIcons name={member.icon} size={24} color="#ffffff" />
      </LinearGradient>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
        <Text style={styles.memberExpertise}>{member.expertise}</Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            {/* Mission Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#D96F32', '#C75D2C']}
                  style={styles.iconContainer}
                >
                  <MaterialCommunityIcons name="target" size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Our Mission</Text>
              </View>
              <Text style={styles.missionText}>
                To democratize tax expertise through cutting-edge AI technology, 
                empowering individuals and businesses across India to navigate complex 
                tax regulations with confidence, accuracy, and maximum savings.
              </Text>
              <View style={styles.visionCard}>
                <Text style={styles.visionTitle}>🇮🇳 Vision 2030</Text>
                <Text style={styles.visionText}>
                  A tax-compliant India where every citizen and business has access to 
                  professional-grade tax services powered by AI, making tax filing simple, 
                  accurate, and stress-free.
                </Text>
              </View>
            </View>

            {/* Achievements */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#F8B259', '#D96F32']}
                  style={styles.iconContainer}
                >
                  <MaterialCommunityIcons name="chart-line" size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Impact Metrics</Text>
              </View>
              <View style={styles.achievementsGrid}>
                {achievements.map((achievement, index) => (
                  <View key={index} style={styles.achievementCard}>
                    <View style={styles.achievementIcon}>
                      <MaterialCommunityIcons name={achievement.icon} size={20} color="#D96F32" />
                    </View>
                    <Text style={styles.achievementValue}>{achievement.value}</Text>
                    <Text style={styles.achievementLabel}>{achievement.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Certifications & Compliance */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#C75D2C', '#8B4513']}
                  style={styles.iconContainer}
                >
                  <MaterialCommunityIcons name="shield-check" size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Certifications & Compliance</Text>
              </View>
              <View style={styles.complianceGrid}>
                <View style={styles.complianceItem}>
                  <Text style={styles.complianceIcon}>📋</Text>
                  <Text style={styles.complianceText}>ICAI Certified</Text>
                </View>
                <View style={styles.complianceItem}>
                  <Text style={styles.complianceIcon}>🛡️</Text>
                  <Text style={styles.complianceText}>ISO 27001</Text>
                </View>
                <View style={styles.complianceItem}>
                  <Text style={styles.complianceIcon}>🔐</Text>
                  <Text style={styles.complianceText}>Bank Grade Security</Text>
                </View>
                <View style={styles.complianceItem}>
                  <Text style={styles.complianceIcon}>⚖️</Text>
                  <Text style={styles.complianceText}>IT Act Compliant</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'features':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#F8B259', '#D96F32']}
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons name="feature-search" size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Core Tax Services</Text>
            </View>
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
            
            {/* Technology Stack */}
            <View style={styles.techSection}>
              <Text style={styles.techTitle}>🚀 Technology & Security Stack</Text>
              <View style={styles.techGrid}>
                <View style={styles.techItem}>
                  <Text style={styles.techLabel}>AI/ML</Text>
                  <Text style={styles.techValue}>Tax Intelligence Engine</Text>
                </View>
                <View style={styles.techItem}>
                  <Text style={styles.techLabel}>Security</Text>
                  <Text style={styles.techValue}>256-bit SSL Encryption</Text>
                </View>
                <View style={styles.techItem}>
                  <Text style={styles.techLabel}>Compliance</Text>
                  <Text style={styles.techValue}>RBI Data Localization</Text>
                </View>
                <View style={styles.techItem}>
                  <Text style={styles.techLabel}>Platform</Text>
                  <Text style={styles.techValue}>React Native</Text>
                </View>
              </View>
            </View>

            {/* Service Coverage */}
            <View style={styles.serviceSection}>
              <Text style={styles.serviceTitle}>📍 Service Coverage</Text>
              <View style={styles.serviceGrid}>
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceNumber}>28+</Text>
                  <Text style={styles.serviceLabel}>States & UTs</Text>
                </View>
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceNumber}>500+</Text>
                  <Text style={styles.serviceLabel}>Cities</Text>
                </View>
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceNumber}>24/7</Text>
                  <Text style={styles.serviceLabel}>Support</Text>
                </View>
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceNumber}>12+</Text>
                  <Text style={styles.serviceLabel}>Languages</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'team':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#D96F32', '#C75D2C']}
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons name="account-group" size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Expert Tax Team</Text>
            </View>
            <Text style={styles.teamDescription}>
              Our team of certified tax professionals combines decades of experience in 
              Indian taxation, technology, and client service to deliver exceptional results.
            </Text>
            {teamMembers.map((member, index) => (
              <TeamMember key={index} member={member} />
            ))}
            
            {/* Company Values */}
            <View style={styles.cultureSection}>
              <Text style={styles.cultureTitle}>🌟 Our Core Values</Text>
              <View style={styles.valuesList}>
                <View style={styles.valueItem}>
                  <Text style={styles.valueEmoji}>📊</Text>
                  <Text style={styles.valueText}>Accuracy & Precision</Text>
                </View>
                <View style={styles.valueItem}>
                  <Text style={styles.valueEmoji}>🤝</Text>
                  <Text style={styles.valueText}>Client Trust</Text>
                </View>
                <View style={styles.valueItem}>
                  <Text style={styles.valueEmoji}>⚡</Text>
                  <Text style={styles.valueText}>Innovation</Text>
                </View>
                <View style={styles.valueItem}>
                  <Text style={styles.valueEmoji}>🛡️</Text>
                  <Text style={styles.valueText}>Data Security</Text>
                </View>
              </View>
            </View>

            {/* Awards & Recognition */}
            <View style={styles.awardsSection}>
              <Text style={styles.awardsTitle}>🏆 Awards & Recognition</Text>
              <View style={styles.awardsList}>
                <Text style={styles.awardItem}>• Best Tax Technology Platform 2024</Text>
                <Text style={styles.awardItem}>• Most Trusted Tax Service Provider</Text>
                <Text style={styles.awardItem}>• Digital India Innovation Award</Text>
                <Text style={styles.awardItem}>• Customer Choice Award - Taxation</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D96F32" />
      
      {/* Header with Gradient Background */}
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
          <Text style={styles.headerTitle}>About EasyTax</Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => Alert.alert('Share', 'Share EasyTax with friends and family!')}
          >
            <Feather name="share-2" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <Animated.View 
          style={[
            styles.appInfoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.appLogo}>
            <LinearGradient
              colors={['#ffffff', '#F3E9DC']}
              style={styles.logoGradient}
            >
              <MaterialCommunityIcons name="calculator-variant" size={32} color="#D96F32" />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>EasyTax</Text>
          <Text style={styles.appTagline}>AI-Powered Tax Intelligence Platform</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton id="overview" title="Overview" icon="info" />
        <TabButton id="features" title="Services" icon="zap" />
        <TabButton id="team" title="Team" icon="users" />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {renderTabContent()}

          {/* Contact & Support */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#8B4513', '#D96F32']}
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons name="phone-in-talk" size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Get Tax Support</Text>
            </View>
            <View style={styles.supportContainer}>
              <TouchableOpacity 
                style={[styles.supportButton, { backgroundColor: '#25D366' }]}
                onPress={() => Linking.openURL('whatsapp://send?phone=+919876543210&text=Hello, I need tax assistance.')}
              >
                <MaterialCommunityIcons name="whatsapp" size={20} color="#ffffff" />
                <Text style={styles.supportText}>WhatsApp Support</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.supportButton, { backgroundColor: '#D96F32' }]}
                onPress={() => Linking.openURL('tel:+919876543210')}
              >
                <MaterialCommunityIcons name="phone" size={20} color="#ffffff" />
                <Text style={styles.supportText}>Call Expert</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Social Links */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#F8B259', '#D96F32']}
                style={styles.iconContainer}
              >
                <Feather name="link" size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Connect With EasyTax</Text>
            </View>
            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#0077b5' }]}
                onPress={() => handleSocialPress('linkedin')}
              >
                <Feather name="linkedin" size={20} color="#ffffff" />
                <Text style={styles.socialText}>LinkedIn</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#1da1f2' }]}
                onPress={() => handleSocialPress('twitter')}
              >
                <Feather name="twitter" size={20} color="#ffffff" />
                <Text style={styles.socialText}>Twitter</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#D96F32' }]}
                onPress={() => handleSocialPress('website')}
              >
                <Feather name="globe" size={20} color="#ffffff" />
                <Text style={styles.socialText}>Website</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#ea4335' }]}
                onPress={() => handleSocialPress('email')}
              >
                <Feather name="mail" size={20} color="#ffffff" />
                <Text style={styles.socialText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 EasyTax Solutions India Pvt Ltd. All rights reserved.
            </Text>
            <Text style={styles.footerSubtext}>
              Made in India 🇮🇳 • Trusted by 25,000+ taxpayers
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerSeparator}>•</Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.footerSeparator}>•</Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Tax Compliance</Text>
              </TouchableOpacity>
            </View>
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
  shareButton: {
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
    fontSize: 21,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  appLogo: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  versionText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    padding: 6,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#D96F32',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '700',
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
    marginRight: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    letterSpacing: 0.3,
  },
  missionText: {
    fontSize: 16,
    color: '#5D4E37',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  visionCard: {
    backgroundColor: 'rgba(217, 111, 50, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D96F32',
  },
  visionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C75D2C',
    marginBottom: 8,
  },
  visionText: {
    fontSize: 14,
    color: '#8B4513',
    lineHeight: 20,
    fontWeight: '500',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (width - 92) / 2,
    backgroundColor: 'rgba(243, 233, 220, 0.5)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  achievementIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D96F32',
    marginBottom: 4,
  },
  achievementLabel: {
    fontSize: 12,
    color: '#8B4513',
    textAlign: 'center',
    fontWeight: '600',
  },
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  complianceItem: {
    width: (width - 92) / 2,
    backgroundColor: 'rgba(248, 178, 89, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248, 178, 89, 0.3)',
  },
  complianceIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  complianceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B4513',
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(243, 233, 220, 0.3)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.15)',
  },
  featureIcon: {
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
  featureContent: {
    flex: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    flex: 1,
    letterSpacing: 0.2,
  },
  featureMetric: {
    backgroundColor: '#F8B259',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featureMetricText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
    fontWeight: '500',
  },
  techSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(217, 111, 50, 0.05)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  techTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C75D2C',
    marginBottom: 16,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  techItem: {
    width: (width - 124) / 2,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  techLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D96F32',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  techValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D1810',
  },
  serviceSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(248, 178, 89, 0.1)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(248, 178, 89, 0.3)',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8B4513',
    marginBottom: 16,
    textAlign: 'center',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceItem: {
    width: (width - 124) / 2,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(248, 178, 89, 0.3)',
  },
  serviceNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D96F32',
    marginBottom: 4,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B4513',
    textAlign: 'center',
  },
  teamDescription: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '500',
  },
  teamMember: {
    flexDirection: 'row',
    backgroundColor: 'rgba(243, 233, 220, 0.3)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.15)',
  },
  memberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  memberRole: {
    fontSize: 14,
    color: '#D96F32',
    fontWeight: '700',
    marginBottom: 3,
  },
  memberExpertise: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '500',
  },
  cultureSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(248, 178, 89, 0.1)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(248, 178, 89, 0.3)',
  },
  cultureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C75D2C',
    marginBottom: 16,
    textAlign: 'center',
  },
  valuesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valueItem: {
    width: (width - 124) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(248, 178, 89, 0.3)',
  },
  valueEmoji: {
    fontSize: 20,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B4513',
    flex: 1,
  },
  awardsSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(199, 93, 44, 0.1)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(199, 93, 44, 0.3)',
  },
  awardsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C75D2C',
    marginBottom: 16,
  },
  awardsList: {
    gap: 8,
  },
  awardItem: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '500',
    lineHeight: 20,
  },
  supportContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  supportText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    width: (width - 92) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  socialText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    borderTopWidth: 2,
    borderTopColor: 'rgba(217, 111, 50, 0.2)',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 12,
    color: '#D96F32',
    fontWeight: '700',
  },
  footerSeparator: {
    fontSize: 12,
    color: '#8B7355',
  },
});

export default About;
