// --------------------------------------------------
// components/CustomLoader.js (NEW FILE)
// --------------------------------------------------
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Dot = ({ scale, color, delay = 0 }) => {
  return (
    <Animated.View 
      style={[
        styles.dot, 
        { 
          transform: [{ scale }],
          backgroundColor: color,
        }
      ]} 
    />
  );
};

// ✅ NEW: Tax Document Animation Component
const TaxDocumentLoader = ({ rotation }) => {
  return (
    <Animated.View style={[
      styles.documentContainer,
      { transform: [{ rotate: rotation }] }
    ]}>
      <MaterialIcons name="description" size={16} color="#D96F32" />
    </Animated.View>
  );
};

// ✅ NEW: Calculator Animation Component  
const CalculatorLoader = ({ scale }) => {
  return (
    <Animated.View style={[
      styles.calculatorContainer,
      { transform: [{ scale }] }
    ]}>
      <MaterialIcons name="calculate" size={14} color="#C75D2C" />
    </Animated.View>
  );
};

const CustomLoader = ({ variant = 'dots', message = 'Processing...' }) => {
  const animations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0), // Extra for complex animations
  ]).current;

  const documentRotation = useRef(new Animated.Value(0)).current;
  const calculatorPulse = useRef(new Animated.Value(1)).current;

  // ✅ Enhanced dot animation with staggered timing
  const animateDots = (index, delay = 0) => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animations[index], {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.timing(animations[index], {
            toValue: 0,
            duration: 800,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
  };

  // ✅ Tax document rotation animation
  const animateDocument = () => {
    Animated.loop(
      Animated.timing(documentRotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  // ✅ Calculator pulse animation
  const animateCalculator = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(calculatorPulse, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(calculatorPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    if (variant === 'dots' || variant === 'tax-processing') {
      // Staggered animation for dots
      animateDots(0, 0);
      animateDots(1, 200);
      animateDots(2, 400);
      
      if (variant === 'tax-processing') {
        animateDots(3, 600);
        animateDocument();
        animateCalculator();
      }
    }

    return () => {
      animations.forEach(anim => anim.stopAnimation());
      documentRotation.stopAnimation();
      calculatorPulse.stopAnimation();
    };
  }, [variant]);

  // ✅ Color scheme for different dots
  const dotColors = ['#D96F32', '#F8B259', '#C75D2C', '#D96F32'];
  
  const scales = animations.map(anim => anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1.2, 0.4],
  }));

  const documentRotationInterpolate = documentRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ✅ Render different variants
  const renderLoader = () => {
    switch (variant) {
      case 'tax-processing':
        return (
          <View style={styles.taxProcessingContainer}>
            <View style={styles.iconRow}>
              <TaxDocumentLoader rotation={documentRotationInterpolate} />
              <CalculatorLoader scale={calculatorPulse} />
            </View>
            <View style={styles.dotsContainer}>
              {scales.map((scale, index) => (
                <Dot 
                  key={index} 
                  scale={scale} 
                  color={dotColors[index]}
                />
              ))}
            </View>
            {message && (
              <Text style={styles.messageText}>{message}</Text>
            )}
          </View>
        );
      
      case 'simple':
        return (
          <View style={styles.simpleContainer}>
            {scales.slice(0, 3).map((scale, index) => (
              <Dot 
                key={index} 
                scale={scale} 
                color={dotColors[index]}
              />
            ))}
          </View>
        );
      
      default: // 'dots'
        return (
          <View style={styles.container}>
            <View style={styles.dotsContainer}>
              {scales.slice(0, 3).map((scale, index) => (
                <Dot 
                  key={index} 
                  scale={scale} 
                  color={dotColors[index]}
                />
              ))}
            </View>
            {message && (
              <Text style={styles.messageText}>{message}</Text>
            )}
          </View>
        );
    }
  };

  return renderLoader();
};

// ✅ Enhanced Tax Loader Component
export const TaxCalculationLoader = ({ message = 'Calculating taxes...' }) => {
  return (
    <CustomLoader 
      variant="tax-processing" 
      message={message} 
    />
  );
};

// ✅ Simple Tax Loader Component
export const SimpleTaxLoader = () => {
  return (
    <CustomLoader variant="simple" />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  taxProcessingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(243, 233, 220, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  simpleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    shadowColor: 'rgba(217, 111, 50, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  documentContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 178, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.3)',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  calculatorContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(199, 93, 44, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(199, 93, 44, 0.3)',
    shadowColor: '#C75D2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B4513',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: 4,
  },
});

export default CustomLoader;
