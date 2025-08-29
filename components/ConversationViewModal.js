// components/ConversationViewModal.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Markdown from 'react-native-markdown-display';

const { width, height } = Dimensions.get('window');

const ConversationViewModal = ({ visible, onClose, conversation }) => {
  const flatListRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!conversation) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ✅ Enhanced message type detection
  const getMessageTypeInfo = (message) => {
    if (message.type === 'audio') {
      return {
        icon: 'mic',
        label: 'Voice Consultation',
        isSpecial: true
      };
    }
    if (message.text && (message.text.toLowerCase().includes('tax') || 
        message.text.toLowerCase().includes('itr') || 
        message.text.toLowerCase().includes('deduction'))) {
      return {
        icon: 'description',
        label: 'Tax Discussion',
        isSpecial: true
      };
    }
    return { icon: null, label: null, isSpecial: false };
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.sender === 'user';
    const isAudioMessage = item.type === 'audio';
    const messageInfo = getMessageTypeInfo(item);

    return (
      <Animated.View 
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
          { opacity: fadeAnim }
        ]}
      >
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble
        ]}>
          {isUser ? (
            <LinearGradient
              colors={['#D96F32', '#C75D2C']}
              style={styles.userGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* ✅ User Message Header for Special Types */}
              {messageInfo.isSpecial && (
                <View style={styles.messageTypeHeader}>
                  <MaterialIcons 
                    name={messageInfo.icon} 
                    size={14} 
                    color="rgba(255,255,255,0.8)" 
                  />
                  <Text style={styles.messageTypeLabel}>
                    {messageInfo.label}
                  </Text>
                </View>
              )}
              
              <View style={styles.messageContent}>
                {isAudioMessage ? (
                  <View style={styles.audioMessage}>
                    <View style={styles.audioIconContainer}>
                      <MaterialIcons name="mic" size={16} color="#ffffff" />
                    </View>
                    <View style={styles.audioInfo}>
                      <Text style={styles.audioText}>
                        Voice Tax Query
                      </Text>
                      <Text style={styles.audioDuration}>
                        Duration: {item.duration}s
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Markdown style={userMarkdownStyles}>
                    {item.text}
                  </Markdown>
                )}
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.botContent}>
              <View style={styles.botAccent} />
              
              {/* ✅ Bot Response Header */}
              <View style={styles.botHeader}>
                <View style={styles.botAvatarContainer}>
                  <MaterialCommunityIcons 
                    name="calculator-variant" 
                    size={14} 
                    color="#D96F32" 
                  />
                </View>
                <Text style={styles.botName}>EasyTax Assistant</Text>
                {messageInfo.isSpecial && (
                  <View style={styles.specialBadge}>
                    <Text style={styles.specialBadgeText}>TAX</Text>
                  </View>
                )}
              </View>
              
              {isAudioMessage ? (
                <View style={styles.audioMessage}>
                  <View style={[styles.audioIconContainer, styles.botAudioIcon]}>
                    <MaterialIcons name="volume-up" size={16} color="#D96F32" />
                  </View>
                  <View style={styles.audioInfo}>
                    <Text style={styles.audioTextBot}>
                      Tax Advisory Response
                    </Text>
                    <Text style={styles.audioDurationBot}>
                      Duration: {item.duration}s
                    </Text>
                  </View>
                </View>
              ) : (
                <Markdown style={botMarkdownStyles}>
                  {item.text}
                </Markdown>
              )}
            </View>
          )}
          
          {/* ✅ Enhanced Timestamp with Status */}
          <View style={styles.timestampContainer}>
            <Text style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.botTimestamp
            ]}>
              {formatTime(item.timestamp)}
            </Text>
            {isUser && (
              <MaterialIcons 
                name="check" 
                size={12} 
                color="rgba(255,255,255,0.6)" 
                style={styles.deliveryStatus}
              />
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const handleScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const isAtBottom = contentOffset.y >= (contentSize.height - layoutMeasurement.height - 50);
    setIsScrolledToBottom(isAtBottom);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#D96F32" />
        
        {/* ✅ Enhanced Header with Tax Branding */}
        <LinearGradient
          colors={['#D96F32', '#C75D2C']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {conversation.title}
                </Text>
                <View style={styles.taxBadge}>
                  <MaterialCommunityIcons name="shield-check" size={12} color="#D96F32" />
                  <Text style={styles.taxBadgeText}>SECURED</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>
                {conversation.messageCount} messages • {formatDate(conversation.timestamp)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
              activeOpacity={0.7}
            >
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          {/* ✅ Header Stats */}
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-tie" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{conversation.consultantType}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="person" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{conversation.userName}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ✅ Messages List with Enhanced Styling */}
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={conversation.messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id || index.toString()}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            initialScrollIndex={conversation.messages.length > 0 ? conversation.messages.length - 1 : 0}
            getItemLayout={(data, index) => ({
              length: 120, // Approximate message height
              offset: 120 * index,
              index,
            })}
            onScrollToIndexFailed={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }}
          />
          
          {/* ✅ Scroll to Bottom Fab */}
          {!isScrolledToBottom && (
            <TouchableOpacity
              style={styles.scrollFab}
              onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F8B259', '#D96F32']}
                style={styles.fabGradient}
              >
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* ✅ Enhanced Footer with Tax Information */}
        <BlurView intensity={95} style={styles.footer}>
          <LinearGradient
            colors={['rgba(243, 233, 220, 0.9)', 'rgba(248, 178, 89, 0.1)']}
            style={styles.footerGradient}
          >
            <View style={styles.footerContent}>
              <View style={styles.footerSection}>
                <View style={styles.footerInfo}>
                  <View style={styles.footerIconContainer}>
                    <MaterialCommunityIcons name="shield-check" size={14} color="#D96F32" />
                  </View>
                  <Text style={styles.footerText}>
                    Secure Tax Consultation
                  </Text>
                </View>
                <View style={styles.footerInfo}>
                  <View style={styles.footerIconContainer}>
                    <MaterialIcons name="lock" size={14} color="#8B4513" />
                  </View>
                  <Text style={styles.footerText}>
                    End-to-end encrypted
                  </Text>
                </View>
              </View>
              
              <View style={styles.footerActions}>
                <TouchableOpacity style={styles.footerAction}>
                  <MaterialIcons name="share" size={16} color="#D96F32" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerAction}>
                  <MaterialIcons name="bookmark-border" size={16} color="#D96F32" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </SafeAreaView>
    </Modal>
  );
};

// ✅ Enhanced Markdown Styles for EasyTax
const userMarkdownStyles = {
  body: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  heading1: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  heading2: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  strong: {
    color: '#ffffff',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_inline: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paragraph: {
    marginVertical: 2,
  },
};

const botMarkdownStyles = {
  body: {
    color: '#2D1810',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  heading1: {
    color: '#D96F32',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  heading2: {
    color: '#C75D2C',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  strong: {
    color: '#D96F32',
    fontWeight: '700',
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_inline: {
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    color: '#C75D2C',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paragraph: {
    marginVertical: 2,
  },
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  header: {
    paddingTop: 8,
    paddingBottom: 4,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerInfo: {
    flex: 1,
    marginRight: 14,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginRight: 8,
    flex: 1,
    letterSpacing: 0.3,
  },
  taxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  taxBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D96F32',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F3E9DC',
    position: 'relative',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 120,
  },
  messageContainer: {
    marginVertical: 10,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '88%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  botBubble: {
    borderBottomLeftRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: 'rgba(217, 111, 50, 0.15)',
  },
  userGradient: {
    padding: 16,
  },
  botContent: {
    padding: 16,
    paddingLeft: 20,
    position: 'relative',
  },
  botAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#D96F32',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 6,
  },
  messageTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  messageTypeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  botHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  botAvatarContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B4513',
    flex: 1,
  },
  specialBadge: {
    backgroundColor: '#F8B259',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  specialBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  messageContent: {
    // Content wrapper
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAudioIcon: {
    backgroundColor: 'rgba(217, 111, 50, 0.2)',
  },
  audioInfo: {
    flex: 1,
  },
  audioText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  audioDuration: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  audioTextBot: {
    color: '#D96F32',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  audioDurationBot: {
    color: '#8B4513',
    fontSize: 12,
    fontWeight: '500',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '600',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  botTimestamp: {
    color: '#8B7355',
    alignSelf: 'flex-start',
  },
  deliveryStatus: {
    marginLeft: 2,
  },
  scrollFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 111, 50, 0.2)',
    overflow: 'hidden',
  },
  footerGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerSection: {
    flex: 1,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  footerIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  footerAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConversationViewModal;
