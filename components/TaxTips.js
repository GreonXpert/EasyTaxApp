// components/TaxTips.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchTaxTips } from '../services/TaxTipAi';

const TaxTips = () => {
  const navigation = useNavigation();
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');

  // Load tips when component mounts
  useEffect(() => {
    loadTips();
  }, [selectedCategory]);

  const loadTips = async () => {
    setLoading(true);
    try {
      console.log('🧠 Fetching AI-powered tax tips...');
      const data = await fetchTaxTips(selectedCategory);
      setTips(data);
      console.log('✅ Tax tips loaded successfully:', data.length);
    } catch (error) {
      console.error('❌ Failed to load tax tips:', error);
      Alert.alert(
        'Loading Error',
        'Failed to load tax tips. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing tax tips with AI...');
      const data = await fetchTaxTips(selectedCategory);
      setTips(data);
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCategory]);

  const categories = [
    { id: 'general', label: 'General Tips', icon: 'lightbulb' },
    { id: 'salaried', label: 'Salaried', icon: 'work' },
    { id: 'investment', label: 'Investments', icon: 'trending-up' },
    { id: 'business', label: 'Business', icon: 'business' },
    { id: 'deductions', label: 'Deductions', icon: 'receipt' },
  ];

  const CategoryButton = ({ category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <MaterialIcons
        name={category.icon}
        size={16}
        color={selectedCategory === category.id ? '#ffffff' : '#D96F32'}
      />
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category.id && styles.categoryButtonTextActive
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  const TipCard = ({ item, index }) => (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <View style={styles.tipIconContainer}>
          <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.tipIconGradient}>
            <MaterialCommunityIcons name="lightbulb" size={20} color="#ffffff" />
          </LinearGradient>
        </View>
        <View style={styles.tipNumberContainer}>
          <Text style={styles.tipNumber}>#{index + 1}</Text>
        </View>
      </View>
      
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{item.title}</Text>
        <Text style={styles.tipDescription}>{item.description}</Text>
        
        {item.savings && (
          <View style={styles.savingsContainer}>
            <MaterialIcons name="account-balance-wallet" size={16} color="#10B981" />
            <Text style={styles.savingsText}>Potential Savings: {item.savings}</Text>
          </View>
        )}
        
        {item.section && (
          <View style={styles.sectionContainer}>
            <MaterialCommunityIcons name="gavel" size={14} color="#8B5CF6" />
            <Text style={styles.sectionText}>{item.section}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Tax Tips</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={refreshing}>
            <MaterialIcons 
              name="refresh" 
              size={24} 
              color="#ffffff" 
              style={{ transform: [{ rotate: refreshing ? '360deg' : '0deg' }] }}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.subtitleContainer}>
          <MaterialCommunityIcons name="robot" size={20} color="rgba(255,255,255,0.9)" />
          <Text style={styles.subtitle}>AI-powered tax saving strategies for FY 2024-25</Text>
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category) => (
            <CategoryButton key={category.id} category={category} />
          ))}
        </ScrollView>
      </View>

      {/* Tips List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D96F32" />
          <Text style={styles.loadingText}>Generating AI Tax Tips...</Text>
        </View>
      ) : (
        <FlatList
          data={tips}
          keyExtractor={(item, index) => `${selectedCategory}-${index}`}
          renderItem={({ item, index }) => <TipCard item={item} index={index} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#D96F32']}
              tintColor="#D96F32"
              title="Getting fresh AI tips..."
              titleColor="#D96F32"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="lightbulb-off" size={64} color="#8B7355" />
              <Text style={styles.emptyTitle}>No Tips Available</Text>
              <Text style={styles.emptySubtitle}>
                Pull down to refresh and get fresh AI-generated tax tips
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadTips}>
                <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.retryGradient}>
                  <MaterialIcons name="refresh" size={20} color="#ffffff" />
                  <Text style={styles.retryText}>Retry</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 111, 50, 0.1)',
    paddingVertical: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3E9DC',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#D96F32',
    borderColor: '#D96F32',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D96F32',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  tipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.05)',
    overflow: 'hidden',
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  tipIconContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  tipIconGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipNumberContainer: {
    backgroundColor: '#F8B259',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  tipContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  tipDescription: {
    fontSize: 14,
    color: '#2D1810',
    lineHeight: 20,
    marginBottom: 12,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    gap: 6,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#8B7355',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D1810',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default TaxTips;
