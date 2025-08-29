// navigation/MainTabNavigator.js

import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolateColor,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 2;

const LiquidTabBar = ({ state, descriptors, navigation }) => {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Smooth liquid animation with spring
    translateX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 20,
      stiffness: 90,
      mass: 0.8,
    });

    // Scale animation for active tab
    scale.value = withSpring(1.05, { // ✅ REDUCED: from 1.1 to 1.05
      damping: 15,
      stiffness: 150,
    });
  }, [state.index]);

  // Animated liquid indicator style
  const liquidIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { 
          scaleX: interpolate(
            translateX.value,
            [0, TAB_WIDTH],
            [1, 1.02] // ✅ REDUCED: from 1.05 to 1.02
          )
        }
      ],
      backgroundColor: interpolateColor(
        translateX.value,
        [0, TAB_WIDTH],
        ['#D96F32', '#F8B259']
      ),
      shadowColor: interpolateColor(
        translateX.value,
        [0, TAB_WIDTH],
        ['#D96F32', '#F8B259']
      ),
    };
  });

  // Floating animation for the entire tab bar
  const floatingStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(-2.5, { // ✅ REDUCED: from -5 to -2.5
            damping: 20,
            stiffness: 90,
          }),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.tabContainer, floatingStyle]}>
      {/* Liquid Background */}
      <LinearGradient
        colors={['rgba(255,255,255,0.98)', 'rgba(248,248,248,0.95)']}
        style={styles.tabBarBackground}
      >
        {/* Animated Liquid Indicator */}
        <Animated.View style={[styles.liquidIndicator, liquidIndicatorStyle]} />
        
        {/* Glow Effect */}
        <Animated.View style={[styles.glowEffect, liquidIndicatorStyle]} />

        {/* Tab Buttons */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Tab configuration - only 2 tabs
          const config = {
            Home: {
              label: 'Home',
              icon: 'home',
              IconComponent: MaterialIcons,
            },
            Tax: {
              label: 'Income Tax',
              icon: 'calculator-variant',
              IconComponent: MaterialCommunityIcons,
            },
          };

          const tabConfig = config[route.name];
          if (!tabConfig) return null;

          // Animated tab style
          const animatedTabStyle = useAnimatedStyle(() => {
            const inputRange = [index - 1, index, index + 1];
            const isActive = state.index === index;
            
            return {
              transform: [
                {
                  scale: interpolate(
                    state.index,
                    inputRange,
                    [0.9, isActive ? 1.05 : 0.9, 0.9], // ✅ REDUCED: from 0.85/1.1 to 0.9/1.05
                    'clamp'
                  ),
                },
                {
                  translateY: interpolate(
                    state.index,
                    inputRange,
                    [0, isActive ? -1 : 0, 0], // ✅ REDUCED: from -2 to -1
                    'clamp'
                  ),
                },
              ],
            };
          });

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabButton}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.tabContent, animatedTabStyle]}>
                <tabConfig.IconComponent
                  name={tabConfig.icon}
                  size={isFocused ? 22 : 20} // ✅ REDUCED: from 26/22 to 22/20
                  color={isFocused ? '#ffffff' : '#8B7355'}
                  style={styles.tabIcon}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? '#ffffff' : '#8B7355',
                      fontWeight: isFocused ? '800' : '600',
                      fontSize: isFocused ? 10 : 9, // ✅ REDUCED: from 12/11 to 10/9
                    },
                  ]}
                >
                  {tabConfig.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>

      {/* Liquid Wave Effect */}
      <View style={styles.waveContainer}>
        <LinearGradient
          colors={['#D96F32', '#F8B259', '#D96F32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.liquidWave}
        />
      </View>
    </Animated.View>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar
      }}
      tabBar={(props) => <LiquidTabBar {...props} />}
    >
      {/* ✅ Only 2 tabs as requested */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen 
        name="Tax" 
        component={ChatScreen} 
        initialParams={{ consultantType: ' Tax Consultant' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 4, // ✅ REDUCED: from 20/8 to 10/4
  },
  tabBarBackground: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 43 : 35, // ✅ REDUCED BY 50%: from 85/70 to 43/35
    borderTopLeftRadius: 20, // ✅ REDUCED: from 28 to 20
    borderTopRightRadius: 20, // ✅ REDUCED: from 28 to 20
    borderBottomLeftRadius: 12, // ✅ REDUCED: from 16 to 12
    borderBottomRightRadius: 12, // ✅ REDUCED: from 16 to 12
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: -4 }, // ✅ REDUCED: from -8 to -4
    shadowOpacity: 0.25,
    shadowRadius: 8, // ✅ REDUCED: from 16 to 8
    elevation: 6, // ✅ REDUCED: from 12 to 6
    position: 'relative',
    overflow: 'hidden',
  },
  liquidIndicator: {
    position: 'absolute',
    width: TAB_WIDTH,
    height: '100%',
    borderTopLeftRadius: 20, // ✅ REDUCED: from 28 to 20
    borderTopRightRadius: 20, // ✅ REDUCED: from 28 to 20
    borderBottomLeftRadius: 12, // ✅ REDUCED: from 16 to 12
    borderBottomRightRadius: 12, // ✅ REDUCED: from 16 to 12
    top: 0,
    left: 0,
    zIndex: 1,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 }, // ✅ REDUCED: from 4 to 2
    shadowOpacity: 0.3,
    shadowRadius: 4, // ✅ REDUCED: from 8 to 4
    elevation: 3, // ✅ REDUCED: from 6 to 3
  },
  glowEffect: {
    position: 'absolute',
    width: TAB_WIDTH + 10, // ✅ REDUCED: from +20 to +10
    height: '110%', // ✅ REDUCED: from 120% to 110%
    borderRadius: 25, // ✅ REDUCED: from 35 to 25
    top: -5, // ✅ REDUCED: from -10 to -5
    left: -5, // ✅ REDUCED: from -10 to -5
    zIndex: 0,
    opacity: 0.3,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10, // ✅ REDUCED: from 20 to 10
    elevation: 2, // ✅ REDUCED: from 3 to 2
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    paddingVertical: 4, // ✅ REDUCED: from 8 to 4
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2, // ✅ REDUCED: from 4 to 2
  },
  tabIcon: {
    marginBottom: 2, // ✅ REDUCED: from 4 to 2
  },
  tabLabel: {
    textAlign: 'center',
    letterSpacing: 0.2, // ✅ REDUCED: from 0.3 to 0.2
    textTransform: 'capitalize',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2, // ✅ REDUCED: from 4 to 2
    overflow: 'hidden',
  },
  liquidWave: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 12, // ✅ REDUCED: from 16 to 12
    borderBottomRightRadius: 12, // ✅ REDUCED: from 16 to 12
  },
});

export default MainTabNavigator;
