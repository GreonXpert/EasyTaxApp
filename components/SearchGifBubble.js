// components/SearchGifBubble.js
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Animated, 
  Easing, 
  Text 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SearchGifBubble = () => {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for the main bubble
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation for the calculator icon
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Scale animation for the bubble entrance
    const scaleAnimation = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 300,
        easing: Easing.back(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]);

    scaleAnimation.start();
    pulseAnimation.start();
    rotationAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotationAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.bubbleContainer,
          {
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim }
            ]
          }
        ]}
      >
        {/* Gradient Background Bubble */}
        <LinearGradient
          colors={['#ffffff', '#F3E9DC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBubble}
        >
          {/* Tax Processing Content */}
          <View style={styles.contentContainer}>
            {/* Animated Calculator Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ rotate: rotateInterpolation }]
                }
              ]}
            >
              <LinearGradient
                colors={['#D96F32', '#C75D2C']}
                style={styles.iconGradient}
              >
                <MaterialCommunityIcons 
                  name="calculator-variant" 
                  size={24} 
                  color="#ffffff" 
                />
              </LinearGradient>
            </Animated.View>

            {/* Tax Processing Text */}
            <View style={styles.textContainer}>
              <Text style={styles.processingText}>Processing tax query...</Text>
              <View style={styles.dotsContainer}>
                <AnimatedDot delay={0} />
                <AnimatedDot delay={200} />
                <AnimatedDot delay={400} />
              </View>
            </View>
          </View>

          {/* Professional Border Effect */}
          <View style={styles.borderAccent} />
        </LinearGradient>

        {/* Additional Tax-themed Icons */}
        <View style={styles.floatingIcons}>
          <Animated.View style={[styles.floatingIcon, { opacity: pulseAnim }]}>
            <MaterialCommunityIcons name="file-document" size={12} color="#F8B259" />
          </Animated.View>
          <Animated.View style={[styles.floatingIcon2, { opacity: pulseAnim }]}>
            <MaterialCommunityIcons name="currency-inr" size={10} color="#C75D2C" />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

// Animated Dot Component for Loading Effect
const AnimatedDot = ({ delay }) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const dotAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    dotAnimation.start();
    return () => dotAnimation.stop();
  }, [delay]);

  return (
    <Animated.View style={[styles.dot, { opacity: opacityAnim }]} />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  bubbleContainer: {
    position: 'relative',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientBubble: {
    borderRadius: 24,
    borderBottomLeftRadius: 8,
    padding: 18,
    minWidth: 200,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 111, 50, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  textContainer: {
    flex: 1,
  },
  processingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D96F32',
  },
  borderAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#F8B259',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 8,
  },
  floatingIcons: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  floatingIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(248, 178, 89, 0.2)',
    padding: 4,
    borderRadius: 8,
  },
  floatingIcon2: {
    position: 'absolute',
    top: 15,
    right: 25,
    backgroundColor: 'rgba(199, 93, 44, 0.2)',
    padding: 3,
    borderRadius: 6,
  },
});

export default SearchGifBubble;
