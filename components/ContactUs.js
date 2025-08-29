// components/ContactUs.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CONTACT = {
  name: 'Mohamed Fazil',
  title: 'Certified Tax Consultant & CA',
  company: 'EasyTax Solutions India',
  email: 'fazil@easytax.in',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  address: 'Tax Consultation Centre, Bangalore, India',
  experience: '15+ Years',
  specialization: 'Income Tax & GST Expert'
};

const ContactUs = () => {
  const navigation = useNavigation();

  const handleEmail = () => {
    Linking.openURL(`mailto:${CONTACT.email}?subject=Tax Consultation Inquiry`);
  };
  
  const handlePhone = () => {
    Linking.openURL(`tel:${CONTACT.phone}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${CONTACT.whatsapp}&text=Hello, I need tax consultation assistance.`);
  };

  const handleScheduleCall = () => {
    Alert.alert(
      'Schedule Tax Consultation',
      'Book a personalized tax consultation session with our certified experts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: () => Alert.alert('Booking', 'Redirecting to booking portal...') }
      ]
    );
  };

  const handleEmergencyTax = () => {
    Alert.alert(
      'Tax Emergency Support',
      'Get immediate assistance for urgent tax matters and compliance issues.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: handlePhone }
      ]
    );
  };

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Contact Tax Expert</Text>
            <View style={styles.headerBadge}>
              <MaterialCommunityIcons name="shield-check" size={12} color="#D96F32" />
              <Text style={styles.headerBadgeText}>CERTIFIED CA</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleEmergencyTax} style={styles.emergencyBtn}>
            <MaterialIcons name="support-agent" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ✅ Professional Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>ITR Filed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>15+</Text>
            <Text style={styles.statLabel}>Years Exp</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Support</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* ✅ Enhanced Professional Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['rgba(217, 111, 50, 0.1)', 'rgba(248, 178, 89, 0.05)']}
              style={styles.profileGradient}
            >
              <View style={styles.avatarSection}>
                <View style={styles.avatarCircle}>
                  <MaterialCommunityIcons name="account-tie" size={48} color="#D96F32" />
                  <View style={styles.certificationBadge}>
                    <MaterialIcons name="verified" size={16} color="#ffffff" />
                  </View>
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={styles.name}>{CONTACT.name}</Text>
                  <Text style={styles.title}>{CONTACT.title}</Text>
                  <Text style={styles.company}>{CONTACT.company}</Text>
                  
                  <View style={styles.credentialsRow}>
                    <View style={styles.credentialChip}>
                      <Text style={styles.credentialText}>CA Certified</Text>
                    </View>
                    <View style={styles.credentialChip}>
                      <Text style={styles.credentialText}>{CONTACT.experience}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* ✅ Enhanced Contact Options */}
              <View style={styles.contactSection}>
                <TouchableOpacity style={styles.primaryContactBtn} onPress={handlePhone}>
                  <LinearGradient
                    colors={['#D96F32', '#C75D2C']}
                    style={styles.contactBtnGradient}
                  >
                    <Feather name="phone-call" size={18} color="#ffffff" />
                    <Text style={styles.primaryContactText}>Call Now</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryContactBtn} onPress={handleWhatsApp}>
                  <MaterialCommunityIcons name="whatsapp" size={18} color="#25D366" />
                  <Text style={styles.secondaryContactText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.emailContactBtn} onPress={handleEmail}>
                <Feather name="mail" size={16} color="#8B4513" />
                <Text style={styles.emailContactText}>{CONTACT.email}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* ✅ Enhanced Business Hours Card */}
          <View style={styles.businessCard}>
            <View style={styles.businessHeader}>
              <LinearGradient
                colors={['#F8B259', '#D96F32']}
                style={styles.businessIconContainer}
              >
                <MaterialCommunityIcons name="clock-outline" size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.businessTitle}>Tax Consultation Hours</Text>
            </View>
            
            <View style={styles.businessContent}>
              <View style={styles.businessItem}>
                <MaterialIcons name="schedule" size={16} color="#D96F32" />
                <Text style={styles.businessText}>Monday - Friday: 9:00 AM - 8:00 PM</Text>
              </View>
              <View style={styles.businessItem}>
                <MaterialIcons name="weekend" size={16} color="#F8B259" />
                <Text style={styles.businessText}>Saturday: 10:00 AM - 6:00 PM</Text>
              </View>
              <View style={styles.businessItem}>
                <MaterialCommunityIcons name="calendar-check" size={16} color="#8B4513" />
                <Text style={styles.businessText}>Extended hours during tax season</Text>
              </View>
            </View>

            <View style={styles.timezoneInfo}>
              <MaterialIcons name="public" size={14} color="#8B7355" />
              <Text style={styles.timezoneText}>All times in IST (Indian Standard Time)</Text>
            </View>
          </View>

          {/* ✅ Enhanced Services Card */}
          <View style={styles.servicesCard}>
            <View style={styles.servicesHeader}>
              <LinearGradient
                colors={['#C75D2C', '#8B4513']}
                style={styles.servicesIconContainer}
              >
                <MaterialCommunityIcons name="briefcase-check" size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.servicesTitle}>Professional Tax Services</Text>
            </View>
            
            <View style={styles.servicesList}>
              <View style={styles.serviceCategory}>
                <Text style={styles.serviceCategoryTitle}>📋 Income Tax Services</Text>
                <Text style={styles.serviceItem}>• ITR Filing (All Forms: ITR-1 to ITR-7)</Text>
                <Text style={styles.serviceItem}>• Tax Planning & Optimization</Text>
                <Text style={styles.serviceItem}>• Advance Tax Calculations</Text>
              </View>

              <View style={styles.serviceCategory}>
                <Text style={styles.serviceCategoryTitle}>💼 Business Tax Solutions</Text>
                <Text style={styles.serviceItem}>• GST Registration & Returns</Text>
                <Text style={styles.serviceItem}>• TDS Compliance & Returns</Text>
                <Text style={styles.serviceItem}>• Corporate Tax Advisory</Text>
              </View>

              <View style={styles.serviceCategory}>
                <Text style={styles.serviceCategoryTitle}>🛡️ Compliance & Support</Text>
                <Text style={styles.serviceItem}>• Tax Audit & Assessment</Text>
                <Text style={styles.serviceItem}>• Notice Handling & Appeals</Text>
                <Text style={styles.serviceItem}>• Tax Litigation Support</Text>
              </View>
            </View>
          </View>

          {/* ✅ Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={handleScheduleCall}>
              <LinearGradient
                colors={['rgba(217, 111, 50, 0.1)', 'rgba(248, 178, 89, 0.05)']}
                style={styles.quickActionGradient}
              >
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#D96F32" />
                <Text style={styles.quickActionText}>Schedule Consultation</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionBtn} onPress={() => Alert.alert('Tax Calculator', 'Opening tax calculator...')}>
              <LinearGradient
                colors={['rgba(199, 93, 44, 0.1)', 'rgba(139, 69, 19, 0.05)']}
                style={styles.quickActionGradient}
              >
                <MaterialCommunityIcons name="calculator-variant" size={24} color="#C75D2C" />
                <Text style={styles.quickActionText}>Tax Calculator</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ✅ Emergency Support Card */}
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <MaterialIcons name="support-agent" size={24} color="#D96F32" />
              <Text style={styles.emergencyTitle}>24/7 Tax Emergency Support</Text>
            </View>
            <Text style={styles.emergencyText}>
              Urgent tax issues? Get immediate assistance for compliance deadlines, notices, and critical tax matters.
            </Text>
            <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyTax}>
              <Text style={styles.emergencyButtonText}>Get Emergency Help</Text>
            </TouchableOpacity>
          </View>

          {/* ✅ Professional Credentials */}
          <View style={styles.credentialsCard}>
            <Text style={styles.credentialsTitle}>Professional Credentials & Certifications</Text>
            <View style={styles.credentialsList}>
              <View style={styles.credentialItem}>
                <MaterialCommunityIcons name="shield-check" size={18} color="#D96F32" />
                <Text style={styles.credentialItemText}>Chartered Accountant (ICAI)</Text>
              </View>
              <View style={styles.credentialItem}>
                <MaterialIcons name="verified-user" size={18} color="#F8B259" />
                <Text style={styles.credentialItemText}>Registered Tax Practitioner</Text>
              </View>
              <View style={styles.credentialItem}>
                <MaterialCommunityIcons name="certificate" size={18} color="#C75D2C" />
                <Text style={styles.credentialItemText}>GST Certification (GSTN)</Text>
              </View>
              <View style={styles.credentialItem}>
                <MaterialIcons name="security" size={18} color="#8B4513" />
                <Text style={styles.credentialItemText}>15+ Years Professional Experience</Text>
              </View>
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
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
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
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  headerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D96F32',
    letterSpacing: 0.5,
  },
  emergencyBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 10,
    marginBottom: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
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
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    marginTop: -25,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#ffffff',
  },
  profileGradient: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarCircle: {
    position: 'relative',
    padding: 20,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  certificationBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8B259',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  professionalInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D96F32',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  company: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 12,
  },
  credentialsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  credentialChip: {
    backgroundColor: 'rgba(248, 178, 89, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  credentialText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C75D2C',
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(217, 111, 50, 0.2)',
    marginVertical: 20,
    borderRadius: 1,
  },
  contactSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  primaryContactBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contactBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryContactText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryContactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 211, 102, 0.3)',
    gap: 8,
  },
  secondaryContactText: {
    color: '#25D366',
    fontSize: 16,
    fontWeight: '700',
  },
  emailContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  emailContactText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '600',
  },
  businessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D1810',
    letterSpacing: 0.2,
  },
  businessContent: {
    gap: 10,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  businessText: {
    fontSize: 14,
    color: '#5D4E37',
    fontWeight: '600',
    flex: 1,
  },
  timezoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 111, 50, 0.1)',
    gap: 6,
  },
  timezoneText: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  servicesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  servicesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  servicesIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  servicesTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D1810',
    letterSpacing: 0.2,
  },
  servicesList: {
    gap: 16,
  },
  serviceCategory: {
    backgroundColor: 'rgba(243, 233, 220, 0.5)',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D96F32',
  },
  serviceCategoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C75D2C',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  serviceItem: {
    fontSize: 13,
    color: '#5D4E37',
    marginVertical: 2,
    fontWeight: '500',
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  quickActionBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  quickActionGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B4513',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  emergencyCard: {
    backgroundColor: 'rgba(217, 111, 50, 0.05)',
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(217, 111, 50, 0.2)',
    alignItems: 'center',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D96F32',
    letterSpacing: 0.2,
  },
  emergencyText: {
    fontSize: 13,
    color: '#8B4513',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    fontWeight: '500',
  },
  emergencyButton: {
    backgroundColor: '#D96F32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  credentialsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  credentialsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  credentialsList: {
    gap: 12,
  },
  credentialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  credentialItemText: {
    fontSize: 14,
    color: '#5D4E37',
    fontWeight: '600',
    flex: 1,
  },
});

export default ContactUs;
