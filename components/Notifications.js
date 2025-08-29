// components/Notifications.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

// Snackbar Component
const Snackbar = ({ visible, message, type = 'success', onHide }) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideSnackbar();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideSnackbar = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const backgroundColor = type === 'success' ? '#D96F32' : type === 'error' ? '#C75D2C' : '#F8B259';
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info';

  return (
    <Animated.View
      style={[
        styles.snackbar,
        { 
          backgroundColor,
          transform: [{ translateY }],
          opacity 
        }
      ]}
    >
      <Feather name={icon} size={20} color="#FFFFFF" />
      <Text style={styles.snackbarText}>{message}</Text>
      <TouchableOpacity onPress={hideSnackbar}>
        <Feather name="x" size={18} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Notification Detail Modal
const NotificationModal = ({ visible, notification, onClose }) => {
  if (!notification) return null;

  const config = notificationTypeConfig[notification.type] || notificationTypeConfig.info;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={['#D96F32', '#C75D2C']}
          style={styles.modalHeader}
        >
          <View style={styles.modalHeaderContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notification Details</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.modalContent}>
          <View style={styles.notificationDetail}>
            <View style={[styles.detailIconCircle, { backgroundColor: config.color }]}>
              <Feather name={config.icon} size={32} color="#ffffff" />
            </View>
            
            <View style={styles.detailBadges}>
              {notification.pinned && (
                <View style={styles.detailBadge}>
                  <Feather name="bookmark" size={14} color="#D96F32" />
                  <Text style={styles.badgeText}>Pinned</Text>
                </View>
              )}
              {!notification.read && (
                <View style={[styles.detailBadge, { backgroundColor: '#FDF6E3' }]}>
                  <Feather name="circle" size={8} color="#F8B259" />
                  <Text style={[styles.badgeText, { color: '#92400E' }]}>Unread</Text>
                </View>
              )}
            </View>

            <Text style={styles.detailTitle}>{notification.title}</Text>
            <Text style={styles.detailTime}>{notification.time}</Text>
            <Text style={styles.detailBody}>{notification.body}</Text>

            <View style={styles.detailActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="share-2" size={18} color="#D96F32" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="bookmark" size={18} color="#D96F32" />
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                <Feather name="external-link" size={18} color="#ffffff" />
                <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Your Tax Return is Ready for Review! 📊',
    body: 'Your ITR has been prepared successfully. Please review all details before final submission. Check deductions, income sources, and tax calculations for accuracy.',
    time: '2 mins ago',
    type: 'report',
    pinned: false,
    read: false,
  },
  {
    id: '2',
    title: 'New Feature: Live Tax Consultant Chat 💬',
    body: 'Connect instantly with our certified tax experts for personalized guidance. Get real-time answers to your tax planning questions.',
    time: '1 hour ago',
    type: 'feature',
    pinned: false,
    read: false,
  },
  {
    id: '3',
    title: 'Tax Savings Achievement! 🏆',
    body: 'Congratulations! You\'ve maximized your tax deductions this year, saving ₹45,000. Excellent tax planning!',
    time: '3 hours ago',
    type: 'achievement',
    pinned: true,
    read: true,
  },
  {
    id: '4',
    title: 'ITR Filing Deadline Reminder 🗓️',
    body: 'Important: ITR filing deadline is July 31st. Don\'t miss out! File your returns early to avoid penalties and last-minute rush.',
    time: 'Yesterday',
    type: 'deadline',
    pinned: false,
    read: true,
  },
  {
    id: '5',
    title: 'GST Return Filing Complete ✅',
    body: 'Your GST return for this month has been successfully filed and acknowledged by the GST portal. All compliance requirements met.',
    time: '2 days ago',
    type: 'success',
    pinned: false,
    read: true,
  },
  {
    id: '6',
    title: 'Tax Document Upload Required 📄',
    body: 'Please upload your Form 16, salary slips, and investment proofs to complete your ITR preparation. Missing documents may delay processing.',
    time: '3 days ago',
    type: 'action',
    pinned: false,
    read: true,
  },
];

const notificationTypeConfig = {
  report: { icon: 'file-text', color: '#D96F32' },
  feature: { icon: 'star', color: '#F8B259' },
  achievement: { icon: 'award', color: '#C75D2C' },
  deadline: { icon: 'clock', color: '#DC2626' },
  success: { icon: 'check-circle', color: '#059669' },
  action: { icon: 'upload', color: '#7C3AED' },
  info: { icon: 'info', color: '#6366F1' },
};

const SwipeableNotification = ({ item, onPin, onDelete, onPress }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowHeight = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      const shouldPin = translationX < -80;
      const shouldDelete = translationX > 80;

      if (shouldPin && !item.pinned) {
        // Pin animation
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -width,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start(() => onPin(item.id));
      } else if (shouldDelete) {
        // Delete animation
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: width,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(rowHeight, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start(() => onDelete(item.id));
      } else {
        // Bounce back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const config = notificationTypeConfig[item.type] || notificationTypeConfig.info;

  return (
    <Animated.View
      style={[
        styles.notificationWrapper,
        {
          transform: [{ scaleY: rowHeight }],
          opacity: opacity,
        },
      ]}
    >
      {/* Background Actions */}
      <View style={styles.actionsContainer}>
        <View style={[styles.actionLeft, { backgroundColor: '#C75D2C' }]}>
          <Feather name="trash-2" size={24} color="#ffffff" />
          <Text style={styles.actionText}>Delete</Text>
        </View>
        <View style={[styles.actionRight, { backgroundColor: '#F8B259' }]}>
          <Feather name="bookmark" size={24} color="#ffffff" />
          <Text style={styles.actionText}>Pin Top</Text>
        </View>
      </View>

      {/* Notification Card */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.notificationCard,
            item.pinned && styles.pinnedCard,
            !item.read && styles.unreadCard,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={0.8} onPress={() => onPress(item)}>
            <LinearGradient
              colors={item.pinned ? ['#FDF6E3', '#ffffff'] : ['#ffffff', '#F3E9DC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
                <Feather name={config.icon} size={22} color="#ffffff" />
              </View>
              
              <View style={styles.notificationContent}>
                <View style={styles.headerRow}>
                  <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.pinned && (
                    <View style={styles.pinnedBadge}>
                      <Feather name="bookmark" size={12} color="#D96F32" />
                    </View>
                  )}
                </View>
                
                <Text style={styles.notificationBody} numberOfLines={2}>
                  {item.body}
                </Text>
                
                <View style={styles.footerRow}>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const Notifications = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  const handlePin = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === id ? { ...n, pinned: true } : n
      );
      return updated.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
    });
    showSnackbar('📌 Notification pinned to top', 'success');
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showSnackbar('🗑️ Notification deleted', 'error');
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    showSnackbar('✅ All notifications marked as read', 'success');
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
            showSnackbar('🗑️ All notifications cleared', 'error');
          }
        },
      ]
    );
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'pinned') return n.pinned;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const FilterButton = ({ id, label, count }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === id && styles.activeFilterButton]}
      onPress={() => setFilter(id)}
    >
      <Text style={[styles.filterText, filter === id && styles.activeFilterText]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#D96F32', '#C75D2C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity style={styles.moreButton} onPress={clearAll}>
            <Feather name="more-horizontal" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{notifications.filter(n => n.pinned).length}</Text>
            <Text style={styles.statLabel}>Pinned</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
          <FilterButton id="all" label="All" count={0} />
          <FilterButton id="unread" label="Unread" count={unreadCount} />
          <FilterButton id="pinned" label="Pinned" count={notifications.filter(n => n.pinned).length} />
        </ScrollView>
        
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markReadButton} onPress={markAllAsRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.swipeHint}>
          <Feather name="info" size={16} color="#6B7280" />
          <Text style={styles.swipeHintText}>
            Swipe left to pin, swipe right to delete, tap to view details
          </Text>
        </View>

        {filteredNotifications.map((item) => (
          <SwipeableNotification
            key={item.id}
            item={item}
            onPin={handlePin}
            onDelete={handleDelete}
            onPress={handleNotificationPress}
          />
        ))}

        {filteredNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread' ? 'All caught up!' : 
               filter === 'pinned' ? 'No pinned notifications' : 
               'You\'re all set for now'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={hideSnackbar}
      />

      {/* Notification Detail Modal */}
      <NotificationModal
        visible={modalVisible}
        notification={selectedNotification}
        onClose={() => {
          setModalVisible(false);
          setSelectedNotification(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 30,
    elevation: 8,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    minWidth: 70,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterScrollView: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3E9DC',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#D96F32',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  filterBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D96F32',
  },
  markReadButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3E9DC',
    borderRadius: 12,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  swipeHintText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  notificationWrapper: {
    marginBottom: 16,
  },
  actionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  actionLeft: {
    width: 80,
    height: '90%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionRight: {
    width: 80,
    height: '90%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  notificationCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 2,
  },
  pinnedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#D96F32',
  },
  unreadCard: {
    borderWidth: 1,
    borderColor: '#D96F32',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 22,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#D96F32',
  },
  pinnedBadge: {
    backgroundColor: '#FDF6E3',
    padding: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D96F32',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Snackbar Styles
  snackbar: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  snackbarText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  modalHeader: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  notificationDetail: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  detailIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF6E3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D96F32',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  detailTime: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  detailBody: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3E9DC',
    gap: 6,
  },
  primaryAction: {
    backgroundColor: '#D96F32',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});

export default Notifications;
