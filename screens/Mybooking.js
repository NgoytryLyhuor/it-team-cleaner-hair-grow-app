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
  RefreshControl,
  SafeAreaView
} from 'react-native';
import BottomNavigation from './Components/BottomNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import http from '../services/http';
import { StorageContext } from '../contexts/StorageContext';
import CustomText from './Components/CustomText';
import CustomCancelAlert from './Components/CustomCancelAlert';

const { height, width } = Dimensions.get("window");

const Mybooking = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [bookingData, setBookingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userDetail } = useContext(StorageContext);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate dynamic header height based on device
  const headerHeight = Math.max(height * 0.10, 80); // Ensure minimum height

  // Check login status and redirect if not logged in
  useEffect(() => {
    if (!userDetail) {
      navigation.replace('Login');
      return;
    }
  }, [userDetail, navigation]);

  // Fetch booking data from API
  const fetchBookingData = async () => {
    if (!userDetail) {
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await http.get('/booking-list');

      const transformedData = response.data.data.map((item) => {
        const startDateTime = new Date(item.start_date_time);
        const formattedDate = `${startDateTime.getDate().toString().padStart(2, '0')}/${(startDateTime.getMonth() + 1).toString().padStart(2, '0')}/${startDateTime.getFullYear()}`;
        const formattedTime = `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`;

        const firstService = item.services && item.services.length > 0 ? item.services[0] : null;
        const serviceNames = item.services.map(service => service.service_name).join(' , ');

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
      setRefreshing(false);
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

      await http.post(`/booking-cancel/${bookingId}`);

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
      <View style={styles.bookingNumberContainer}>
        <View style={styles.skeletonNumber} />
        <View style={styles.statusContainer}>
          <View style={styles.skeletonStatusImage} />
          <View style={styles.skeletonStatus} />
        </View>
      </View>
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

  // Render empty state
  const renderEmptyState = (message) => (
    <View style={styles.emptyStateContainer}>
      <CustomText style={styles.emptyTitle}>No Bookings Found</CustomText>
      <CustomText style={styles.emptyText}>{message || 'There are no bookings listed at the moment. Keep track of your bookings here.'}</CustomText>
      <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
        <CustomText style={styles.reloadButtonText}>Reload</CustomText>
      </TouchableOpacity>
    </View>
  );

  // Render each booking item
  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation.navigate('MyBookingDetails', item.id)}
    >
      <View style={styles.bookingNumberContainer}>
        <CustomText style={styles.bookingNumber}>{item.bookingNumber}</CustomText>
        <View style={styles.statusContainer}>
          <Image
            source={require('../assets/icons/ic_unselected_booking.png')}
            style={[styles.statusImage, { tintColor: getStatusColor(item.status) }]}
            resizeMode="contain"
          />
          <CustomText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
          </CustomText>
        </View>
      </View>
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

  // Render main content
  const renderContent = () => {
    if (isLoading) {
      return renderSkeletonList();
    }
    
    if (error) {
      return renderEmptyState(error);
    }
    
    if (bookingData.length === 0) {
      return renderEmptyState();
    }
    
    return (
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
            colors={['#6B31B7']}
            tintColor="#6B31B7"
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Dynamic Header */}
        <View 
          style={[
            styles.header, 
            { 
              height: height * 0.15,
              paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 10) : 10
            }
          ]}
        >
          
            <CustomText style={styles.headerTitle}>My Booking</CustomText>
          
        </View>
        
        <View style={styles.content}>
          {renderContent()}
        </View>
        
        <CustomCancelAlert
          visible={showCancelAlert}
          onClose={() => setShowCancelAlert(false)}
          onConfirm={handleCancelBooking}
          bookingId={selectedBookingId}
        />
        
        <BottomNavigation page='My Booking' />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    alignItems:'center',
    justifyContent:'center',
    paddingBottom: 15,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Nunito_800ExtraBold',
  },
  content: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 200
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
  bookingNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingNumber: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Nunito_800ExtraBold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusImage: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
  },
  skeletonNumber: {
    width: 50,
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 7,
  },
  skeletonStatus: {
    width: 60,
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 7,
  },
  skeletonStatusImage: {
    width: 14,
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 7,
    marginRight: 4,
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
    paddingHorizontal: 20,
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