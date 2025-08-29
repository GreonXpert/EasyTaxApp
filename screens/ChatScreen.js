// screens/ChatScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { sendMessage } from '../services/gemini.js';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';
import ThinkingBubble from '../components/ThinkingBubble';
import SearchGifBubble from '../components/SearchGifBubble.js';
import GlassmorphicHeader from '../components/GlassmorphicHeader.js';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

const ChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const { consultantType } = route.params || {}; // ✅ Add fallback
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(''); // ✅ Ensure always string
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStage, setThinkingStage] = useState(0);
  const flatListRef = useRef(null);
  const loadingTimerRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState(null);

  // ✅ AGGRESSIVE AUDIO SESSION MANAGEMENT
  useEffect(() => {
    const initializeAudioSession = async () => {
      try {
        console.log('🔧 Initializing OPTIMAL audio session...');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          shouldDuckAndroid: false,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          playThroughEarpieceAndroid: false,
        });
        console.log('✅ Audio session initialized for FULL VOLUME playback');
      } catch (error) {
        console.error('❌ Failed to initialize audio session:', error);
      }
    };
    initializeAudioSession();
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('@user_data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUserName(userData.name || ''); // ✅ Add fallback
        }
      } catch (e) {
        console.error("Failed to load user data.", e);
      }
    };
    fetchUserData();
  }, []);

  // ✅ NEW: Load profile image from AsyncStorage
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedImageUri = await AsyncStorage.getItem('@profile_image_uri');
        if (savedImageUri) {
          setProfileImageUri(savedImageUri);
        }
      } catch (error) {
        console.error('Failed to load profile image in ChatScreen:', error);
      }
    };
    loadProfileImage();

    // ✅ Listen for profile image updates when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfileImage();
    });

    return unsubscribe;
  }, [navigation]);

  // ✅ UPDATED: Tax-focused greeting message
  useEffect(() => {
    const getGreetingMessage = () => {
      const baseGreeting = userName ? `Namaste, ${userName}!` : 'Namaste!';
      const consultantTitle = consultantType || 'Tax Expert';
      
      // Tax-focused greeting based on consultant type
      if (consultantType) {
        switch (consultantType.toLowerCase()) {
          case 'income tax consultant':
            return `${baseGreeting} I'm your AI-powered Income Tax Consultant. Ready to help you with ITR filing, tax planning, and compliance. How can I assist you today?`;
          case 'gst consultant':
            return `${baseGreeting} I'm your GST Expert Assistant. I can help with GST registration, returns filing, and compliance matters. What would you like to know?`;
          case 'business tax advisor':
            return `${baseGreeting} I'm your Business Tax Advisor. I specialize in corporate taxation, compliance, and tax optimization strategies. How may I help?`;
          case 'ca consultant':
            return `${baseGreeting} I'm your Chartered Accountant Assistant. I can assist with comprehensive tax services, auditing, and financial compliance. What can I do for you?`;
          default:
            return `${baseGreeting} I'm your AI Tax Consultant at EasyTax. I'm here to help with all your taxation needs - from ITR filing to GST compliance. How can I assist you today?`;
        }
      }
      
      return `${baseGreeting} Welcome to EasyTax! I'm your AI Tax Assistant, ready to help with Income Tax, GST, TDS, and all taxation matters. What would you like to know?`;
    };

    setMessages([
      {
        id: '1',
        text: getGreetingMessage(),
        sender: 'bot',
        timestamp: new Date().getTime(),
      },
    ]);
  }, [consultantType, userName]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK", onPress: async () => {
          try {
            await AsyncStorage.removeItem('@user_data');
            navigation.replace('Login');
          } catch (e) { 
            Alert.alert("Error", "Could not logout."); 
          }
        }
      }
    ]);
  };

  const handleClearChat = () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to clear all tax consultation messages? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            const getGreetingMessage = () => {
              const baseGreeting = userName ? `Namaste, ${userName}!` : 'Namaste!';
              return `${baseGreeting} Welcome back to EasyTax! I'm your AI Tax Assistant, ready to help with Income Tax, GST, TDS, and all taxation matters. What would you like to know?`;
            };

            setMessages([
              {
                id: '1',
                text: getGreetingMessage(),
                sender: 'bot',
                timestamp: new Date().getTime(),
              },
            ]);
          }
        }
      ]
    );
  };

  const handleSaveChat = async () => {
    try {
      console.log('💾 Attempting to save chat with messages:', messages.length);
      if (!messages || messages.length <= 1) {
        Alert.alert("No Chat to Save", "There are no tax consultation messages to save in this conversation.");
        return;
      }

      const chatToSave = {
        id: `chat_${Date.now()}`,
        title: `Tax Consultation with ${consultantType || 'EasyTax Expert'}`,
        messages: [...messages],
        consultantType: consultantType || 'Tax Expert',
        timestamp: new Date().getTime(),
        userName: userName || 'User',
        messageCount: messages.length
      };

      const savedChatsString = await AsyncStorage.getItem('@saved_chats');
      let savedChats = savedChatsString ? JSON.parse(savedChatsString) : [];
      savedChats.push(chatToSave);
      await AsyncStorage.setItem('@saved_chats', JSON.stringify(savedChats));

      Alert.alert(
        "Tax Consultation Saved!",
        `Your tax consultation session (${messages.length} messages) has been saved successfully. Access it anytime from your saved chats.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('❌ Error saving chat:', error);
      Alert.alert("Save Error", "Failed to save tax consultation. Please try again.");
    }
  };

  const handleProfile = () => {
    navigation.dispatch(CommonActions.navigate({ name: 'Profile' }));
  };

  // ✅ UPDATED: Handle text messages with proper null checks
  const handleSend = async () => {
    // ✅ Add null/undefined checks and ensure input is a string
    const trimmedInput = (input || '').toString().trim();
    if (trimmedInput.length === 0) return;

    const userMessage = {
      id: Date.now().toString(),
      text: trimmedInput,
      sender: 'user',
      timestamp: new Date().getTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput(''); // ✅ Reset to empty string
    setIsLoading(true);
    setThinkingStage(1);
    loadingTimerRef.current = setTimeout(() => setThinkingStage(2), 2000);

    try {
      const response = await sendMessage(trimmedInput, userName || 'User', selectedLanguage);
      const botMessage = {
        id: Date.now().toString() + 'bot',
        text: response?.text || response || "I'm sorry, I couldn't process your tax query. Please try again or contact our support team.",
        sender: 'bot',
        timestamp: new Date().getTime(),
        language: response?.language || 'en',
        ...(response?.transcription && { transcription: response.transcription })
      };

      setMessages((prev) => [...prev, botMessage]);

      if (response?.language && response.language !== selectedLanguage) {
        setSelectedLanguage(response.language);
      }
    } catch (error) {
      console.error('❌ Send message error:', error);
      const errorMessage = {
        id: Date.now().toString() + 'err',
        text: "Sorry, I'm having trouble connecting to our tax servers. Please check your internet connection and try again.",
        sender: 'bot',
        timestamp: new Date().getTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      clearTimeout(loadingTimerRef.current);
      setIsLoading(false);
      setThinkingStage(0);
    }
  };

  // ✅ UPDATED: Handle audio messages with proper null checks
  const handleAudioMessage = async (audioData) => {
    try {
      if (!audioData) {
        console.error('❌ No audio data provided');
        return;
      }

      // Add user's audio message to chat
      const userAudioMessage = {
        ...audioData,
        timestamp: new Date().getTime(),
      };
      setMessages((prev) => [...prev, userAudioMessage]);
      console.log('🎵 User audio message added:', audioData);

      setIsLoading(true);
      setThinkingStage(1);
      loadingTimerRef.current = setTimeout(() => setThinkingStage(2), 2000);

      const response = await sendMessage(audioData, userName || 'User', selectedLanguage);
      const baseTimestamp = new Date().getTime();

      // Audio response message (if audio was generated)
      if (response?.isAudio && response?.audioUri) {
        const botAudioMessage = {
          id: baseTimestamp.toString() + 'bot_audio',
          type: 'audio',
          uri: response.audioUri,
          duration: response.duration || 0,
          sender: 'bot',
          timestamp: baseTimestamp,
          language: response.language || 'en',
          text: (response.text || '').replace(/🎤.*?\n\n/g, '').trim(),
          transcription: response.transcription
        };
        setMessages((prev) => [...prev, botAudioMessage]);
        console.log('🔊 Bot audio response added');
      }

      // Text response message (always shown)
      const botTextMessage = {
        id: (baseTimestamp + 1).toString() + 'bot_text',
        text: response?.text || "I processed your tax query. How else can I help you?",
        sender: 'bot',
        timestamp: baseTimestamp + 100,
        language: response?.language || 'en',
        transcription: response?.transcription
      };
      setMessages((prev) => [...prev, botTextMessage]);
      console.log('💬 Bot text response added');

      if (response?.language && response.language !== selectedLanguage) {
        setSelectedLanguage(response.language);
      }

      console.log('🤖 Bot responses added:', {
        audioResponse: !!(response?.audioUri),
        textResponse: true,
        language: response?.language,
        hasTranscription: !!(response?.transcription)
      });
    } catch (error) {
      console.error('❌ Failed to process audio message:', error);
      const errorMessage = {
        id: Date.now().toString() + 'err',
        text: "Sorry, I couldn't process your voice message. Please try again or type your tax question.",
        sender: 'bot',
        timestamp: new Date().getTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      clearTimeout(loadingTimerRef.current);
      setIsLoading(false);
      setThinkingStage(0);

      // Audio session reset
      console.log('🧹 NUCLEAR audio session decontamination after recording...');
      const decontaminationSequence = [100, 300, 500, 750, 1000];
      decontaminationSequence.forEach((delay, index) => {
        setTimeout(async () => {
          try {
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: false,
              playsInSilentModeIOS: true,
              staysActiveInBackground: false,
              interruptionModeIOS: InterruptionModeIOS.DuckOthers,
              shouldDuckAndroid: false,
              interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
              playThroughEarpieceAndroid: false,
            });
            console.log(`✅ Decontamination wave ${index + 1}/5 completed`);
            if (index === decontaminationSequence.length - 1) {
              console.log('🎵 AUDIO SESSION FULLY DECONTAMINATED - All audio will now play at FULL VOLUME');
            }
          } catch (error) {
            console.error(`❌ Decontamination wave ${index + 1} failed:`, error);
          }
        }, delay);
      });
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isLoading]);

  const renderThinkingItem = () => {
    if (thinkingStage === 1) return <ThinkingBubble />;
    if (thinkingStage === 2) return <SearchGifBubble />;
    return null;
  };

  const inputBarPadding = isKeyboardVisible
    ? (Platform.OS === 'ios' ? 10 : 8.5)
    : (Platform.OS === 'ios' ? 100 : 85);

  return (
    <View style={styles.screenContainer}>
      {/* ✅ UPDATED: EasyTax gradient background with warm orange tones */}
      <LinearGradient
        colors={['#F3E9DC', 'rgba(248, 178, 89, 0.2)', 'rgba(217, 111, 50, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ✅ UPDATED: Pass profile image to GlassmorphicHeader */}
      <GlassmorphicHeader
        title={consultantType || 'EasyTax Expert'}
        subtitle="AI Tax Assistant"
        onProfilePress={handleProfile}
        onLogoutPress={handleLogout}
        onClearChat={handleClearChat}
        onSaveChat={handleSaveChat}
        profileImageUri={profileImageUri}
        userName={userName}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <FlatList
          ref={flatListRef}
          data={isLoading ? [...messages, { id: 'thinking' }] : messages}
          renderItem={({ item }) =>
            item.id === 'thinking' ? renderThinkingItem() :
            <MessageBubble message={item} />
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          style={styles.flatList}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.inputBarContainer, { paddingBottom: inputBarPadding }]}>
          <InputBar
            input={input || ''} // ✅ Ensure always string
            setInput={setInput}
            onSend={handleSend}
            onAudioMessage={handleAudioMessage}
            isLoading={isLoading}
            selectedLanguage={selectedLanguage}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1, 
    backgroundColor: 'transparent', 
    position: 'relative' 
  },
  gradientBackground: { 
    ...StyleSheet.absoluteFillObject, 
    zIndex: 0 
  },
  keyboardAvoidingView: { 
    flex: 1 
  },
  flatList: { 
    flex: 1, 
    zIndex: 1 
  },
  messageList: { 
    paddingHorizontal: 10, 
    paddingTop: 6, 
    paddingBottom: 12, 
    backgroundColor: 'transparent', 
    zIndex: 1 
  },
  inputBarContainer: { 
    paddingHorizontal: 6, 
    paddingTop: 8, 
    backgroundColor: 'rgba(255,255,255,0.92)', 
    borderTopLeftRadius: 19, 
    borderTopRightRadius: 19, 
    shadowColor: '#D96F32', // ✅ UPDATED: Changed from teal to EasyTax orange
    shadowOpacity: 0.12, // ✅ Slightly increased for better visibility
    shadowRadius: 12, // ✅ Increased for softer shadow
    shadowOffset: { height: -3, width: 0 }, // ✅ Slightly more pronounced shadow
    elevation: 8, // ✅ Increased elevation for Android
    borderTopWidth: 1.5, // ✅ Added subtle border
    borderTopColor: 'rgba(217, 111, 50, 0.1)', // ✅ EasyTax orange border
  }
});

export default ChatScreen;
