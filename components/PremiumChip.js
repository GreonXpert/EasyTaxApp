// components/PremiumChip.js
import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ChipContainer = styled.View`
  background-color: rgba(248, 178, 89, 0.15);
  border: 1.5px solid rgba(217, 111, 50, 0.3);
  border-radius: 20px;
  padding: 6px 12px;
  flex-direction: row;
  align-items: center;
  shadow-color: rgba(217, 111, 50, 0.2);
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const IconContainer = styled.View`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: rgba(217, 111, 50, 0.1);
  justify-content: center;
  align-items: center;
  margin-right: 8px;
`;

const ChipText = styled.Text`
  color: #8B4513;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.3px;
`;

const GradientBorder = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(135deg, #D96F32, #F8B259, #C75D2C);
`;

const InnerContainer = styled.View`
  background-color: rgba(243, 233, 220, 0.9);
  border-radius: 19px;
  padding: 6px 12px;
  flex-direction: row;
  align-items: center;
`;

const PremiumChip = ({ label, iconName, variant = 'default' }) => {
  // Tax-specific variants
  const getTaxLabel = () => {
    const taxLabels = {
      'premium': 'Tax Premium',
      'expert': 'Tax Expert',
      'consultant': 'Tax Consultant',
      'advisor': 'Tax Advisor',
      'pro': 'Tax Pro',
      'verified': 'Tax Verified',
      'certified': 'Tax Certified'
    };
    return taxLabels[label] || label;
  };

  const getTaxIcon = () => {
    const taxIcons = {
      'premium': 'certificate',
      'expert': 'account-tie',
      'consultant': 'briefcase-check',
      'advisor': 'school',
      'pro': 'star-circle',
      'verified': 'shield-check',
      'certified': 'medal'
    };
    return taxIcons[iconName] || iconName || 'certificate';
  };

  if (variant === 'gradient') {
    return (
      <GradientBorder>
        <InnerContainer>
          <IconContainer>
            <MaterialCommunityIcons 
              name={getTaxIcon()} 
              size={14} 
              color="#D96F32" 
            />
          </IconContainer>
          <ChipText>{getTaxLabel()}</ChipText>
        </InnerContainer>
      </GradientBorder>
    );
  }

  return (
    <ChipContainer>
      <IconContainer>
        <MaterialCommunityIcons 
          name={getTaxIcon()} 
          size={14} 
          color="#D96F32" 
        />
      </IconContainer>
      <ChipText>{getTaxLabel()}</ChipText>
    </ChipContainer>
  );
};

// Enhanced version with more tax-specific styling
export const TaxExpertChip = ({ level = 'certified', customLabel }) => {
  const levels = {
    'basic': {
      label: customLabel || 'Tax Basic',
      icon: 'account',
      bgColor: 'rgba(248, 178, 89, 0.1)',
      borderColor: 'rgba(248, 178, 89, 0.4)',
      textColor: '#B8860B'
    },
    'certified': {
      label: customLabel || 'Tax Certified',
      icon: 'certificate',
      bgColor: 'rgba(217, 111, 50, 0.12)',
      borderColor: 'rgba(217, 111, 50, 0.3)',
      textColor: '#8B4513'
    },
    'expert': {
      label: customLabel || 'Tax Expert',
      icon: 'medal',
      bgColor: 'rgba(199, 93, 44, 0.15)',
      borderColor: 'rgba(199, 93, 44, 0.4)',
      textColor: '#A0522D'
    },
    'premium': {
      label: customLabel || 'Premium Tax Pro',
      icon: 'crown',
      bgColor: 'rgba(248, 178, 89, 0.2)',
      borderColor: 'rgba(217, 111, 50, 0.5)',
      textColor: '#8B4513'
    }
  };

  const currentLevel = levels[level] || levels['certified'];

  const ExpertChipContainer = styled.View`
    background-color: ${currentLevel.bgColor};
    border: 2px solid ${currentLevel.borderColor};
    border-radius: 24px;
    padding: 8px 16px;
    flex-direction: row;
    align-items: center;
    shadow-color: ${currentLevel.borderColor};
    shadow-offset: 0px 3px;
    shadow-opacity: 0.15;
    shadow-radius: 6px;
    elevation: 4;
    min-height: 36px;
  `;

  const ExpertIconContainer = styled.View`
    width: 24px;
    height: 24px;
    border-radius: 12px;
    background-color: rgba(217, 111, 50, 0.15);
    justify-content: center;
    align-items: center;
    margin-right: 10px;
    border: 1px solid rgba(217, 111, 50, 0.2);
  `;

  const ExpertChipText = styled.Text`
    color: ${currentLevel.textColor};
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 0.4px;
  `;

  return (
    <ExpertChipContainer>
      <ExpertIconContainer>
        <MaterialCommunityIcons 
          name={currentLevel.icon} 
          size={16} 
          color="#D96F32" 
        />
      </ExpertIconContainer>
      <ExpertChipText>{currentLevel.label}</ExpertChipText>
    </ExpertChipContainer>
  );
};

export default PremiumChip;
