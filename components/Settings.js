// screens/Settings.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const Settings = () => {
  const navigation = useNavigation();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('@app_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setPushNotifications(parsedSettings.pushNotifications ?? true);
        setEmailNotifications(parsedSettings.emailNotifications ?? true);
        setBiometricAuth(parsedSettings.biometricAuth ?? false);
        setDarkMode(parsedSettings.darkMode ?? false);
        setAutoBackup(parsedSettings.autoBackup ?? true);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('@app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = {
      pushNotifications,
      emailNotifications,
      biometricAuth,
      darkMode,
      autoBackup,
      [key]: value,
    };
    
    switch (key) {
      case 'pushNotifications':
        setPushNotifications(value);
        break;
      case 'emailNotifications':
        setEmailNotifications(value);
        break;
      case 'biometricAuth':
        setBiometricAuth(value);
        break;
      case 'darkMode':
        setDarkMode(value);
        break;
      case 'autoBackup':
        setAutoBackup(value);
        break;
    }
    
    saveSettings(newSettings);
  };

  const SettingOption = ({ icon, title, subtitle, onPress, iconBg, iconLibrary = 'MaterialIcons', showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient colors={iconBg} style={styles.iconContainer}>
        {iconLibrary === 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons name={icon} size={22} color="#ffffff" />
        ) : (
          <MaterialIcons name={icon} size={22} color="#ffffff" />
        )}
      </LinearGradient>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <MaterialIcons name="chevron-right" size={20} color="#8B7355" />
      )}
    </TouchableOpacity>
  );

  const SettingSwitch = ({ icon, title, subtitle, value, onValueChange, iconBg, iconLibrary = 'MaterialIcons' }) => (
    <View style={styles.settingItem}>
      <LinearGradient colors={iconBg} style={styles.iconContainer}>
        {iconLibrary === 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons name={icon} size={22} color="#ffffff" />
        ) : (
          <MaterialIcons name={icon} size={22} color="#ffffff" />
        )}
      </LinearGradient>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5E5', true: '#D96F32' }}
        thumbColor={value ? '#ffffff' : '#ffffff'}
        style={styles.switch}
      />
    </View>
  );

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear temporary files and may free up storage space. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          onPress: () => {
            // Simulate cache clearing
            Alert.alert("Success", "Cache cleared successfully!");
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Tax Data",
      "Export your tax data for backup purposes. This may take a few moments.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Export", 
          onPress: () => {
            // Simulate data export
            Alert.alert("Success", "Tax data exported successfully!");
          }
        }
      ]
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsCard}>
            <SettingOption
              icon="person"
              title="Personal Information"
              subtitle="Manage your profile and tax details"
              onPress={() => navigation.navigate('PersonalInfo')}
              iconBg={['#D96F32', '#C75D2C']}
            />
            <View style={styles.divider} />
            
            <View style={styles.divider} />
            <SettingOption
              icon="payment"
              title="Payment Methods"
              subtitle="Manage payment options"
              onPress={() => navigation.navigate('PaymentMethods')}
              iconBg={['#8B5CF6', '#7C3AED']}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsCard}>
            <SettingSwitch
              icon="notifications"
              title="Push Notifications"
              subtitle="Receive tax alerts and reminders"
              value={pushNotifications}
              onValueChange={(value) => handleSettingChange('pushNotifications', value)}
              iconBg={['#F8B259', '#D97706']}
            />
            <View style={styles.divider} />
            <SettingSwitch
              icon="email"
              title="Email Notifications"
              subtitle="Tax updates via email"
              value={emailNotifications}
              onValueChange={(value) => handleSettingChange('emailNotifications', value)}
              iconBg={['#06B6D4', '#0891B2']}
            />
          </View>
        </View>

        {/* Security */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingsCard}>
            <SettingSwitch
              icon="fingerprint"
              title="Biometric Authentication"
              subtitle="Use fingerprint or face ID"
              value={biometricAuth}
              onValueChange={(value) => handleSettingChange('biometricAuth', value)}
              iconBg={['#10B981', '#059669']}
            />
            <View style={styles.divider} />
           
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsCard}>
            <SettingSwitch
              icon="dark-mode"
              title="Dark Mode"
              subtitle="Switch to dark theme"
              value={darkMode}
              onValueChange={(value) => handleSettingChange('darkMode', value)}
              iconBg={['#64748B', '#475569']}
              iconLibrary="MaterialCommunityIcons"
            />
            <View style={styles.divider} />
            <SettingSwitch
              icon="backup"
              title="Auto Backup"
              subtitle="Automatically backup tax data"
              value={autoBackup}
              onValueChange={(value) => handleSettingChange('autoBackup', value)}
              iconBg={['#8B5CF6', '#7C3AED']}
              iconLibrary="MaterialCommunityIcons"
            />
            <View style={styles.divider} />
            <SettingOption
              icon="language"
              title="Language"
              subtitle="English (Default)"
              onPress={() => navigation.navigate('Language')}
              iconBg={['#F59E0B', '#D97706']}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.settingsCard}>
            <SettingOption
              icon="cloud-download"
              title="Export Tax Data"
              subtitle="Download your tax information"
              onPress={handleExportData}
              iconBg={['#06B6D4', '#0891B2']}
            />
            <View style={styles.divider} />
            <SettingOption
              icon="clear-all"
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={handleClearCache}
              iconBg={['#F59E0B', '#D97706']}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingOption
              icon="help-center"
              title="Help Center"
              subtitle="Get help with tax questions"
              onPress={() => navigation.navigate('HelpCenter')}
              iconBg={['#6B7280', '#4B5563']}
            />
            <View style={styles.divider} />
            <SettingOption
              icon="contact-support"
              title="Contact Support"
              subtitle="Reach out to our tax experts"
              onPress={() => navigation.navigate('ContactUs')}
              iconBg={['#10B981', '#059669']}
            />
            <View style={styles.divider} />
            <SettingOption
              icon="info"
              title="About EasyTax"
              subtitle="App version and information"
              onPress={() => navigation.navigate('About')}
              iconBg={['#64748B', '#475569']}
            />
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
  settingsCard: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#8B7355',
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  divider: {
    height: 1.5,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    marginLeft: 76,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default Settings;
