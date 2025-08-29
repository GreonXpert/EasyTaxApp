// components/CAConnect.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CAConnect = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [caList, setCaList] = useState([]);

  // Mock CA Data - In real app, this would come from API
  const mockCAData = [
    {
      id: 1,
      name: 'CA Rajesh Sharma',
      company: 'Sharma & Associates',
      qualification: 'CA, CPA',
      rating: 4.8,
      reviews: 156,
      experience: '12 years',
      specialization: ['Income Tax', 'GST', 'Corporate Tax'],
      location: 'Mumbai, Maharashtra',
      fees: '₹2,500/hour',
      image: null,
      verified: true,
      description: 'Expert in Income Tax planning and GST compliance with over 12 years of experience.',
      about: 'CA Rajesh Sharma is a qualified Chartered Accountant with extensive experience in taxation, auditing, and financial consulting. He has been serving clients across various industries including manufacturing, services, and retail.',
      services: ['Tax Planning', 'GST Registration', 'ITR Filing', 'Tax Audit', 'Corporate Compliance'],
      achievements: ['Top-rated CA in Mumbai', '500+ successful ITR filings', 'GST compliance expert'],
      languages: ['English', 'Hindi', 'Marathi'],
      availability: 'Mon-Sat: 9 AM - 7 PM'
    },
    {
      id: 2,
      name: 'CA Priya Patel',
      company: 'Patel Tax Consultancy',
      qualification: 'CA, DISA',
      rating: 4.9,
      reviews: 203,
      experience: '8 years',
      specialization: ['GST', 'Digital Tax', 'Startup Advisory'],
      location: 'Ahmedabad, Gujarat',
      fees: '₹2,000/hour',
      image: null,
      verified: true,
      description: 'Specialized in GST compliance and digital taxation for modern businesses.',
      about: 'CA Priya Patel is known for her expertise in GST and digital taxation. She helps startups and SMEs navigate complex tax regulations while optimizing their tax liabilities.',
      services: ['GST Compliance', 'Startup Registration', 'Digital Tax Solutions', 'Financial Advisory'],
      achievements: ['GST Expert Certificate', '200+ startup registrations', 'Digital India contributor'],
      languages: ['English', 'Hindi', 'Gujarati'],
      availability: 'Mon-Fri: 10 AM - 6 PM'
    },
    {
      id: 3,
      name: 'CA Amit Kumar',
      company: 'Kumar Financial Services',
      qualification: 'CA, CFA',
      rating: 4.7,
      reviews: 128,
      experience: '15 years',
      specialization: ['Investment Planning', 'Corporate Tax', 'International Tax'],
      location: 'Delhi, NCR',
      fees: '₹3,000/hour',
      image: null,
      verified: true,
      description: 'Senior CA with expertise in investment planning and international taxation.',
      about: 'CA Amit Kumar brings 15 years of comprehensive experience in taxation and financial planning. He specializes in helping high-net-worth individuals and corporations with complex tax structures.',
      services: ['Investment Advisory', 'International Tax', 'Corporate Restructuring', 'Tax Optimization'],
      achievements: ['International Tax Expert', 'CFA Charter Holder', '1000+ clients served'],
      languages: ['English', 'Hindi', 'Punjabi'],
      availability: 'Mon-Sat: 9 AM - 8 PM'
    },
    {
      id: 4,
      name: 'CA Sneha Reddy',
      company: 'Reddy & Co.',
      qualification: 'CA, LLB',
      rating: 4.6,
      reviews: 94,
      experience: '10 years',
      specialization: ['Tax Litigation', 'Compliance', 'Real Estate Tax'],
      location: 'Hyderabad, Telangana',
      fees: '₹2,200/hour',
      image: null,
      verified: true,
      description: 'Expert in tax litigation and real estate taxation matters.',
      about: 'CA Sneha Reddy combines her CA qualification with legal expertise to provide comprehensive tax solutions. She specializes in resolving complex tax disputes and real estate transactions.',
      services: ['Tax Litigation', 'Real Estate Tax', 'Legal Compliance', 'Dispute Resolution'],
      achievements: ['Tax Litigation Specialist', 'Legal-Tax Expert', '50+ successful cases'],
      languages: ['English', 'Hindi', 'Telugu'],
      availability: 'Mon-Fri: 9 AM - 6 PM'
    },
    {
      id: 5,
      name: 'CA Vikram Singh',
      company: 'Singh Tax Advisory',
      qualification: 'CA, MBA (Finance)',
      rating: 4.8,
      reviews: 167,
      experience: '9 years',
      specialization: ['Business Tax', 'Financial Planning', 'Audit'],
      location: 'Pune, Maharashtra',
      fees: '₹2,300/hour',
      image: null,
      verified: true,
      description: 'Business tax expert with strong financial planning background.',
      about: 'CA Vikram Singh leverages his CA and MBA qualifications to provide holistic business solutions. He helps businesses optimize their tax strategies while ensuring compliance.',
      services: ['Business Tax Planning', 'Financial Advisory', 'Statutory Audit', 'Due Diligence'],
      achievements: ['Business Tax Specialist', 'MBA Finance', '300+ business clients'],
      languages: ['English', 'Hindi', 'Marathi'],
      availability: 'Mon-Sat: 10 AM - 7 PM'
    },
    {
      id: 6,
      name: 'CA Anita Joshi',
      company: 'Joshi Associates',
      qualification: 'CA, CS',
      rating: 4.9,
      reviews: 189,
      experience: '11 years',
      specialization: ['Company Law', 'Tax Advisory', 'Secretarial Practice'],
      location: 'Bangalore, Karnataka',
      fees: '₹2,800/hour',
      image: null,
      verified: true,
      description: 'Dual qualified CA & CS with expertise in company law and taxation.',
      about: 'CA Anita Joshi is a dual qualified professional with expertise in both taxation and company law. She provides comprehensive corporate solutions to businesses of all sizes.',
      services: ['Company Registration', 'Corporate Compliance', 'Tax Advisory', 'Board Meetings'],
      achievements: ['CA-CS Dual Qualified', 'Corporate Law Expert', '400+ companies served'],
      languages: ['English', 'Hindi', 'Kannada'],
      availability: 'Mon-Fri: 9 AM - 6 PM'
    }
  ];

  useEffect(() => {
    setCaList(mockCAData);
  }, []);

  const filteredCAs = caList.filter(ca => {
    const matchesSearch = ca.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ca.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ca.specialization.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'top-rated') return matchesSearch && ca.rating >= 4.8;
    if (selectedFilter === 'verified') return matchesSearch && ca.verified;
    
    return matchesSearch;
  });

  const handleCASelect = (ca) => {
    navigation.navigate('CADetails', { caData: ca });
  };

  const FilterButton = ({ filter, label, active, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CACard = ({ ca }) => (
    <TouchableOpacity 
      style={styles.caCard} 
      onPress={() => handleCASelect(ca)}
      activeOpacity={0.8}
    >
      <LinearGradient 
        colors={['#ffffff', '#fefefe']} 
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            {ca.image ? (
              <Image source={{ uri: ca.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{ca.name.split(' ').map(n => n[0]).join('')}</Text>
              </View>
            )}
            {ca.verified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={16} color="#10B981" />
              </View>
            )}
          </View>
          
          <View style={styles.caInfo}>
            <Text style={styles.caName}>{ca.name}</Text>
            <Text style={styles.caCompany}>{ca.company}</Text>
            <Text style={styles.caQualification}>{ca.qualification}</Text>
            
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={16} color="#F59E0B" />
              <Text style={styles.rating}>{ca.rating}</Text>
              <Text style={styles.reviews}>({ca.reviews} reviews)</Text>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            <Text style={styles.fees}>{ca.fees}</Text>
            <View style={styles.experienceBadge}>
              <Text style={styles.experienceText}>{ca.experience}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.description}>{ca.description}</Text>
          
          <View style={styles.specializationContainer}>
            {ca.specialization.slice(0, 3).map((spec, index) => (
              <View key={index} style={styles.specializationTag}>
                <Text style={styles.specializationText}>{spec}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={14} color="#8B7355" />
              <Text style={styles.location}>{ca.location}</Text>
            </View>
            
            <TouchableOpacity style={styles.connectButton}>
              <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.connectGradient}>
                <MaterialCommunityIcons name="account-plus" size={16} color="#ffffff" />
                <Text style={styles.connectText}>Connect</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CA Connect</Text>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialIcons name="search" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="search" size={20} color="#8B7355" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search CAs by name, company, or specialization"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8B7355"
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <FilterButton
            filter="all"
            label="All CAs"
            active={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
          />
          <FilterButton
            filter="top-rated"
            label="Top Rated"
            active={selectedFilter === 'top-rated'}
            onPress={() => setSelectedFilter('top-rated')}
          />
          <FilterButton
            filter="verified"
            label="Verified"
            active={selectedFilter === 'verified'}
            onPress={() => setSelectedFilter('verified')}
          />
        </ScrollView>
      </View>

      <ScrollView style={styles.caListContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>{filteredCAs.length} CAs found</Text>
          <TouchableOpacity style={styles.sortButton}>
            <MaterialIcons name="sort" size={20} color="#D96F32" />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>
        
        {filteredCAs.map((ca) => (
          <CACard key={ca.id} ca={ca} />
        ))}
        
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D1810',
    fontWeight: '500',
  },
  filtersContainer: {
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 111, 50, 0.1)',
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3E9DC',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: '#D96F32',
    borderColor: '#D96F32',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  caListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D96F32',
  },
  caCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D96F32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 2,
  },
  caInfo: {
    flex: 1,
  },
  caName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 4,
  },
  caCompany: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 2,
  },
  caQualification: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D96F32',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D1810',
  },
  reviews: {
    fontSize: 12,
    color: '#8B7355',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  fees: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D96F32',
    marginBottom: 8,
  },
  experienceBadge: {
    backgroundColor: '#F8B259',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  experienceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardBody: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#2D1810',
    lineHeight: 20,
    marginBottom: 12,
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specializationTag: {
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  specializationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D96F32',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '500',
  },
  connectButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  connectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  connectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default CAConnect;
