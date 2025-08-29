// screens/SavedMessagesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import ConversationViewModal from '../components/ConversationViewModal'; // ✅ NEW: Import modal

const { width, height } = Dimensions.get('window');

const SavedMessagesScreen = () => {
  const [savedMessages, setSavedMessages] = useState([]);
  const [savedChats, setSavedChats] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null); // ✅ NEW: Modal state
  const [modalVisible, setModalVisible] = useState(false); // ✅ NEW: Modal visibility
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchSavedData = async () => {
      try {
        // Fetch individual saved messages
        const messagesString = await AsyncStorage.getItem('@saved_messages');
        if (messagesString) {
          setSavedMessages(JSON.parse(messagesString));
        }

        // Fetch saved complete chats
        const chatsString = await AsyncStorage.getItem('@saved_chats');
        if (chatsString) {
          const chats = JSON.parse(chatsString);
          console.log('📊 Loaded saved tax consultations:', chats.length);
          setSavedChats(chats);
        }
      } catch (error) {
        console.error('Error fetching saved tax data:', error);
      }
    };

    if (isFocused) {
      fetchSavedData();
    }
  }, [isFocused]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const deleteMessage = async (messageId) => {
    const updatedMessages = savedMessages.filter(msg => msg.id !== messageId);
    setSavedMessages(updatedMessages);
    await AsyncStorage.setItem('@saved_messages', JSON.stringify(updatedMessages));
  };

  const deleteChat = async (chatId) => {
    const updatedChats = savedChats.filter(chat => chat.id !== chatId);
    setSavedChats(updatedChats);
    await AsyncStorage.setItem('@saved_chats', JSON.stringify(updatedChats));
  };

  // ✅ NEW: Handle conversation view
  const viewConversation = (conversation) => {
    setSelectedConversation(conversation);
    setModalVisible(true);
  };

  // ✅ NEW: Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedConversation(null);
  };

  // ✅ UPDATED: Render saved chat item with view button and tax context
  const renderChatItem = ({ item, index }) => (
    <View style={styles.messageCard}>
      {/* ✅ UPDATED: Tax-focused Chat Header */}
      <View style={styles.messageHeader}>
        <View style={styles.messageIcon}>
          <MaterialCommunityIcons name="calculator-variant" size={16} color="#D96F32" />
        </View>
        <Text style={styles.messageIndex} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteChat(item.id)}
        >
          <MaterialIcons name="delete" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* ✅ UPDATED: Tax-focused Chat Content Preview */}
      <View style={styles.messageContent}>
        <Text style={styles.chatPreview}>
          📊 {item.messageCount} messages with {item.consultantType}
        </Text>
        <Text style={styles.chatDetails}>
          Taxpayer: {item.userName}
        </Text>
        <View style={styles.taxTypeBadge}>
          <Text style={styles.taxTypeText}>Tax Consultation</Text>
        </View>
      </View>

      {/* ✅ UPDATED: Action Buttons with EasyTax colors */}
      <View style={styles.chatActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => viewConversation(item)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#D96F32', '#C75D2C']}
            style={styles.viewButtonGradient}
          >
            <MaterialCommunityIcons name="file-document" size={16} color="#ffffff" />
            <Text style={styles.viewButtonText}>View Tax Consultation</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ✅ UPDATED: Chat Footer */}
      <View style={styles.messageFooter}>
        <View style={styles.timestampContainer}>
          <MaterialIcons name="access-time" size={12} color="#8B7355" />
          <Text style={styles.timestamp}>{formatDateTime(item.timestamp)}</Text>
        </View>
      </View>
    </View>
  );

  // ✅ UPDATED: Render individual message item with tax context
  const renderMessageItem = ({ item, index }) => (
    <View style={styles.messageCard}>
      {/* ✅ UPDATED: Tax-focused Message Header */}
      <View style={styles.messageHeader}>
        <View style={styles.messageIcon}>
          <MaterialCommunityIcons name="message-text" size={16} color="#D96F32" />
        </View>
        <Text style={styles.messageIndex}>Tax Tip #{index + 1}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteMessage(item.id)}
        >
          <MaterialIcons name="delete" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Message Content */}
      <View style={styles.messageContent}>
        <Markdown style={markdownStyles}>{item.text || 'No tax content available'}</Markdown>
      </View>

      {/* Message Footer */}
      <View style={styles.messageFooter}>
        <View style={styles.timestampContainer}>
          <MaterialIcons name="access-time" size={12} color="#8B7355" />
          <Text style={styles.timestamp}>{formatDateTime(item.timestamp)}</Text>
        </View>
      </View>
    </View>
  );

  // ✅ UPDATED: Tax-focused Empty State
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={['#D96F32', '#C75D2C']}
          style={styles.emptyIconGradient}
        >
          <MaterialCommunityIcons name="file-document-multiple" size={52} color="#ffffff" />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>No Saved Tax Data</Text>
      <Text style={styles.emptySubtitle}>
        Save important tax advice or complete consultations{'\n'}to access them anytime for future reference.
      </Text>
      <TouchableOpacity
        style={styles.startChattingButton}
        onPress={() => navigation.goBack()}
      >
        <LinearGradient
          colors={['#D96F32', '#C75D2C']}
          style={styles.startChattingGradient}
        >
          <MaterialCommunityIcons name="calculator-variant" size={20} color="#ffffff" />
          <Text style={styles.startChattingText}>Start Tax Consultation</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ UPDATED: EasyTax Header with Gradient Background */}
      <LinearGradient
        colors={['#D96F32', '#C75D2C', '#8B4513']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>📊 Saved Tax Data</Text>

          <View style={styles.headerRight}>
            <View style={styles.messageCountBadge}>
              <Text style={styles.messageCountText}>
                {savedMessages.length + savedChats.length}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.contentContainer}>
        {savedMessages.length > 0 || savedChats.length > 0 ? (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {/* ✅ UPDATED: Show Saved Tax Consultations First */}
            {savedChats.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📋 Saved Tax Consultations</Text>
                <FlatList
                  data={savedChats}
                  renderItem={renderChatItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              </>
            )}

            {/* ✅ UPDATED: Show Individual Tax Messages */}
            {savedMessages.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>💡 Important Tax Tips</Text>
                <FlatList
                  data={savedMessages}
                  renderItem={renderMessageItem}
                  keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                  scrollEnabled={false}
                />
              </>
            )}
          </ScrollView>
        ) : (
          <EmptyState />
        )}
      </View>

      {/* ✅ NEW: Conversation View Modal */}
      <ConversationViewModal
        visible={modalVisible}
        onClose={closeModal}
        conversation={selectedConversation}
      />
    </SafeAreaView>
  );
};

// ✅ UPDATED: Tax-focused Markdown Styles with EasyTax colors
const markdownStyles = {
  body: {
    color: '#2D1810',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  heading1: {
    color: '#D96F32',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  heading2: {
    color: '#C75D2C',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  paragraph: {
    marginBottom: 8,
  },
  strong: {
    color: '#D96F32',
    fontWeight: '800',
  },
  list_item: {
    color: '#2D1810',
    fontSize: 15,
  },
  code_inline: {
    backgroundColor: '#F3E9DC',
    color: '#C75D2C',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  headerGradient: {
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
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
    backgroundColor: 'rgba(255,255,255,0.25)',
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
  headerRight: {
    width: 42,
    alignItems: 'center',
  },
  messageCountBadge: {
    backgroundColor: 'rgba(248, 178, 89, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  messageCountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  contentContainer: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(217, 111, 50, 0.1)',
  },
  messageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.2)',
  },
  messageIndex: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1810',
    letterSpacing: 0.2,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  messageContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  messageFooter: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#8B7355',
    marginLeft: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 16,
    marginTop: 20,
    paddingHorizontal: 4,
    letterSpacing: 0.3,
  },
  chatPreview: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D96F32',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  chatDetails: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '600',
    marginBottom: 8,
  },
  // ✅ NEW: Tax type badge
  taxTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(248, 178, 89, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 178, 89, 0.3)',
  },
  taxTypeText: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '700',
  },
  // ✅ UPDATED: Chat action styles with EasyTax colors
  chatActions: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  viewButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  viewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 10,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // ✅ UPDATED: Empty state with EasyTax colors
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 28,
  },
  emptyIconGradient: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
    fontWeight: '500',
  },
  startChattingButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startChattingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    gap: 12,
  },
  startChattingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default SavedMessagesScreen;
