// components/MessageBubble.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Share,
  Alert,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

const { width } = Dimensions.get('window');

// ✅ SIMPLIFIED Audio Wave Component for User Messages Only
const AudioPlaybackWave = ({ isPlaying }) => {
  const waveAnimations = useRef([...Array(8)].map(() => new Animated.Value(0.2))).current;

  useEffect(() => {
    if (isPlaying) {
      const animations = waveAnimations.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.8 + Math.random() * 0.2,
              duration: 300 + Math.random() * 200,
              delay: index * 40,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.2 + Math.random() * 0.3,
              duration: 300 + Math.random() * 200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ])
        );
      });
      animations.forEach(anim => anim.start());
      return () => animations.forEach(anim => anim.stop());
    } else {
      waveAnimations.forEach(anim => anim.setValue(0.2));
    }
  }, [isPlaying]);

  return (
    <View style={styles.playbackWaveContainer}>
      {waveAnimations.map((anim, index) => {
        const height = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [3, 18 + (index % 3) * 2],
        });
        return (
          <Animated.View
            key={index}
            style={[styles.playbackWaveBar, { height }]}
          />
        );
      })}
    </View>
  );
};

// ✅ USER Audio Message Component (with timeline)
const UserAudioMessage = ({ message, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnloaded, setIsUnloaded] = useState(false);
  const positionIntervalRef = useRef(null);

  // Cleanup with unload tracking
  useEffect(() => {
    return () => {
      if (sound && !isUnloaded) {
        sound.unloadAsync()
          .then(() => setIsUnloaded(true))
          .catch(() => {});
      }
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    };
  }, [sound, isUnloaded]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const decontaminateAudioSession = async () => {
    try {
      console.log('🧹 DECONTAMINATING audio session - NUCLEAR RESET...');
      for (let i = 0; i < 3; i++) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          shouldDuckAndroid: false,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          playThroughEarpieceAndroid: false,
        });
        await new Promise(resolve => setTimeout(resolve, 150));
        console.log(`✅ Audio decontamination attempt ${i + 1}/3 completed`);
      }
      console.log('🎵 Audio session FULLY DECONTAMINATED - Ready for FULL VOLUME playback');
    } catch (error) {
      console.error('❌ Audio decontamination failed:', error);
    }
  };

  const togglePlayback = async () => {
    try {
      if (sound && !isUnloaded) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
          if (positionIntervalRef.current) {
            clearInterval(positionIntervalRef.current);
          }
        } else {
          await decontaminateAudioSession();
          await sound.setVolumeAsync(1.0);
          const status = await sound.getStatusAsync();
          if (status.positionMillis === status.durationMillis || status.didJustFinish) {
            await sound.replayAsync();
          } else {
            await sound.playAsync();
          }
          setIsPlaying(true);
          startPositionTracking();
        }
      } else {
        setIsLoading(true);
        await decontaminateAudioSession();
        console.log('🎵 Loading audio from URI:', message.uri);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: message.uri },
          {
            shouldPlay: false,
            volume: 1.0,
            rate: 1.0,
            shouldCorrectPitch: true,
            progressUpdateIntervalMillis: 100,
          }
        );
        setSound(newSound);
        setIsUnloaded(false);
        setIsLoading(false);
        await newSound.setVolumeAsync(1.0);
        await decontaminateAudioSession();
        await newSound.playAsync();
        setIsPlaying(true);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlaybackPosition(0);
            if (positionIntervalRef.current) {
              clearInterval(positionIntervalRef.current);
            }
          }
          if (status.error) {
            console.error('🔊 Audio playback error:', status.error);
            setIsPlaying(false);
            setIsLoading(false);
          }
        });
        startPositionTracking(newSound);
      }
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setIsLoading(false);
      setIsPlaying(false);
      Alert.alert(
        'Audio Playback Error',
        'Unable to play audio. Please:\n\n• Check device volume\n• Ensure Bluetooth/headphones are connected properly\n• Try disconnecting and reconnecting audio devices'
      );
    }
  };

  const startPositionTracking = (soundInstance = sound) => {
    positionIntervalRef.current = setInterval(async () => {
      if (soundInstance && !isUnloaded) {
        try {
          const status = await soundInstance.getStatusAsync();
          if (status.isLoaded && status.positionMillis !== undefined) {
            setPlaybackPosition(status.positionMillis);
          }
        } catch (error) {
          clearInterval(positionIntervalRef.current);
        }
      }
    }, 100);
  };

  const getDurationText = () => {
    const currentTime = formatTime(playbackPosition);
    const totalTime = formatTime((message.duration || 0) * 1000);
    return `${currentTime} / ${totalTime}`;
  };

  return (
    <View style={styles.userAudioContainer}>
      {/* Play Button */}
      <TouchableOpacity
        style={[styles.playButton, styles.userPlayButton]}
        onPress={togglePlayback}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={styles.playButtonGradient}
        >
          <MaterialIcons
            name={isLoading ? 'hourglass-empty' : isPlaying ? 'pause' : 'play-arrow'}
            size={20}
            color="#D96F32"
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* Audio Info */}
      <View style={styles.audioInfo}>
        <AudioPlaybackWave isPlaying={isPlaying} />
        <Text style={[styles.audioDuration, styles.userAudioDuration]}>
          {getDurationText()}
        </Text>
      </View>
    </View>
  );
};

// ✅ BOT Audio Message Component (simplified - just icon + play/pause)
const BotAudioMessage = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnloaded, setIsUnloaded] = useState(false);

  // Cleanup
  useEffect(() => {
    return () => {
      if (sound && !isUnloaded) {
        sound.unloadAsync()
          .then(() => setIsUnloaded(true))
          .catch(() => {});
      }
    };
  }, [sound, isUnloaded]);

  const decontaminateAudioSession = async () => {
    try {
      for (let i = 0; i < 3; i++) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          shouldDuckAndroid: false,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          playThroughEarpieceAndroid: false,
        });
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    } catch (error) {
      console.error('❌ Audio decontamination failed:', error);
    }
  };

  const togglePlayback = async () => {
    try {
      if (sound && !isUnloaded) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await decontaminateAudioSession();
          await sound.setVolumeAsync(1.0);
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        setIsLoading(true);
        await decontaminateAudioSession();
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: message.uri },
          {
            shouldPlay: false,
            volume: 1.0,
            rate: 1.0,
            shouldCorrectPitch: true,
          }
        );
        setSound(newSound);
        setIsUnloaded(false);
        setIsLoading(false);
        await newSound.setVolumeAsync(1.0);
        await decontaminateAudioSession();
        await newSound.playAsync();
        setIsPlaying(true);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
          if (status.error) {
            console.error('🔊 Audio playback error:', status.error);
            setIsPlaying(false);
            setIsLoading(false);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setIsLoading(false);
      setIsPlaying(false);
      Alert.alert('Audio Playback Error', 'Unable to play audio.');
    }
  };

  return (
    <View style={styles.botAudioContainer}>
      {/* Audio Icon */}
      <MaterialIcons name="volume-up" size={18} color="#D96F32" />
      
      {/* Play/Pause Button */}
      <TouchableOpacity
        style={styles.botPlayButton}
        onPress={togglePlayback}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#D96F32', '#C75D2C']}
          style={styles.botPlayButtonGradient}
        >
          <MaterialIcons
            name={isLoading ? 'hourglass-empty' : isPlaying ? 'pause' : 'play-arrow'}
            size={16}
            color="#ffffff"
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* Audio Label */}
      <Text style={styles.audioLabel}>Tax Audio Response</Text>
    </View>
  );
};

// ✅ MAIN MESSAGE BUBBLE COMPONENT
const MessageBubble = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!message) {
    return null;
  }

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const savedMessagesString = await AsyncStorage.getItem('@saved_messages');
        if (savedMessagesString) {
          const savedMessages = JSON.parse(savedMessagesString);
          const messageIsSaved = savedMessages.some(savedMsg => savedMsg.id === message.id);
          setIsSaved(messageIsSaved);
        }
      } catch (error) {
        console.error('Failed to check saved status', error);
      }
    };
    checkIfSaved();
  }, [message.id]);

  const isUser = message.sender === 'user';
  const isAudioMessage = message.type === 'audio';

  const onShare = async () => {
    try {
      const shareContent = isAudioMessage
        ? { url: message.uri, title: 'Shared Tax Audio from EasyTax' }
        : { message: message.text, title: 'Shared Tax Advice from EasyTax' };
      await Share.share(shareContent);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (error) {
      Alert.alert('Share Error', error.message);
    }
  };

  const onCopy = async () => {
    try {
      if (isAudioMessage) {
        await Clipboard.setStringAsync(`Tax audio message (${message.duration}s)`);
      } else {
        await Clipboard.setStringAsync(message.text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Copy Error', 'Failed to copy tax advice');
    }
  };

  const onSave = async () => {
    try {
      const savedMessagesString = await AsyncStorage.getItem('@saved_messages');
      let messages = savedMessagesString ? JSON.parse(savedMessagesString) : [];
      const existingIndex = messages.findIndex(savedMsg => savedMsg.id === message.id);
      
      if (existingIndex > -1) {
        messages.splice(existingIndex, 1);
        await AsyncStorage.setItem('@saved_messages', JSON.stringify(messages));
        setIsSaved(false);
        Alert.alert('Removed', 'Tax advice removed from your bookmarks');
      } else {
        messages.push(message);
        await AsyncStorage.setItem('@saved_messages', JSON.stringify(messages));
        setIsSaved(true);
        Alert.alert('Saved', 'Tax advice saved to your bookmarks');
      }
    } catch (error) {
      Alert.alert('Save Error', 'Failed to update bookmarks');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={isUser ? styles.userMessageContainer : styles.botMessageContainer}>
      <View style={isUser ? styles.userWrapper : styles.botWrapper}>
        
        {/* Message Bubble */}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          
          {/* User Message Gradient Overlay */}
          {isUser && (
            <LinearGradient
              colors={['#D96F32', '#C75D2C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          
          {/* Glass Overlay for User */}
          {isUser && <View style={styles.userGlassOverlay} />}
          
          {/* Bot Accent Border */}
          {!isUser && <View style={styles.botAccentBorder} />}

          {/* Message Content */}
          <View style={isUser ? styles.userTextContainer : styles.botTextContainer}>
            {isAudioMessage ? (
              isUser ? (
                <UserAudioMessage message={message} isUser={isUser} />
              ) : (
                <BotAudioMessage message={message} />
              )
            ) : (
              <Markdown
                style={isUser ? userMarkdownStyles : botMarkdownStyles}
              >
                {message.text}
              </Markdown>
            )}
          </View>
        </View>

        {/* Timestamp */}
        <Text style={isUser ? styles.timeTextUser : styles.timeTextBot}>
          {formatTime(message.timestamp)}
        </Text>

        {/* Transcription Info for Demo Mode */}
        {message.transcription?.fallback && (
          <Text style={styles.demoText}>• Demo mode</Text>
        )}

        {/* Action Buttons */}
        {!isUser && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={onCopy}>
              <LinearGradient
                colors={copied ? ['#10b981', '#059669'] : ['#F8B259', '#F3E9DC']}
                style={styles.buttonGradient}
              >
                <Feather
                  name={copied ? 'check' : 'copy'}
                  size={16}
                  color={copied ? '#ffffff' : '#D96F32'}
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <LinearGradient
                colors={shared ? ['#3b82f6', '#2563eb'] : ['#F8B259', '#F3E9DC']}
                style={styles.buttonGradient}
              >
                <Feather
                  name={shared ? 'check' : 'share'}
                  size={16}
                  color={shared ? '#ffffff' : '#D96F32'}
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onSave}>
              <LinearGradient
                colors={isSaved ? ['#f59e0b', '#d97706'] : ['#F8B259', '#F3E9DC']}
                style={styles.buttonGradient}
              >
                <Feather
                  name={isSaved ? 'bookmark' : 'bookmark'}
                  size={16}
                  color={isSaved ? '#ffffff' : '#D96F32'}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* User Actions */}
        {isUser && (
          <View style={styles.userActions}>
            <TouchableOpacity style={styles.userActionBtn} onPress={onCopy}>
              <Feather
                name={copied ? 'check' : 'copy'}
                size={14}
                color={copied ? '#10b981' : 'rgba(255,255,255,0.8)'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.userActionBtn} onPress={onShare}>
              <Feather
                name={shared ? 'check' : 'share'}
                size={14}
                color={shared ? '#3b82f6' : 'rgba(255,255,255,0.8)'}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

// ✅ MARKDOWN STYLES (updated for EasyTax colors)
const userMarkdownStyles = {
  body: {
    color: '#ffffff',
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  heading1: {
    color: '#ffffff',
    fontFamily: 'System',
    fontWeight: '800',
    fontSize: 26,
    marginBottom: 14,
    marginTop: 8,
  },
  heading2: {
    color: '#ffffff',
    fontFamily: 'System',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 12,
    marginTop: 6,
  },
  strong: {
    fontFamily: 'System',
    fontWeight: '700',
    color: '#FDF6E3',
  },
  paragraph: {
    marginVertical: 4,
  },
};

const botMarkdownStyles = {
  body: {
    color: '#1f2937',
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '400',
  },
  heading1: {
    color: '#D96F32',
    fontFamily: 'System',
    fontWeight: '800',
    fontSize: 26,
    marginBottom: 14,
    marginTop: 8,
  },
  heading2: {
    color: '#C75D2C',
    fontFamily: 'System',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 12,
    marginTop: 6,
  },
  strong: {
    fontFamily: 'System',
    fontWeight: '700',
    color: '#D96F32',
  },
  paragraph: {
    marginVertical: 4,
  },
};

// ✅ STYLES (updated for EasyTax colors)
const styles = StyleSheet.create({
  // Container Styles
  userMessageContainer: {
    alignItems: 'flex-end',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  botMessageContainer: {
    alignItems: 'flex-start',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userWrapper: {
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  botWrapper: {
    alignItems: 'flex-start',
    maxWidth: '90%',
  },

  // Bubble Styles
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: '30%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  userBubble: {
    borderBottomRightRadius: 6,
    shadowColor: '#D96F32',
  },
  botBubble: {
    borderBottomLeftRadius: 6,
    shadowColor: '#D96F32',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },

  // Content Container Styles
  userTextContainer: {
    position: 'relative',
    zIndex: 2,
  },
  botTextContainer: {
    position: 'relative',
    zIndex: 2,
  },
  userGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    zIndex: 1,
  },
  botAccentBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#D96F32',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 6,
  },

  // Audio Styles - User
  userAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 180,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  userPlayButton: {
    shadowColor: 'rgba(255,255,255,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  audioInfo: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  playbackWaveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 16,
    gap: 2,
  },
  playbackWaveBar: {
    width: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    minHeight: 2,
  },
  audioDuration: {
    fontSize: 12,
    color: '#8B5A2B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  userAudioDuration: {
    color: 'rgba(255,255,255,0.9)',
  },

  // Audio Styles - Bot (Simplified)
  botAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  botPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  botPlayButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  audioLabel: {
    fontSize: 14,
    color: '#8B5A2B',
    fontWeight: '500',
  },

  // Time and Action Styles
  timeTextUser: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  timeTextBot: {
    color: '#B8860B',
    fontSize: 11,
    textAlign: 'left',
    marginTop: 4,
  },
  demoText: {
    color: '#F8B259',
    fontSize: 11,
    textAlign: 'left',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Action Button Styles
  userActions: {
    flexDirection: 'row',
    marginTop: 6,
    marginRight: 4,
    gap: 8,
  },
  userActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 8,
    gap: 8,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
});

export default MessageBubble;
