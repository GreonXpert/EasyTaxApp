// components/CADetails.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const CADetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { caData } = route.params;

  const [activeTab, setActiveTab] = useState('about');

  const handleCall = () => {
    // In real app, this would have the CA's phone number
    Alert.alert(
      'Contact CA',
      'Would you like to contact this CA?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL('tel:+919876543210') },
        { text: 'WhatsApp', onPress: () => Linking.openURL('https://wa.me/919876543210') }
      ]
    );
  };

  const handleBookConsultation = () => {
    Alert.alert(
      'Book Consultation',
      `Book a consultation with ${caData.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: () => {
          // In real app, this would navigate to booking screen
          Alert.alert('Success', 'Consultation booking request sent!');
        }}
      ]
    );
  };

  const TabButton = ({ tab, label, active, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ServiceItem = ({ service }) => (
    <View style={styles.serviceItem}>
      <MaterialIcons name="check-circle" size={16} color="#10B981" />
      <Text style={styles.serviceText}>{service}</Text>
    </View>
  );

  const AchievementItem = ({ achievement }) => (
    <View style={styles.achievementItem}>
      <MaterialCommunityIcons name="trophy" size={16} color="#F59E0B" />
      <Text style={styles.achievementText}>{achievement}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CA Profile</Text>
          <TouchableOpacity style={styles.shareButton}>
            <MaterialIcons name="share" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {caData.image ? (
              <Image source={{ uri: caData.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {caData.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
            )}
            {caData.verified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={20} color="#10B981" />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.caName}>{caData.name}</Text>
            <Text style={styles.caCompany}>{caData.company}</Text>
            <Text style={styles.caQualification}>{caData.qualification}</Text>
            
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={18} color="#F8B259" />
              <Text style={styles.rating}>{caData.rating}</Text>
              <Text style={styles.reviews}>({caData.reviews} reviews)</Text>
              <Text style={styles.experience}>• {caData.experience}</Text>
            </View>
            
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.location}>{caData.location}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <TabButton
            tab="about"
            label="About"
            active={activeTab === 'about'}
            onPress={() => setActiveTab('about')}
          />
          <TabButton
            tab="services"
            label="Services"
            active={activeTab === 'services'}
            onPress={() => setActiveTab('services')}
          />
          <TabButton
            tab="specialization"
            label="Expertise"
            active={activeTab === 'specialization'}
            onPress={() => setActiveTab('specialization')}
          />
          <TabButton
            tab="achievements"
            label="Achievements"
            active={activeTab === 'achievements'}
            onPress={() => setActiveTab('achievements')}
          />
        </ScrollView>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>{caData.about}</Text>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Experience</Text>
                  <Text style={styles.detailValue}>{caData.experience}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Consultation Fee</Text>
                  <Text style={styles.detailValue}>{caData.fees}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Languages</Text>
                  <Text style={styles.detailValue}>{caData.languages?.join(', ')}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Availability</Text>
                  <Text style={styles.detailValue}>{caData.availability}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services Offered</Text>
              {caData.services?.map((service, index) => (
                <ServiceItem key={index} service={service} />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'specialization' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Areas of Expertise</Text>
              <View style={styles.specializationGrid}>
                {caData.specialization?.map((spec, index) => (
                  <View key={index} style={styles.specializationCard}>
                    <MaterialCommunityIcons name="certificate" size={24} color="#D96F32" />
                    <Text style={styles.specializationName}>{spec}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Achievements & Recognition</Text>
              {caData.achievements?.map((achievement, index) => (
                <AchievementItem key={index} achievement={achievement} />
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <MaterialIcons name="call" size={20} color="#D96F32" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bookButton} onPress={handleBookConsultation}>
          <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.bookGradient}>
            <MaterialCommunityIcons name="calendar-plus" size={20} color="#ffffff" />
            <Text style={styles.bookButtonText}>Book Consultation</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 3,
  },
  profileInfo: {
    flex: 1,
  },
  caName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  caCompany: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  caQualification: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8B259',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  reviews: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  experience: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 111, 50, 0.1)',
  },
  tabsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: '#F3E9DC',
  },
  tabButtonActive: {
    backgroundColor: '#D96F32',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    color: '#2D1810',
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  serviceText: {
    fontSize: 16,
    color: '#2D1810',
    fontWeight: '500',
  },
  specializationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specializationCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: '45%',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  specializationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D1810',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  achievementText: {
    fontSize: 16,
    color: '#2D1810',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 111, 50, 0.1)',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F3E9DC',
    borderWidth: 2,
    borderColor: '#D96F32',
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D96F32',
  },
  bookButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default CADetails;
