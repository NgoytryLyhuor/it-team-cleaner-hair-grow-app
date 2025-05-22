import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StorageContext } from '../contexts/StorageContext';
import http from '../services/http';

const { height } = Dimensions.get('window');

const Notifications = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userDetail } = useContext(StorageContext);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userDetail) {
      navigation.replace('Login');
      return;
    }

    fetchNotifications();
  }, [userDetail, navigation]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await http.get('/notification-list');

      if (response.data && response.data.notification_data) {
        const transformedData = response.data.notification_data.map(item => {
          const notificationData = item.data.data;

          const createdAt = new Date(item.created_at);
          const formattedDate = `${createdAt.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }).replace(/\//g, '-')} ${createdAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}`;

          return {
            id: item.id,
            number: notificationData.id ? `#${notificationData.id}` : '',
            date: formattedDate,
            message: item.data.subject || 'Notification',
            data: notificationData,
            read_at: item.read_at
          };
        });

        setNotifications(transformedData);
      } else {
        setError('Invalid response format');
      }

    } catch (error) {
      console.error('Failed to load notifications', error);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationPress = (item) => {
    if (item.data && item.data.id) {
      navigation.navigate('MyBookingDetails', item.data.id);
    } else {
      console.log('Notification pressed:', item);
    }
  };

  // Skeleton Loader for loading state
  const renderSkeletonLoader = () => {
    const skeletonItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 3 skeleton items
    return skeletonItems.map((_, index) => (
      <View key={index} style={[styles.notificationItem, { backgroundColor: '#fff' }]} className="mb-4">
        <View style={styles.avatarContainer}>
          <View className="w-[40px] h-[40px] bg-gray-300 rounded-full animate-pulse" />
        </View>
        <View style={styles.notificationContent}>
          <View className="h-3 bg-gray-300 rounded w-1/4 mb-2 animate-pulse" />
          <View className="h-3 bg-gray-300 rounded w-2/3 mb-2 animate-pulse" />
          <View className="h-3 bg-gray-300 rounded w-1/2 animate-pulse" />
        </View>
      </View>
    ));
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read_at && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={require('../assets/icons/ic_notification_user.png')}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationNumber}>{item.number}</Text>
        <Text style={styles.notificationDate}>{item.date}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No notifications available</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Notifications List */}
      <View style={styles.content}>
        {isLoading ? (
          <FlatList
            data={[1]} // Dummy data to render skeleton
            renderItem={() => renderSkeletonLoader()}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchNotifications}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyList}
            refreshing={isLoading}
            onRefresh={fetchNotifications}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 20,
    height: height * 0.15,
    backgroundColor: '#000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginTop: 27,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Nunito_800ExtraBold',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContentContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    minHeight: '100%',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    backgroundColor: '#F8F8FF',
    // borderLeftWidth: 4,
    // borderLeftColor: '#000',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#EEEEEE',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationNumber: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 3,
    fontFamily: 'Nunito_800ExtraBold',
  },
  notificationDate: {
    fontSize: 12,
    color: '#888888',
    position: 'absolute',
    right: 10,
    top: 0,
    fontFamily: 'Nunito_400Regular',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Nunito_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Nunito_400Regular',
  },
});

export default Notifications;