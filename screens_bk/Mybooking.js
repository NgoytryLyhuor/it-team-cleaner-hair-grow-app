import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  RefreshControl // Added for pull-to-refresh
} from 'react-native';
import BottomNavigation from './Components/BottomNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import http from '../services/http';
import { StorageContext } from '../contexts/StorageContext';
import CustomText from './Components/CustomText';
import CustomCancelAlert from './Components/CustomCancelAlert';

const { height } = Dimensions.get("window");

const Mybooking = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [bookingData, setBookingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userDetail } = useContext(StorageContext);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // Added for pull-to-refresh

  // Check login status and redirect if not logged in
  useEffect(() => {
    if (!userDetail) {
      navigation.replace('Login');
      return;
    }
  }, [userDetail, navigation]);

  // Fetch booking data from API
  const fetchBookingData = async () => {
    // Only fetch data if the user is logged in
    if (!userDetail) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate loading delay to show skeleton
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await http.get('/booking-list');

      // Transform API data to match component structure
      const transformedData = response.data.data.map((item) => {
        // Format date from YYYY-MM-DDTHH:mm:ss to DD/MM/YYYY
        const startDateTime = new Date(item.start_date_time);
        const formattedDate = `${startDateTime.getDate().toString().padStart(2, '0')}/${(startDateTime.getMonth() + 1).toString().padStart(2, '0')}/${startDateTime.getFullYear()}`;
        const formattedTime = `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`;

        // Get first service for display (name and image)
        const firstService = item.services && item.services.length > 0 ? item.services[0] : null;
        const serviceNames = item.services.map(service => service.service_name).join(' , ');

        // Default image if no service image available
        const serviceImage = firstService && firstService.service_image
          ? { uri: firstService.service_image }
          : require('../assets/icons/default_service.png');

        const employeeImage = item.employee_image && item.employee_image !== '-'
          ? { uri: item.employee_image }
          : require('../assets/icons/default_service.png');

        return {
          id: item.id.toString(),
          bookingNumber: `#${item.id}`,
          salonName: item.branch_name,
          serviceType: serviceNames,
          stylistName: item.employee_name || 'Not Assigned',
          date: formattedDate,
          time: formattedTime,
          status: item.status,
          image: serviceImage,
          employee_image: employeeImage,
          branchAddress: item.address_line_1,
          branchPhone: item.phone,
          totalAmount: item.total_amount,
          services: item.services,
        };
      });

      setBookingData(transformedData);
      setError(null);
    } catch (error) {
      console.error('Error fetching booking data:', error);
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
      setRefreshing(false); // Reset refreshing state
    }
  };

  useEffect(() => {
    fetchBookingData();
  }, [userDetail]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchBookingData();
  };

  // Get status color based on booking status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#888';
    }
  };

  // Handle reload button press
  const handleReload = () => {
    fetchBookingData();
  };

  // Show cancel confirmation alert
  const showCancelConfirmation = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowCancelAlert(true);
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingBookingId(bookingId);
      setShowCancelAlert(false);

      // API call to cancel booking
      await http.post(`/booking-cancel/${bookingId}`);

      // Update booking status locally
      setBookingData(prevData =>
        prevData.map(item =>
          item.id === bookingId
            ? { ...item, status: 'Cancelled' }
            : item
        )
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Render skeleton loader
  const renderSkeletonItem = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonNumber} />
      <View style={styles.bookingDetails}>
        <View style={styles.skeletonImage} />
        <View style={styles.serviceInfo}>
          <View style={styles.skeletonSalonName} />
          <View style={styles.skeletonServiceType} />
          <View style={styles.stylistContainer}>
            <View style={styles.skeletonStaffImage} />
            <View style={styles.skeletonStylistName} />
          </View>
        </View>
        <View style={styles.skeletonStatus} />
      </View>
      <View style={styles.divider} />
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateContainer}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonDate} />
        </View>
        <View style={styles.timeContainer}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonTime} />
        </View>
      </View>
    </View>
  );

  // Render skeleton loader list
  const renderSkeletonList = () => (
    <View style={{ padding: 15 }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={{ marginBottom: 15 }}>
          {renderSkeletonItem()}
        </View>
      ))}
    </View>
  );

  // Render each booking item
  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation.navigate('MyBookingDetails', item.id)}
    >
      <CustomText style={styles.bookingNumber}>{item.bookingNumber}</CustomText>
      <View style={styles.bookingDetails}>
        <Image source={item.image} style={styles.serviceImage} resizeMode="cover" />
        <View style={styles.serviceInfo}>
          <CustomText style={styles.salonName}>{item.salonName}</CustomText>
          <CustomText style={styles.serviceType}>{item.serviceType}</CustomText>
          <View style={styles.stylistContainer}>
            <Image source={item.employee_image} style={styles.staffImage} resizeMode="cover" />
            <CustomText style={styles.stylistName}>{item.stylistName}</CustomText>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <CustomText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
          </CustomText>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={20} color="#333" />
          <CustomText style={styles.dateText}>{item.date}</CustomText>
        </View>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={20} color="#333" />
          <CustomText style={styles.timeText}>{item.time}</CustomText>
        </View>
      </View>
      {item.status?.toLowerCase() === 'pending' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => showCancelConfirmation(item.id)}
          disabled={cancellingBookingId === item.id}
        >
          {cancellingBookingId === item.id ? (
            <ActivityIndicator size="small" color="#6B31B7" />
          ) : (
            <CustomText style={styles.cancelButtonText}>Cancel Appointment</CustomText>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 10 }]}>
        <CustomText style={styles.headerTitle}>My Booking</CustomText>
      </View>
      <View style={styles.content}>
        {isLoading ? (
          renderSkeletonList()
        ) : error ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <View style={styles.documentIcon}>
                <View style={styles.documentContent}>
                  <View style={styles.documentLine1} />
                  <View style={styles.documentLineGroup}>
                    <View style={styles.documentLine2} />
                    <View style={styles.documentLine2} />
                  </View>
                  <View style={styles.documentLineGroup}>
                    <View style={styles.documentLine3} />
                    <View style={styles.documentLine3} />
                  </View>
                </View>
              </View>
              <View style={styles.magnifierContainer}>
                <View style={styles.magnifierCircle}>
                  <View style={styles.magnifierHandle} />
                </View>
              </View>
            </View>
            <CustomText style={styles.emptyTitle}>No Bookings Found</CustomText>
            <CustomText style={styles.emptyText}>{error}</CustomText>
            <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
              <CustomText style={styles.reloadButtonText}>Reload</CustomText>
            </TouchableOpacity>
          </View>
        ) : bookingData.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <View style={styles.documentIcon}>
                <View style={styles.documentContent}>
                  <View style={styles.documentLine1} />
                  <View style={styles.documentLineGroup}>
                    <View style={styles.documentLine2} />
                    <View style={styles.documentLine2} />
                  </View>
                  <View style={styles.documentLineGroup}>
                    <View style={styles.documentLine3} />
                    <View style={styles.documentLine3} />
                  </View>
                </View>
              </View>
              <View style={styles.magnifierContainer}>
                <View style={styles.magnifierCircle}>
                  <View style={styles.magnifierHandle} />
                </View>
              </View>
            </View>
            <CustomText style={styles.emptyTitle}>No Bookings Found</CustomText>
            <CustomText style={styles.emptyText}>There are no bookings listed at the moment. Keep track of your bookings here.</CustomText>
            <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
              <CustomText style={styles.reloadButtonText}>Reload</CustomText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={bookingData}
            renderItem={renderBookingItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 15, paddingBottom: 60 * 2 }}
            ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6B31B7']} // Refresh indicator color
                tintColor="#6B31B7" // iOS refresh indicator color
              />
            }
          />
        )}
      </View>
      <CustomCancelAlert
        visible={showCancelAlert}
        onClose={() => setShowCancelAlert(false)}
        onConfirm={handleCancelBooking}
        bookingId={selectedBookingId}
      />
      <BottomNavigation page='My Booking' />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 20,
    height: height * 0.11,
    backgroundColor: '#000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 27,
  },
  content: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  skeletonNumber: {
    width: 50,
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 7,
    marginBottom: 10,
  },
  skeletonImage: {
    width: 70,
    height: 70,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    marginRight: 15,
  },
  skeletonSalonName: {
    width: 120,
    height: 16,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 4,
  },
  skeletonServiceType: {
    width: 150,
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 7,
    marginBottom: 8,
  },
  skeletonStaffImage: {
    width: 15,
    height: 15,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
  },
  skeletonStylistName: {
    width: 80,
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 7,
    marginLeft: 4,
  },
  skeletonStatus: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 60,
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 7,
  },
  skeletonIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
  },
  skeletonDate: {
    width: 80,
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 7,
    marginLeft: 8,
  },
  skeletonTime: {
    width: 60,
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 7,
    marginLeft: 8,
  },
  bookingNumber: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Nunito_800ExtraBold',
  },
  bookingDetails: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  serviceImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  staffImage: {
    width: 15,
    height: 15,
    borderRadius: 8,
  },
  serviceInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  salonName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Nunito_800ExtraBold',
  },
  serviceType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Nunito_400Regular',
  },
  stylistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stylistName: {
    fontSize: 14,
    color: '#888',
    marginLeft: 4,
    fontFamily: 'Nunito_400Regular',
  },
  statusContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 15,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontFamily: 'Nunito_400Regular',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontFamily: 'Nunito_400Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    marginBottom: 30,
    position: 'relative',
  },
  documentIcon: {
    position: 'absolute',
    top: 15,
    left: 35,
    width: 50,
    height: 60,
    backgroundColor: '#E8EBF2',
    borderRadius: 4,
    padding: 8,
  },
  documentContent: {
    flex: 1,
  },
  documentLine1: {
    width: '100%',
    height: 8,
    backgroundColor: '#C5CAD6',
    borderRadius: 2,
    marginBottom: 8,
  },
  documentLineGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  documentLine2: {
    width: '45%',
    height: 6,
    backgroundColor: '#C5CAD6',
    borderRadius: 2,
  },
  documentLine3: {
    width: '30%',
    height: 6,
    backgroundColor: '#C5CAD6',
    borderRadius: 2,
  },
  magnifierContainer: {
    position: 'absolute',
    bottom: 10,
    right: 25,
  },
  magnifierCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#C5CAD6',
    borderWidth: 8,
    borderColor: '#E8EBF2',
  },
  magnifierHandle: {
    position: 'absolute',
    bottom: -12,
    right: -12,
    width: 20,
    height: 5,
    backgroundColor: '#C5CAD6',
    transform: [{ rotate: '45deg' }],
  },
  emptyTitle: {
    fontSize: 18,
    color: '#2C394B',
    marginBottom: 12,
    fontFamily: 'Nunito_700Bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#7B8591',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    fontFamily: 'Nunito_400Regular',
  },
  reloadButton: {
    backgroundColor: '#000',
    paddingHorizontal: 45,
    paddingVertical: 12,
    borderRadius: 25,
  },
  reloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  cancelButton: {
    backgroundColor: '#F0E6FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#6B31B7',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  }
});

export default Mybooking;