import React, { useState, useEffect, useRef, forwardRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [savedMessagesCount, setSavedMessagesCount] = useState(0);
  const [savedChatsCount, setSavedChatsCount] = useState(0);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageZoom, setImageZoom] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('@user_data');
        if (userDataString) {
          setUserData(JSON.parse(userDataString));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedImageUri = await AsyncStorage.getItem('@profile_image_uri');
        if (savedImageUri) {
          setProfileImageUri(savedImageUri);
        }
      } catch (error) {
        console.error('Failed to load profile image:', error);
      }
    };
    loadProfileImage();
  }, []);

  useEffect(() => {
    const loadSavedContentCounts = async () => {
      try {
        const messagesString = await AsyncStorage.getItem('@saved_messages');
        const messagesCount = messagesString ? JSON.parse(messagesString).length : 0;
        setSavedMessagesCount(messagesCount);

        const chatsString = await AsyncStorage.getItem('@saved_chats');
        const chatsCount = chatsString ? JSON.parse(chatsString).length : 0;
        setSavedChatsCount(chatsCount);

        console.log('📊 Loaded saved content counts:', { messagesCount, chatsCount });
      } catch (error) {
        console.error('Failed to load saved content counts:', error);
      }
    };

    loadSavedContentCounts();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadSavedContentCounts();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert("Logout from EasyTax", "Are you sure you want to logout from your tax account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", onPress: async () => {
          try {
            await AsyncStorage.removeItem('@user_data');
            navigation.replace('Login');
          } catch (e) {
            Alert.alert("Error", "Could not logout from EasyTax.");
          }
        }
      }
    ]);
  };


  const openImageViewer = () => {
    if (profileImageUri) {
      setImageViewerVisible(true);
      Animated.spring(imageZoom, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeImageViewer = () => {
    Animated.spring(imageZoom, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start(() => {
      setImageViewerVisible(false);
    });
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Update Profile Picture",
      "Choose how you'd like to update your EasyTax profile picture:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "📷 Take Photo", onPress: () => pickImage('camera') },
        { text: "🖼️ Choose from Gallery", onPress: () => pickImage('gallery') },
      ]
    );
  };

  const pickImage = async (source) => {
    if (imageViewerVisible) {
      closeImageViewer();
    }
    
    try {
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Camera permission is required to take photos.'
          );
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Gallery permission is required to select photos.'
          );
          return;
        }
      }

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: false,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: false,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        await AsyncStorage.setItem('@profile_image_uri', imageUri);
        setProfileImageUri(imageUri);
        Alert.alert(
          'Success',
          'Profile picture updated successfully!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Error',
        'Failed to update profile picture. Please try again.'
      );
    }
  };

  const removeProfileImage = () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              if (imageViewerVisible) {
                closeImageViewer();
              }
              await AsyncStorage.removeItem('@profile_image_uri');
              setProfileImageUri(null);
              Alert.alert('Success', 'Profile picture removed successfully!');
            } catch (error) {
              console.error('Error removing profile image:', error);
              Alert.alert('Error', 'Failed to remove profile picture.');
            }
          }
        }
      ]
    );
  };

  const handleViewSavedMessages = () => {
    navigation.navigate('SavedMessages');
  };

  const handleViewSavedContentSummary = () => {
    const totalSaved = savedMessagesCount + savedChatsCount;
    
    if (totalSaved === 0) {
      Alert.alert(
        "No Saved Content",
        "You haven't saved any tax consultations or messages yet. Start saving important tax advice for quick access!",
        [
          { text: "OK", style: "default" },
          { text: "Start Consultation", onPress: () => navigation.navigate('MainApp') }
        ]
      );
    } else {
      const messageText = `You have saved:\n\n💬 ${savedMessagesCount} individual tax tips\n📋 ${savedChatsCount} complete consultations\n\nTotal: ${totalSaved} saved items`;
      Alert.alert(
        "📊 Your Saved Tax Content",
        messageText,
        [
          { text: "Close", style: "cancel" },
          { text: "View All", onPress: handleViewSavedMessages }
        ]
      );
    }
  };

  const ProfileOption = ({ icon, title, subtitle, onPress, iconBg, iconLibrary = 'MaterialCommunityIcons' }) => (
    <TouchableOpacity style={styles.modernOptionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <LinearGradient colors={iconBg} style={styles.iconContainer}>
          {iconLibrary === 'MaterialCommunityIcons' ? (
            <MaterialCommunityIcons name={icon} size={24} color="#ffffff" />
          ) : (
            <MaterialIcons name={icon} size={24} color="#ffffff" />
          )}
        </LinearGradient>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{String(title || '')}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{String(subtitle)}</Text>}
        </View>
        <View style={styles.chevronContainer}>
          <MaterialIcons name="chevron-right" size={24} color="#8B7355" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ number, label }) => (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{String(number || '0')}</Text>
      <Text style={styles.statLabel}>{String(label || '')}</Text>
    </View>
  );

  const QuickAction = ({ icon, label, color, onPress, iconLibrary = 'Feather', badge = null }) => (
    <TouchableOpacity style={styles.quickActionBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={{ alignItems: 'center' }}>
        <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
          {iconLibrary === 'MaterialCommunityIcons' ? (
            <MaterialCommunityIcons name={icon} size={28} color="#ffffff" />
          ) : iconLibrary === 'MaterialIcons' ? (
            <MaterialIcons name={icon} size={24} color="#ffffff" />
          ) : (
            <Feather name={icon} size={24} color="#ffffff" />
          )}
          {badge && badge > 0 && (
            <View style={styles.quickActionBadge}>
              <Text style={styles.quickActionBadgeText}>{badge > 99 ? '99+' : String(badge)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.quickActionLabel}>{String(label || '')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
   <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D96F32" />
      
      <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Tax Profile</Text>
          
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('PersonalInfo')}>
            <MaterialIcons name="edit" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.4)']} style={styles.avatarGlow}>
              <TouchableOpacity style={styles.avatarContainer} onPress={openImageViewer} activeOpacity={0.8}>
                {profileImageUri ? (
                  <Image
                    source={{ uri: profileImageUri }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.avatarInitial}>
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity style={styles.cameraButton} onPress={showImagePickerOptions}>
              <MaterialIcons name="camera-alt" size={18} color="#D96F32" />
            </TouchableOpacity>

            {profileImageUri && (
              <TouchableOpacity style={styles.removeButton} onPress={removeProfileImage}>
                <MaterialIcons name="close" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>{userData?.name || 'John Doe'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'john.doe@example.com'}</Text>
          
          <View style={styles.userBadge}>
            <Text style={styles.userRole}>📊 Premium Tax Member</Text>
          </View>

          <View style={styles.statsRow}>
            <StatCard number="12" label="Tax Filings" />
            <StatCard number={savedChatsCount.toString()} label="Saved Chats" />
            <StatCard number={savedMessagesCount.toString()} label="Tax Tips" />
            <StatCard number="5" label="Deductions" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Tax Services</Text>
          
          <View style={styles.quickActionsRow}>
            <QuickAction
              icon="calculator"
              label="Tax Calculator"
              color="#D96F32"
              iconLibrary="MaterialCommunityIcons"
              onPress={() => navigation.navigate('TaxCalculator')}
            />
            
            <QuickAction
              icon="trending-up"
              label="Tax Planning"
              color="#C75D2C"
              iconLibrary="Feather"
              onPress={() => navigation.navigate('TaxPlanning')}
            />
            
            <QuickAction
              icon="account-tie"
              label="CA Connect"
              color="#F8B259"
              iconLibrary="MaterialCommunityIcons"
              onPress={() => navigation.navigate('CAConnect')}
            />
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <View style={styles.quickActionsRow}>
            <QuickAction
              icon="settings"
              label="Settings"
              color="#8B5CF6"
              iconLibrary="MaterialIcons"
              onPress={() => navigation.navigate('Settings')}
            />
            
            <QuickAction
              icon="bookmark"
              label="Saved Content"
              color="#10B981"
              iconLibrary="Feather"
              onPress={handleViewSavedMessages}
              badge={savedMessagesCount + savedChatsCount}
            />
            
            <QuickAction
              icon="lightbulb"
              label="Tax Tips"
              color="#F59E0B"
              iconLibrary="MaterialIcons"
              onPress={() => navigation.navigate('TaxTips')}
            />
          </View>
        </View>


        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account & Tax Settings</Text>
          
          <View style={styles.menuCard}>
            <ProfileOption
              icon="account-circle"
              title="Personal Information"
              subtitle="Update your tax profile details"
              onPress={() => navigation.navigate('PersonalInfo')}
              iconBg={['#D96F32', '#C75D2C']}
            />
            <View style={styles.divider} />
            
            <ProfileOption
              icon="bookmark-multiple"
              title={`Saved Tax Content (${savedMessagesCount + savedChatsCount})`}
              subtitle={`${savedChatsCount} consultations • ${savedMessagesCount} tips`}
              onPress={handleViewSavedMessages}
              iconBg={['#10B981', '#059669']}
            />
            <View style={styles.divider} />
            
            <ProfileOption
              icon="bell"
              title="Notifications"
              subtitle="Tax deadlines and reminders"
              onPress={() => navigation.navigate('Notifications')}
              iconBg={['#F8B259', '#D97706']}
            />
            <View style={styles.divider} />
            
            <ProfileOption
              icon="credit-card"
              title="Payment Methods"
              subtitle="Manage billing and payments"
              onPress={() => navigation.navigate('PaymentMethods')}
              iconBg={['#8B5CF6', '#7C3AED']}
            />
            <View style={styles.divider} />
            
            <ProfileOption
              icon="file-document-multiple"
              title="Tax Documents"
              subtitle="ITR, Form 16, receipts & more"
              onPress={() => navigation.navigate('TaxDocuments')}
              iconBg={['#EF4444', '#DC2626']}
            />
            <View style={styles.divider} />
            
            <ProfileOption
              icon="help-circle"
              title="Help Center"
              subtitle="Get support for tax queries"
              onPress={() => navigation.navigate('HelpCenter')}
              iconBg={['#6B7280', '#4B5563']}
              iconLibrary="MaterialIcons"
            />
            <View style={styles.divider} />
            
            <ProfileOption
              icon="email"
              title="Contact Us"
              subtitle="Reach our tax experts"
              onPress={() => navigation.navigate('ContactUs')}
              iconBg={['#06B6D4', '#0891B2']}
            />
            <View style={styles.divider} />
            
            <ProfileOption
              icon="info"
              title="About EasyTax"
              subtitle="App version and legal info"
              onPress={() => navigation.navigate('About')}
              iconBg={['#64748B', '#475569']}
              iconLibrary="MaterialIcons"
            />
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <MaterialIcons name="logout" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Logout from EasyTax</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={imageViewerVisible} transparent={true} animationType="fade">
        <View style={styles.imageViewerOverlay}>

          <TouchableOpacity style={styles.closeButton} onPress={closeImageViewer}>
            <MaterialIcons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.fullImageContainer,
              { transform: [{ scale: imageZoom }] }
            ]}
          >
            {profileImageUri && (
              <Image
                source={{ uri: profileImageUri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </Animated.View>

          <View style={styles.imageViewerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => showImagePickerOptions()}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#D96F32', '#C75D2C']} style={styles.actionButtonGradient}>
                <MaterialIcons name="edit" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={removeProfileImage}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.actionButtonGradient}>
                <MaterialIcons name="delete" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Remove</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  headerGradient: {
    paddingBottom: 30,
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
  editButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarInitial: {
    fontSize: 32,
    color: '#D96F32',
    fontWeight: '800',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    textAlign: 'center',
  },
  userBadge: {
    backgroundColor: 'rgba(248, 178, 89, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userRole: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 8,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  quickActionBtn: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  quickActionIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  quickActionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  quickActionBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#5D4E37',
    fontWeight: '700',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  modernOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#8B7355',
    fontWeight: '500',
  },
  chevronContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1.5,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    marginLeft: 84,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fee2e2',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
    marginLeft: 8,
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 24, 16, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(217, 111, 50, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fullImageContainer: {
    width: width * 0.9,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(217, 111, 50, 0.3)',
  },
  imageViewerActions: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default ProfileScreen;
