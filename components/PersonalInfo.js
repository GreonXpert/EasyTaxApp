// components/PersonalInfo.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const FIELDS = [
  { key: 'name', label: 'Full Name', icon: 'user', iconColor: '#D96F32' },
  { key: 'email', label: 'Email Address', icon: 'mail', iconColor: '#C75D2C' },
  { key: 'phone', label: 'Phone Number', icon: 'phone', iconColor: '#F8B259' },
  { key: 'pan', label: 'PAN Number', icon: 'credit-card', iconColor: '#D96F32' },
  { key: 'address', label: 'Residential Address', icon: 'map-pin', iconColor: '#C75D2C' },
  { key: 'occupation', label: 'Occupation', icon: 'briefcase', iconColor: '#F8B259' },
  { key: 'company', label: 'Employer/Company', icon: 'building', iconColor: '#D96F32' },
  { key: 'income', label: 'Annual Income', icon: 'dollar-sign', iconColor: '#C75D2C' },
  { key: 'taxBracket', label: 'Tax Bracket', icon: 'percent', iconColor: '#F8B259' },
  { key: 'notes', label: 'Additional Notes', icon: 'file-text', iconColor: '#8B5A2B' },
];

const DEFAULT_USER = {
  name: '',
  email: '',
  phone: '',
  pan: '',
  address: '',
  occupation: '',
  company: '',
  income: '',
  taxBracket: '',
  notes: '',
};

const PersonalInfo = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(DEFAULT_USER);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState(DEFAULT_USER);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('@user_data');
        if (userDataString) {
          const loaded = { ...DEFAULT_USER, ...JSON.parse(userDataString) };
          setUserData(loaded);
          setFields(loaded);
        }
      } catch (e) {
        console.error("Failed to load user data.", e);
      }
    };
    fetchUserData();
  }, []);

  const startEdit = () => {
    setFields(userData);
    setEditing(true);
  };

  const updateField = (key, value) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  const saveData = async () => {
    const newUser = { ...fields };
    setUserData(newUser);
    setEditing(false);
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(newUser));
    } catch (e) {
      console.error("Failed to save user data.", e);
    }
  };

  const getKeyboardType = (key) => {
    if (key === 'phone' || key === 'income') return 'numeric';
    if (key === 'email') return 'email-address';
    return 'default';
  };

  const getPlaceholder = (label, key) => {
    switch (key) {
      case 'pan': return 'ABCDE1234F';
      case 'phone': return '+91 98765 43210';
      case 'email': return 'your.email@domain.com';
      case 'income': return '₹ 10,00,000';
      case 'taxBracket': return '30% (Above ₹10L)';
      case 'address': return 'Complete residential address';
      default: return `Enter your ${label.toLowerCase()}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D96F32" />
      <LinearGradient
        colors={['#D96F32', '#C75D2C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tax Profile</Text>
          <TouchableOpacity onPress={editing ? saveData : startEdit} style={styles.editBtn}>
            <Feather name={editing ? "check" : "edit"} size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialIcons name="security" size={16} color="rgba(255,255,255,0.9)" />
          <Text style={styles.bannerText}>Your information is encrypted and secure</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            {/* Header Section */}
            <View style={styles.cardHeader}>
              <View style={styles.headerIcon}>
                <MaterialIcons name="person" size={24} color="#D96F32" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Personal & Tax Information</Text>
                <Text style={styles.cardSubtitle}>
                  {editing ? 'Update your details' : 'Complete your tax profile'}
                </Text>
              </View>
            </View>

            {/* Fields */}
            <View style={styles.fieldsContainer}>
              {FIELDS.map(({ key, label, icon, iconColor }, index) => (
                <View key={key} style={[styles.row, index === FIELDS.length - 1 && { marginBottom: 0 }]}>
                  <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                    <Feather name={icon} size={18} color={iconColor} />
                  </View>
                  <View style={styles.infoTextBlock}>
                    <Text style={styles.label}>{label}</Text>
                    {editing ? (
                      <TextInput
                        style={[
                          styles.value, 
                          styles.input,
                          key === 'notes' && { minHeight: 60, textAlignVertical: 'top' }
                        ]}
                        placeholder={getPlaceholder(label, key)}
                        value={fields[key]}
                        onChangeText={value => updateField(key, value)}
                        placeholderTextColor="#B8860B"
                        keyboardType={getKeyboardType(key)}
                        multiline={key === 'notes' || key === 'address'}
                        numberOfLines={key === 'notes' ? 3 : key === 'address' ? 2 : 1}
                        autoCapitalize={key === 'email' ? 'none' : key === 'pan' ? 'characters' : 'sentences'}
                      />
                    ) : (
                      <Text style={styles.value}>
                        {userData[key]?.trim() ? userData[key] : (
                          <Text style={styles.placeholderText}>Not provided</Text>
                        )}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            {editing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setFields(userData);
                    setEditing(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveData}>
                  <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.saveButtonGradient}>
                    <MaterialIcons name="check" size={18} color="#ffffff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Compliance Note */}
          <View style={styles.complianceNote}>
            <MaterialIcons name="info" size={16} color="#F8B259" />
            <Text style={styles.complianceText}>
              This information helps us provide accurate tax consultation and ensure compliance with Indian tax laws.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.6,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 40,
    gap: 6,
  },
  bannerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  infoCard: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E9DC',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDF6E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8B5A2B',
    fontWeight: '500',
    marginTop: 2,
  },
  fieldsContainer: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  infoTextBlock: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D96F32',
    marginBottom: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: 0.2,
    minHeight: 20,
    lineHeight: 22,
  },
  placeholderText: {
    color: '#B8860B',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#F8B259',
    paddingVertical: 8,
    paddingHorizontal: 0,
    color: '#1A1A1A',
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3E9DC',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3E9DC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D96F32',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D96F32',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  complianceNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FDF6E3',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F8B259',
    gap: 10,
  },
  complianceText: {
    flex: 1,
    fontSize: 12,
    color: '#8B5A2B',
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default PersonalInfo;
