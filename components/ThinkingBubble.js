// components/ThinkingBubble.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, TouchableOpacity, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomLoader from './CustomLoader';

const { width } = Dimensions.get('window');

const defaultSteps = [
  { icon: 'search', text: 'Analyzing query', color: '#D96F32' },
  { icon: 'account_balance', text: 'Checking ITR rules', color: '#C75D2C' },
  { icon: 'calculate', text: 'Computing tax', color: '#F8B259' },
  { icon: 'receipt', text: 'GST compliance', color: '#D96F32' },
  { icon: 'verified', text: 'Tax insights', color: '#C75D2C' },
];

const AnimatedChip = ({ step, delay, index, isVisible }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      translateYAnim.setValue(20);
      
      // Staggered entrance animation
      const entranceAnimation = Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          delay: delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 500,
          delay: delay,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]);

      // Continuous glow animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500 + (index * 200),
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500 + (index * 200),
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ])
      );

      // Subtle pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1200 + (index * 150),
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200 + (index * 150),
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      entranceAnimation.start(() => {
        glowAnimation.start();
        pulseAnimation.start();
      });

      return () => {
        entranceAnimation.stop();
        glowAnimation.stop();
        pulseAnimation.stop();
      };
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, delay, index]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.2],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { scale: Animated.multiply(scaleAnim, pulseAnim) },
          { translateY: translateYAnim },
        ],
        opacity: opacityAnim,
        marginRight: 6,
        marginBottom: 8,
      }}
    >
      {/* Glow effect background */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          borderRadius: 16,
          backgroundColor: step.color,
          opacity: glowOpacity,
        }}
      />
      
      <LinearGradient
        colors={['#F3E9DC', '#ffffff', '#F3E9DC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 14,
          padding: 8,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: `${step.color}20`,
          shadowColor: step.color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          minWidth: 85,
          maxWidth: 100,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: step.color,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 6,
            shadowColor: step.color,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <MaterialIcons name={step.icon} size={12} color="#ffffff" />
        </View>
        <ChipText style={{ color: step.color }}>{step.text}</ChipText>
      </LinearGradient>
    </Animated.View>
  );
};

const ThinkingBubble = ({ steps = defaultSteps }) => {
  const [showSteps, setShowSteps] = useState(false);
  const containerScaleAnim = useRef(new Animated.Value(0.9)).current;
  const containerOpacityAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const arrowRotateAnim = useRef(new Animated.Value(0)).current;
  const stepsContainerHeightAnim = useRef(new Animated.Value(0)).current;
  const borderGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Enhanced container entrance
    Animated.parallel([
      Animated.spring(containerScaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(containerOpacityAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Enhanced shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Border glow animation
    const borderGlowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(borderGlowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(borderGlowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    );

    shimmerAnimation.start();
    borderGlowAnimation.start();

    return () => {
      shimmerAnimation.stop();
      borderGlowAnimation.stop();
    };
  }, []);

  const toggleSteps = () => {
    setShowSteps(!showSteps);
    
    Animated.timing(arrowRotateAnim, {
      toValue: showSteps ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(stepsContainerHeightAnim, {
      toValue: showSteps ? 0 : 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 320],
  });

  const arrowRotateInterpolate = arrowRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const stepsContainerHeight = stepsContainerHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  const stepsContainerOpacity = stepsContainerHeightAnim.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0, 0, 1],
  });

  const borderGlowOpacity = borderGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.15],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: containerScaleAnim }],
        opacity: containerOpacityAnim,
        marginVertical: 6,
      }}
    >
      {/* Outer glow effect */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: 22,
          backgroundColor: '#D96F32',
          opacity: borderGlowOpacity,
        }}
      />

      <BubbleContainer>
        <LinearGradient
          colors={['#F3E9DC', '#ffffff', '#F3E9DC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            minHeight: showSteps ? 180 : 65,
          }}
        >
          {/* Enhanced shimmer overlay */}
          <ShimmerOverlay>
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transform: [{ translateX: shimmerTranslateX }],
              }}
            >
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(217, 111, 50, 0.1)',
                  'rgba(217, 111, 50, 0.2)',
                  'rgba(217, 111, 50, 0.1)',
                  'transparent'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: 100, height: '100%' }}
              />
            </Animated.View>
          </ShimmerOverlay>

          <ContentContainer>
            <HeaderRow>
              <LoaderContainer>
                <CustomLoader />
              </LoaderContainer>
              
              <ThinkingTextContainer>
                <ThinkingText>EasyTax AI Computing</ThinkingText>
                <DotsContainer>
                  <AnimatedDot delay={0}>.</AnimatedDot>
                  <AnimatedDot delay={250}>.</AnimatedDot>
                  <AnimatedDot delay={500}>.</AnimatedDot>
                </DotsContainer>
              </ThinkingTextContainer>
              
              <TouchableOpacity 
                onPress={toggleSteps}
                activeOpacity={0.8}
                style={{ padding: 2 }}
              >
                <ArrowButton>
                  <LinearGradient
                    colors={['#D96F32', '#C75D2C']}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Animated.View
                      style={{
                        transform: [{ rotate: arrowRotateInterpolate }],
                      }}
                    >
                      <Feather name="chevron-down" size={14} color="#ffffff" />
                    </Animated.View>
                  </LinearGradient>
                </ArrowButton>
              </TouchableOpacity>
            </HeaderRow>

            <Animated.View
              style={{
                height: stepsContainerHeight,
                opacity: stepsContainerOpacity,
                overflow: 'hidden',
              }}
            >
              <Divider>
                <LinearGradient
                  colors={['transparent', '#D96F32', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 1.5,
                    borderRadius: 1,
                  }}
                />
              </Divider>
              
              <StepsTitle>EasyTax Processing Steps</StepsTitle>
              
              <ChipContainer>
                {steps.map((step, index) => (
                  <AnimatedChip
                    key={index}
                    step={step}
                    index={index}
                    delay={index * 100}
                    isVisible={showSteps}
                  />
                ))}
              </ChipContainer>
            </Animated.View>
          </ContentContainer>
        </LinearGradient>
      </BubbleContainer>
    </Animated.View>
  );
};

const AnimatedDot = ({ children, delay }) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const dotAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            delay: delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 400,
            delay: delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    dotAnimation.start();

    return () => dotAnimation.stop();
  }, [delay]);

  return (
    <Animated.Text
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
        fontSize: 18,
        fontWeight: '800',
        color: '#D96F32',
        marginLeft: 1,
      }}
    >
      {children}
    </Animated.Text>
  );
};

// Updated Styled Components with EasyTax colors
const BubbleContainer = styled.View`
  border-radius: 20px;
  width: ${Math.min(width - 60, 300)}px;
  elevation: 8;
  shadow-color: #D96F32;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 10px;
  align-self: flex-start;
  margin: 4px 16px;
  border-width: 1.5px;
  border-color: rgba(217, 111, 50, 0.12);
  background-color: rgba(243, 233, 220, 0.95);
`;

const ShimmerOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 20px;
`;

const ContentContainer = styled.View`
  padding: 16px;
  min-height: 50px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  min-height: 35px;
`;

const LoaderContainer = styled.View`
  margin-right: 12px;
`;

const ThinkingTextContainer = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const ThinkingText = styled.Text`
  font-family: System;
  font-size: 16px;
  font-weight: 800;
  color: #D96F32;
  letter-spacing: 0.3px;
`;

const DotsContainer = styled.View`
  flex-direction: row;
  margin-left: 3px;
  align-items: center;
`;

const ArrowButton = styled.View`
  border-radius: 14px;
  shadow-color: #D96F32;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.15;
  shadow-radius: 4px;
  elevation: 3;
`;

const Divider = styled.View`
  height: 1.5px;
  margin: 12px 0 10px 0;
  border-radius: 1px;
  overflow: hidden;
`;

const StepsTitle = styled.Text`
  font-family: System;
  font-size: 12px;
  font-weight: 700;
  color: #8B4513;
  margin-bottom: 10px;
  text-align: center;
  letter-spacing: 0.2px;
`;

const ChipContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  min-height: 50px;
`;

const ChipText = styled.Text`
  font-family: System;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1px;
  flex: 1;
`;

export default ThinkingBubble;
