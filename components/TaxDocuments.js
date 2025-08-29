import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { taxDocumentsData } from '../data/taxDocumentsData';

const { width } = Dimensions.get('window');

const TaxDocuments = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Flatten all documents from different categories
  const allDocuments = [
    ...taxDocumentsData.itr_forms,
    ...taxDocumentsData.tax_certificates,
    ...taxDocumentsData.investment_documents,
    ...taxDocumentsData.compliance_documents,
  ];

  // Get unique categories and add 'All'
  const categories = ['All', ...new Set(allDocuments.map(doc => doc.category))];

  // Filter documents based on search query and selected category
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handler for document card press
  const handleDocumentPress = (document) => {
    navigation.navigate('TaxDocumentDetails', { document });
  };

  // Component for a single document card
  const DocumentCard = ({ document }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => handleDocumentPress(document)}
      activeOpacity={0.8}
    >
      <LinearGradient colors={document.color} style={styles.documentGradient}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={document.icon} size={24} color="#ffffff" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{document.title}</Text>
            <Text style={styles.cardCategory} numberOfLines={1}>{document.category}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <MaterialIcons name="arrow-forward-ios" size={16} color="rgba(255,255,255,0.8)" />
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>{document.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardTag}>
            <Text style={styles.cardTagText} numberOfLines={1}>{document.applicableFor}</Text>
          </View>
          <View style={styles.cardTag}>
            <Text style={styles.cardTagText} numberOfLines={1}>{document.lastUpdated}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Component for a single category button
  const CategoryButton = ({ category, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.categoryButton, isSelected && styles.categoryButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.categoryButtonText, isSelected && styles.categoryButtonTextActive]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back and search buttons */}
      <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tax Documents</Text>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialIcons name="search" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main content area */}
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#8B7355" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tax documents..."
            placeholderTextColor="#8B7355"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <MaterialIcons name="clear" size={20} color="#8B7355" />
            </TouchableOpacity>
          )}
        </View>

       
        {/* Documents List */}
        <ScrollView style={styles.documentsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.documentsGrid}>
            {filteredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </View>

          {filteredDocuments.length === 0 && (
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="search-off" size={48} color="#8B7355" />
              <Text style={styles.noResultsTitle}>No documents found</Text>
              <Text style={styles.noResultsText}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
  content: {
    flex: 1,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2D1810',
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
  },

  documentsContainer: {
    flex: 1,
  },
  documentsGrid: {
    paddingHorizontal: 20,
  },
  documentCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  documentGradient: {
    padding: 20,
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  cardCategory: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    flexShrink: 1,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
    minHeight: 40,
    flexShrink: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTag: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minHeight: 32,
  },
  cardTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    flexShrink: 1,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default TaxDocuments;