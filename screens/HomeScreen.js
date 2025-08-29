// screens/HomeScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('@user_data');
        if (userDataString) {
          setUserData(JSON.parse(userDataString));
        }
        
        const savedImageUri = await AsyncStorage.getItem('@profile_image_uri');
        if (savedImageUri) {
          setProfileImageUri(savedImageUri);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    // Update time
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      let greeting = 'Good Evening';
      if (hours < 12) greeting = 'Good Morning';
      else if (hours < 17) greeting = 'Good Afternoon';
      setCurrentTime(greeting);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const taxServices = [
    {
      id: 1,
      title: 'Tax Calculator',
      subtitle: 'Calculate your tax liability',
      icon: 'calculator',
      color: ['#D96F32', '#C75D2C'],
      screen: 'TaxCalculator',
      iconBg: '#FFF3E0',
    },
    {
      id: 2,
      title: 'Tax Planning',
      subtitle: 'AI-powered tax strategies',
      icon: 'trending-up',
      color: ['#F8B259', '#D96F32'],
      screen: 'TaxPlanning',
      iconBg: '#FFF8E1',
    },
    {
      id: 3,
      title: 'CA Connect',
      subtitle: 'Connect with experts',
      icon: 'account-group',
      color: ['#10B981', '#059669'],
      screen: 'CAConnect',
      iconBg: '#ECFDF5',
    },
    {
      id: 4,
      title: 'Tax Tips',
      subtitle: 'Smart saving strategies',
      icon: 'lightbulb-on',
      color: ['#8B5CF6', '#7C3AED'],
      screen: 'TaxTips',
      iconBg: '#F3E8FF',
    },
  ];

  const quickActions = [
    { title: 'ITR Filing', icon: 'description', screen: 'ITRFiling' },
    { title: 'GST Returns', icon: 'receipt', screen: 'GSTReturns' },
    { title: 'TDS Calculator', icon: 'account-balance-wallet', screen: 'TDSCalculator' },
    { title: 'Tax Refund', icon: 'money', screen: 'TaxRefundCalculator' },
  ];

  const TaxServiceCard = ({ service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate(service.screen)}
      activeOpacity={0.8}
    >
      <LinearGradient colors={service.color} style={styles.serviceGradient}>
        <View style={[styles.serviceIcon, { backgroundColor: service.iconBg }]}>
          <MaterialCommunityIcons name={service.icon} size={28} color={service.color[0]} />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={20} color="rgba(255,255,255,0.8)" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const QuickActionButton = ({ action }) => (
    <TouchableOpacity
      style={styles.quickActionButton}
      onPress={() => navigation.navigate(action.screen)}
      activeOpacity={0.7}
    >
      <View style={styles.quickActionIcon}>
        <MaterialIcons name={action.icon} size={24} color="#D96F32" />
      </View>
      <Text style={styles.quickActionText}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D96F32" />
      <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.headerGradient}>
        {/* Header Section - FIXED */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.profileContainer}
              onPress={() => navigation.navigate('Profile')}
            >
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{currentTime}</Text>
              <Text style={styles.userName}>{userData?.name || 'Tax Payer'}</Text>
            </View>
          </View>
          {/* ✅ FIXED: Notification button with proper positioning */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialIcons name="notifications" size={24} color="#ffffff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calculator-variant" size={32} color="#D96F32" />
            <Text style={styles.statNumber}>₹2.4L</Text>
            <Text style={styles.statLabel}>Tax Saved</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="trending-up" size={32} color="#10B981" />
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>Consultations</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="shield-check" size={32} color="#8B5CF6" />
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Compliant</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <LinearGradient
            colors={['rgba(217, 111, 50, 0.1)', 'rgba(248, 178, 89, 0.05)']}
            style={styles.welcomeCard}
          >
            <MaterialCommunityIcons name="robot" size={48} color="#D96F32" />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>Welcome to EasyTax AI</Text>
              <Text style={styles.welcomeSubtitle}>
                Your intelligent tax assistant for FY 2024-25. Get personalized tax advice, 
                calculate taxes, and stay compliant effortlessly.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Tax Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tax Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {taxServices.map((service) => (
            <TaxServiceCard key={service.id} service={service} />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickActionButton key={index} action={action} />
            ))}
          </View>
        </View>

        {/* Financial Year Info */}
        <View style={styles.section}>
          <View style={styles.fyCard}>
            <LinearGradient colors={['#F8B259', '#D96F32']} style={styles.fyGradient}>
              <MaterialCommunityIcons name="calendar-clock" size={32} color="#ffffff" />
              <View style={styles.fyInfo}>
                <Text style={styles.fyTitle}>Financial Year 2024-25</Text>
                <Text style={styles.fySubtitle}>ITR filing deadline: July 31, 2025</Text>
                <View style={styles.fyProgress}>
                  <View style={styles.fyProgressBar} />
                </View>
                <Text style={styles.fyDays}>127 days remaining</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
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
    paddingBottom: 20,
  },
  // ✅ FIXED: Header with proper padding for notification visibility
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, // Reduced to give more space
    paddingTop: Platform.OS === 'ios' ? 15 : 25, // Increased top padding
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  // ✅ FIXED: Notification button with proper margins and positioning
  notificationButton: {
    position: 'relative',
    padding: 12, // Increased padding for better touch area
    marginRight: 4, // Added right margin to prevent cutoff
    backgroundColor: 'rgba(255,255,255,0.1)', // Added subtle background
    borderRadius: 12, // Rounded background
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 110,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  welcomeText: {
    flex: 1,
    marginLeft: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D1810',
    letterSpacing: 0.3,
  },
  seeAll: {
    fontSize: 14,
    color: '#D96F32',
    fontWeight: '700',
  },
  serviceCard: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  serviceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  serviceSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D1810',
    textAlign: 'center',
  },
  fyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#F8B259',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  fyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  fyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  fySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  fyProgress: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: 8,
  },
  fyProgressBar: {
    width: '65%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  fyDays: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default HomeScreen;
