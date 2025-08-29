// components/GlassmorphicHeader.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const GlassmorphicHeader = ({
  title = 'EasyTax Assistant', // ✅ Updated default value
  subtitle = 'Tax Consultant', // ✅ Updated default value
  avatar,
  onProfilePress = () => {},
  onLogoutPress = () => {},
  onClearChat = () => {},
  onSaveChat = () => {},
  onPersonalInfoPress = () => {},
  profileImageUri,
  userName,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (menuVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [menuVisible]);

  // ✅ NEW: Pulse animation for tax consultation indicator
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handleProfile = () => {
    setMenuVisible(false);
    onProfilePress && onProfilePress();
  };

  const handleLogout = () => {
    setMenuVisible(false);
    onLogoutPress && onLogoutPress();
  };

  const handleClearChat = () => {
    setMenuVisible(false);
    onClearChat && onClearChat();
  };

  const handleSaveChat = () => {
    setMenuVisible(false);
    onSaveChat && onSaveChat();
  };

  const handlePersonalInfo = () => {
    onPersonalInfoPress && onPersonalInfoPress();
  };

  // ✅ UPDATED: Render avatar with EasyTax styling
  const renderAvatar = () => {
    try {
      if (avatar) {
        return (
          <View style={styles.avatarContainer}>
            {avatar}
          </View>
        );
      }

      if (profileImageUri) {
        return (
          <LinearGradient
            colors={['#D96F32', '#C75D2C']}
            style={styles.avatarRing}
          >
            <Image 
              source={{ uri: profileImageUri }} 
              style={styles.profileImage}
              onError={(error) => {
                console.log('Profile image load error:', error);
              }}
            />
          </LinearGradient>
        );
      }

      // Show default person icon with initials background
      return (
        <LinearGradient
          colors={['#D96F32', '#C75D2C']}
          style={styles.avatarRing}
        >
          <View style={styles.avatarCircle}>
            {userName && userName.length > 0 ? (
              <Text style={styles.avatarInitial}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <MaterialIcons name="account-balance" size={22} color="#D96F32" />
            )}
          </View>
        </LinearGradient>
      );
    } catch (error) {
      console.error('Error rendering avatar:', error);
      // Fallback to default icon
      return (
        <LinearGradient
          colors={['#D96F32', '#C75D2C']}
          style={styles.avatarRing}
        >
          <View style={styles.avatarCircle}>
            <MaterialIcons name="account-balance" size={22} color="#D96F32" />
          </View>
        </LinearGradient>
      );
    }
  };

  return (
    <>
      <View style={styles.headerOuter}>
        <LinearGradient
          colors={['rgba(217, 111, 50, 0.15)', 'rgba(248, 178, 89, 0.10)']}
          style={styles.gradientOutline}
        >
          <BlurView intensity={40} style={styles.blurPlate}>
            <View style={styles.innerContent}>
              <TouchableOpacity 
                style={styles.avatarWrapper}
                onPress={handleProfile}
                activeOpacity={0.7}
              >
                {renderAvatar()}
              </TouchableOpacity>

              <View style={styles.titleBlock}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{title || 'EasyTax Assistant'}</Text>
                  <Animated.View 
                    style={[
                      styles.taxIndicator,
                      { transform: [{ scale: pulseAnim }] }
                    ]}
                  >
                    <MaterialIcons name="verified" size={12} color="#D96F32" />
                    <Text style={styles.taxIndicatorText}>CERTIFIED</Text>
                  </Animated.View>
                </View>
                {subtitle && (
                  <Text style={styles.subtitle}>{subtitle}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.75}
              >
                <LinearGradient
                  colors={['rgba(217, 111, 50, 0.18)', 'rgba(248, 178, 89, 0.12)']}
                  style={styles.actionBtnCircle}
                >
                  <MaterialIcons name="more-vert" size={22} color="#8B4513" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </LinearGradient>

        {/* ✅ NEW: Tax Security Badge */}
        <View style={styles.securityBadge}>
          <LinearGradient
            colors={['rgba(248, 178, 89, 0.9)', 'rgba(217, 111, 50, 0.9)']}
            style={styles.securityBadgeGradient}
          >
            <Feather name="shield-check" size={12} color="#ffffff" />
            <Text style={styles.securityBadgeText}>Secure Tax Environment</Text>
          </LinearGradient>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.menuContainer,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.menuGlass}>
                  <TouchableOpacity style={styles.menuItem} onPress={handleClearChat}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#fee2e2' }]}>
                      <MaterialIcons name="delete-sweep" size={18} color="#ef4444" />
                    </View>
                    <Text style={[styles.menuText, { color: '#ef4444' }]}>Clear Chat</Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity style={styles.menuItem} onPress={handleSaveChat}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#dcfce7' }]}>
                      <MaterialIcons name="save-alt" size={18} color="#22c55e" />
                    </View>
                    <Text style={[styles.menuText, { color: '#22c55e' }]}>Save Chat</Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
                    <View style={styles.menuIconCircle}>
                      <Feather name="user" size={18} color="#D96F32" />
                    </View>
                    <Text style={styles.menuText}>Tax Profile</Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <View style={styles.menuIconCircle}>
                      <MaterialIcons name="logout" size={18} color="#D96F32" />
                    </View>
                    <Text style={styles.menuText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerOuter: {
    paddingTop: 48,
    paddingHorizontal: 18,
    zIndex: 10,
  },
  gradientOutline: {
    borderRadius: 28,
    padding: 2.5,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  blurPlate: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(243, 233, 220, 0.85)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  avatarWrapper: {
    marginRight: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(248, 178, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(217, 111, 50, 0.3)',
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  avatarInitial: {
    fontSize: 20,
    color: '#D96F32',
    fontWeight: '800',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#2D1810',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 2,
  },
  taxIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.3)',
    gap: 3,
  },
  taxIndicatorText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D96F32',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
    color: '#8B4513',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  actionBtn: {
    marginLeft: 10,
    borderRadius: 26,
  },
  actionBtnCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  securityBadge: {
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  securityBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
  },
  securityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 24, 16, 0.15)',
  },
  menuContainer: {
    position: 'absolute',
    top: 108,
    right: 25,
    width: 180,
    elevation: 15,
    zIndex: 25,
  },
  menuGlass: {
    paddingVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(243, 233, 220, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.2)',
    shadowColor: '#D96F32',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 178, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D1810',
    letterSpacing: 0.2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(217, 111, 50, 0.15)',
    marginHorizontal: 20,
    marginVertical: 2,
  },
});

export default GlassmorphicHeader;
