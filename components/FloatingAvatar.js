// components/FloatingAvatar.js
import React from 'react';
import styled from 'styled-components/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';

const AvatarWrapper = styled.View`
  position: relative;
`;

const AvatarContainer = styled.View`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  /* Shadow props for iOS */
  shadow-color: ${(props) => props.shadowColor || '#D96F32'};
  shadow-offset: 0px 6px;
  shadow-opacity: 0.25;
  shadow-radius: 8px;
  /* Elevation for Android */
  elevation: 10;
  border: 2px solid rgba(217, 111, 50, 0.2);
`;

const StatusIndicator = styled.View`
  position: absolute;
  top: -2px;
  right: -2px;
  width: ${(props) => props.size || 16}px;
  height: ${(props) => props.size || 16}px;
  border-radius: ${(props) => (props.size || 16) / 2}px;
  background-color: ${(props) => props.statusColor || '#22c55e'};
  border: 2px solid #ffffff;
  z-index: 10;
  /* Shadow props for iOS */
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 3px;
  /* Elevation for Android */
  elevation: 5;
`;

const CertificationBadge = styled.View`
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: ${(props) => props.size || 18}px;
  height: ${(props) => props.size || 18}px;
  border-radius: ${(props) => (props.size || 18) / 2}px;
  background-color: ${(props) => props.badgeColor || '#F8B259'};
  justify-content: center;
  align-items: center;
  border: 2px solid #ffffff;
  z-index: 10;
  /* Shadow props for iOS */
  shadow-color: #F8B259;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
  /* Elevation for Android */
  elevation: 6;
`;

// ✅ Dynamic Professional Container
const ProfessionalContainer = styled.View`
  width: ${(props) => props.containerSize}px;
  height: ${(props) => props.containerSize}px;
  border-radius: ${(props) => props.containerSize / 2}px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  shadow-color: #D96F32;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.3;
  shadow-radius: 10px;
  elevation: 12;
  border: 3px solid rgba(248, 178, 89, 0.3);
`;

const DepartmentContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  shadow-color: #D96F32;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.2;
  shadow-radius: 6px;
  elevation: 8;
  border: 2px solid rgba(217, 111, 50, 0.3);
`;

// ✅ Shared utility function
const getStatusColor = (status = 'online') => {
  const statusMap = {
    'online': '#22c55e',
    'busy': '#f59e0b', 
    'away': '#ef4444',
    'offline': '#6b7280',
    'consulting': '#8b5cf6'
  };
  return statusMap[status] || statusMap['online'];
};

const FloatingAvatar = ({ 
  kind = 'bot', 
  status = 'online', 
  certified = true, 
  expertise = 'general' 
}) => {
  
  // ✅ Tax-specific icon mapping
  const getIconData = () => {
    const iconMap = {
      'tax-advisor': {
        icon: 'account-tie',
        library: 'MaterialCommunityIcons',
        gradient: ['#D96F32', '#C75D2C'],
        shadowColor: '#D96F32'
      },
      'tax-expert': {
        icon: 'briefcase-check',
        library: 'MaterialCommunityIcons', 
        gradient: ['#C75D2C', '#8B4513'],
        shadowColor: '#C75D2C'
      },
      'ca-consultant': {
        icon: 'certificate',
        library: 'MaterialCommunityIcons',
        gradient: ['#F8B259', '#D96F32'],
        shadowColor: '#F8B259'
      },
      'itr-specialist': {
        icon: 'file-document-multiple',
        library: 'MaterialCommunityIcons',
        gradient: ['#D96F32', '#F8B259'],
        shadowColor: '#D96F32'
      },
      'user': {
        icon: 'account-circle',
        library: 'MaterialCommunityIcons',
        gradient: ['rgba(243, 233, 220, 0.9)', 'rgba(217, 111, 50, 0.2)'],
        shadowColor: '#D96F32'
      },
      'bot': {
        icon: 'calculator-variant',
        library: 'MaterialCommunityIcons',
        gradient: ['#D96F32', '#C75D2C'],
        shadowColor: '#D96F32'
      }
    };
    
    return iconMap[kind] || iconMap['bot'];
  };

  const iconData = getIconData();
  const IconComponent = iconData.library === 'MaterialCommunityIcons' 
    ? MaterialCommunityIcons 
    : MaterialIcons;

  return (
    <AvatarWrapper>
      <AvatarContainer shadowColor={iconData.shadowColor}>
        <LinearGradient
          colors={iconData.gradient}
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 24,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconComponent 
            name={iconData.icon} 
            size={kind === 'user' ? 32 : 28} 
            color={kind === 'user' ? '#8B4513' : '#ffffff'} 
          />
        </LinearGradient>
      </AvatarContainer>

      {/* Status Indicator */}
      <StatusIndicator statusColor={getStatusColor(status)} />

      {/* Certification Badge */}
      {certified && (
        <CertificationBadge>
          <MaterialIcons name="verified" size={10} color="#ffffff" />
        </CertificationBadge>
      )}
    </AvatarWrapper>
  );
};

// ✅ Enhanced Tax Professional Avatar Component
export const TaxProfessionalAvatar = ({ 
  level = 'advisor',
  name,
  status = 'online',
  size = 'medium' 
}) => {
  
  const sizeMap = {
    'small': { container: 40, icon: 22, status: 12, badge: 14 },
    'medium': { container: 52, icon: 28, status: 16, badge: 18 },
    'large': { container: 64, icon: 36, status: 20, badge: 22 }
  };
  
  const dimensions = sizeMap[size] || sizeMap['medium'];

  const levelConfig = {
    'junior': { 
      gradient: ['#F8B259', '#D96F32'], 
      icon: 'account-school', 
      badgeColor: '#22c55e' 
    },
    'advisor': { 
      gradient: ['#D96F32', '#C75D2C'], 
      icon: 'account-tie', 
      badgeColor: '#3b82f6' 
    },
    'expert': { 
      gradient: ['#C75D2C', '#8B4513'], 
      icon: 'medal', 
      badgeColor: '#f59e0b' 
    },
    'senior': { 
      gradient: ['#8B4513', '#654321'], 
      icon: 'crown', 
      badgeColor: '#8b5cf6' 
    }
  };

  const config = levelConfig[level] || levelConfig['advisor'];

  return (
    <AvatarWrapper>
      <ProfessionalContainer containerSize={dimensions.container}>
        <LinearGradient
          colors={config.gradient}
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: dimensions.container / 2,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {name ? (
            <Text
              style={{
                fontSize: dimensions.icon - 8,
                fontWeight: '800',
                color: '#ffffff',
                letterSpacing: 1,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <MaterialCommunityIcons 
              name={config.icon} 
              size={dimensions.icon} 
              color="#ffffff" 
            />
          )}
        </LinearGradient>
      </ProfessionalContainer>

      <StatusIndicator 
        statusColor={getStatusColor(status)} 
        size={dimensions.status}
      />

      <CertificationBadge 
        size={dimensions.badge}
        badgeColor={config.badgeColor}
      >
        <MaterialIcons name="verified" size={dimensions.badge - 6} color="#ffffff" />
      </CertificationBadge>
    </AvatarWrapper>
  );
};

// ✅ Tax Department Avatar Component
export const TaxDepartmentAvatar = ({ department = 'income-tax' }) => {
  const departmentConfig = {
    'income-tax': {
      gradient: ['#D96F32', '#C75D2C'],
      icon: 'account-balance',
      backgroundColor: '#F3E9DC'
    },
    'gst': {
      gradient: ['#F8B259', '#D96F32'],
      icon: 'store',
      backgroundColor: 'rgba(248, 178, 89, 0.2)'
    },
    'corporate': {
      gradient: ['#C75D2C', '#8B4513'],
      icon: 'domain',
      backgroundColor: 'rgba(199, 93, 44, 0.2)'
    },
    'audit': {
      gradient: ['#8B4513', '#654321'],
      icon: 'search',
      backgroundColor: 'rgba(139, 69, 19, 0.2)'
    }
  };

  const config = departmentConfig[department] || departmentConfig['income-tax'];

  return (
    <DepartmentContainer>
      <LinearGradient
        colors={config.gradient}
        style={{
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialIcons 
          name={config.icon} 
          size={24} 
          color="#ffffff" 
        />
      </LinearGradient>
    </DepartmentContainer>
  );
};

export default FloatingAvatar;
