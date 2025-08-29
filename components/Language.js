// screens/Language.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const Language = () => {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      isDefault: true,
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिंदी',
      flag: '🇮🇳',
      isDefault: false,
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      isDefault: false,
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      isDefault: false,
    },
    {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      isDefault: false,
    },
    {
      code: 'pt',
      name: 'Portuguese',
      nativeName: 'Português',
      flag: '🇵🇹',
      isDefault: false,
    },
    {
      code: 'zh',
      name: 'Chinese',
      nativeName: '中文',
      flag: '🇨🇳',
      isDefault: false,
    },
    {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      flag: '🇯🇵',
      isDefault: false,
    },
  ];

  useEffect(() => {
    loadSelectedLanguage();
  }, []);

  const loadSelectedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@app_language');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  };

  const selectLanguage = async (languageCode, languageName) => {
    try {
      await AsyncStorage.setItem('@app_language', languageCode);
      setSelectedLanguage(languageCode);
      
      Alert.alert(
        "Language Changed",
        `Language has been changed to ${languageName}. The app will restart to apply changes.`,
        [
          {
            text: "OK",
            onPress: () => {
              // In a real app, you might want to restart the app or reload the root component
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to save language:', error);
      Alert.alert("Error", "Failed to save language preference.");
    }
  };

  const LanguageOption = ({ language }) => {
    const isSelected = selectedLanguage === language.code;
    
    return (
      <TouchableOpacity 
        style={[styles.languageItem, isSelected && styles.languageItemSelected]} 
        onPress={() => selectLanguage(language.code, language.name)}
        activeOpacity={0.7}
      >
        <View style={styles.languageLeft}>
          <View style={[styles.flagContainer, isSelected && styles.flagContainerSelected]}>
            <Text style={styles.flag}>{language.flag}</Text>
          </View>
          <View style={styles.languageContent}>
            <Text style={[styles.languageName, isSelected && styles.languageNameSelected]}>
              {language.name}
            </Text>
            <Text style={[styles.nativeName, isSelected && styles.nativeNameSelected]}>
              {language.nativeName}
            </Text>
            {language.isDefault && (
              <Text style={styles.defaultLabel}>Default</Text>
            )}
          </View>
        </View>
        
        <View style={styles.languageRight}>
          {isSelected ? (
            <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.checkContainer}>
              <MaterialIcons name="check" size={18} color="#ffffff" />
            </LinearGradient>
          ) : (
            <View style={styles.uncheckedContainer} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#D96F32', '#F8B259']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Language</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Language */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Current Language</Text>
          <View style={styles.currentLanguageCard}>
            <MaterialCommunityIcons name="translate" size={24} color="#D96F32" />
            <Text style={styles.currentLanguageText}>
              {languages.find(lang => lang.code === selectedLanguage)?.name || 'English'}
            </Text>
          </View>
        </View>

        {/* Available Languages */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Available Languages</Text>
          <View style={styles.languagesCard}>
            {languages.map((language, index) => (
              <View key={language.code}>
                <LanguageOption language={language} />
                {index < languages.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Language Info */}
        <View style={styles.sectionContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="info" size={20} color="#8B7355" />
              <Text style={styles.infoTitle}>Language Settings</Text>
            </View>
            <Text style={styles.infoText}>
              Changing the language will update the app interface. Some content may still appear in English as translation is in progress.
            </Text>
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
  placeholder: {
    width: 42,
    height: 42,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  currentLanguageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  currentLanguageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    marginLeft: 16,
  },
  languagesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  languageItemSelected: {
    backgroundColor: 'rgba(217, 111, 50, 0.05)',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  flagContainerSelected: {
    borderColor: 'rgba(217, 111, 50, 0.3)',
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
  },
  flag: {
    fontSize: 24,
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 2,
  },
  languageNameSelected: {
    color: '#D96F32',
  },
  nativeName: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '500',
  },
  nativeNameSelected: {
    color: '#C75D2C',
  },
  defaultLabel: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 2,
  },
  languageRight: {
    marginLeft: 16,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  uncheckedContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    marginLeft: 84,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default Language;
