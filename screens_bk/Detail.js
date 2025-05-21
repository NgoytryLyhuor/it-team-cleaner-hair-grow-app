import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  Image,
  Switch,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import http from '../services/http';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StorageContext } from '../contexts/StorageContext';
import { GlobalDataContext } from '../contexts/GlobalDataContext';
import moment from 'moment';
import BookingStepHeader from './Components/BookingStepHeader';
import CustomText from './Components/CustomText';

const { height } = Dimensions.get("window");

export default function BookingConfirmation({ navigation, route }) {
  const { branch, staff, services, serviceIds, date, time } = route.params;

  // State management
  const [modalVisible, setModalVisible] = useState(false);
  const [useCredit, setUseCredit] = useState(false);
  const [referral, setReferral] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [creditToCurrencyRating, setCreditToCurrencyRating] = useState({});

  // Context
  const { userDetail } = useContext(StorageContext);
  const { coupon, setCoupon, setSuccessfullyModalVisible } = useContext(GlobalDataContext);

  // Animation refs
  const animValues = {
    userInfo: {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(20)).current,
    },
    timeSlot: {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(20)).current,
    },
    location: {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(20)).current,
    },
    stylist: {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(20)).current,
    },
    services: {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(20)).current,
    },
    coupon: {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(20)).current,
    },
    referral: {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(20)).current,
    },
    credit: {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(20)).current,
    },
    button: {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(20)).current,
    }
  };

  // Run animations when component mounts
  useEffect(() => {
    const animations = Object.values(animValues).map(anim => (
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ));

    Animated.stagger(100, animations).start();
  }, []);

  const handleReferral = () => {
    setModalVisible(false);
  };

  const formatDateTime = (value) => {
    let date = new Date(value.replace(" ", "T"));
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  };

  const prepareServiceData = (value) => {
    var bookingServices = [];
    services.forEach(service => {
      const bookingService = {
        id: null,
        start_date_time: null,
        service_name: service.name,
        employee_id: staff.id,
        booking_id: null,
        service_id: service.id,
        branch_id: branch.id,
        service_price: service?.service_pricen || '',
        duration_min: service?.duration_min
      };
      bookingServices.push(bookingService);
    });

    let startTime = moment(value);

    bookingServices.forEach((bookingService, index) => {
      if (index > 0) {
        const lastService = bookingServices[index - 1];
        startTime = moment(lastService.start_date_time).add(lastService.duration_min, 'minutes');
      }
      bookingService.start_date_time = startTime.format('YYYY-MM-DD HH:mm:ss');
      bookingServices[index] = bookingService;
    });

    // console.log(bookingServices);

    return bookingServices;
  };

  const validateGuestInput = () => {
    const newErrors = {};

    if (!guestName.trim()) {
      newErrors.guestName = 'Name is required';
    }

    if (!guestPhone.trim()) {
      newErrors.guestPhone = 'Contact number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = async () => {
    const start_date_time = formatDateTime(`${date} ${time}:00`);

    const postData = {
      id: null,
      note: "",
      start_date_time,
      employee_id: staff.id,
      branch_id: branch.id,
      user_id: userDetail?.id || null,
      status: "pending",
      services_id: serviceIds.split(','),
      product_variation_id: [],
      is_paid: 0,
      use_credit: 0,
      coupon_id: coupon?.id || '',
      coupon_code: coupon?.code || '',
      referral_code: referral,
      guest_name: guestName,
      guest_phone: guestPhone,
      use_credit: useCredit,
      services: prepareServiceData(start_date_time),
    };

    if (!postData.user_id && !validateGuestInput()) {
      return;
    }

    setLoading(true);
    try {
      const endpoint = postData.user_id ? '/save-booking' : '/save-booking-guest';
      const response = await http.post(endpoint, postData);

      if (response.data?.status) {
        setCoupon('');
        setSuccessfullyModalVisible(true);
        navigation.navigate('HomeScreen', {});
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditRating = async () => {
    try {
      const response = await http.get('/credit-to-currency-rating');
      setCreditToCurrencyRating(response.data);
    } catch (error) {
      console.error('Credit rating error:', error);
    }
  };

  useEffect(() => {
    fetchCreditRating();
  }, []);

  return (
    <View style={styles.container}>
      <ReferralModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        referral={referral}
        setReferral={setReferral}
        handleReferral={handleReferral}
      />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <BookingStepHeader title="Confirm Booking" height={height * 0.11} />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Information */}
        <Animated.View style={[
          styles.sectionContainer,
          {
            // opacity: animValues.userInfo.opacity,
            transform: [{ translateY: animValues.userInfo.translateY }]
          }
        ]}>
          <CustomText style={styles.sectionTitle}>Your Information</CustomText>
          {userDetail ? (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <CustomText style={styles.infoLabel}>Name</CustomText>
                <CustomText style={styles.infoValue}>
                  {userDetail.first_name} {userDetail.last_name}
                </CustomText>
              </View>
              <View style={styles.infoRow}>
                <CustomText style={styles.infoLabel}>Contact Number</CustomText>
                <CustomText style={styles.infoValue}>{userDetail.mobile}</CustomText>
              </View>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <TextInput
                style={[styles.input, errors.guestName && styles.inputError]}
                value={guestName}
                onChangeText={(text) => {
                  setGuestName(text);
                  setErrors(prev => ({ ...prev, guestName: '' }));
                }}
                placeholder="Name"
                placeholderTextColor="#888"
              />
              {errors.guestName && (
                <CustomText style={styles.errorText}>{errors.guestName}</CustomText>
              )}

              <TextInput
                style={[styles.input, errors.guestPhone && styles.inputError]}
                value={guestPhone}
                onChangeText={(text) => {
                  setGuestPhone(text);
                  setErrors(prev => ({ ...prev, guestPhone: '' }));
                }}
                placeholder="Contact Number"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
              />
              {errors.guestPhone && (
                <CustomText style={styles.errorText}>{errors.guestPhone}</CustomText>
              )}
            </View>
          )}
        </Animated.View>

        {/* Time Slot */}
        <Animated.View style={[
          styles.sectionContainer,
          {
            // opacity: animValues.timeSlot.opacity,
            transform: [{ translateY: animValues.timeSlot.translateY }]
          }
        ]}>
          <CustomText style={styles.sectionTitle}>Time Slot</CustomText>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>Date & Time</CustomText>
              <CustomText style={styles.infoValue}>
                {date} at {time}
              </CustomText>
            </View>
          </View>
        </Animated.View>

        {/* Location Information */}
        <Animated.View style={[
          styles.sectionContainer,
          {
            // opacity: animValues.location.opacity,
            transform: [{ translateY: animValues.location.translateY }]
          }
        ]}>
          <CustomText style={styles.sectionTitle}>Location Information</CustomText>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>Branch Name</CustomText>
              <CustomText className="flex-1 text-right" style={styles.infoValue}>{branch.name}</CustomText>
            </View>
          </View>
        </Animated.View>

        {/* Stylist */}
        <Animated.View style={[
          styles.sectionContainer,
          {
            // opacity: animValues.stylist.opacity,
            transform: [{ translateY: animValues.stylist.translateY }]
          }
        ]}>
          <CustomText style={styles.sectionTitle}>Stylist</CustomText>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>Stylist</CustomText>
              <CustomText style={styles.infoValue}>{staff.full_name}</CustomText>
            </View>
          </View>
        </Animated.View>

        {/* Services */}
        <Animated.View style={[
          styles.sectionContainer,
          {
            // opacity: animValues.services.opacity,
            transform: [{ translateY: animValues.services.translateY }]
          }
        ]}>
          <CustomText style={styles.sectionTitle}>Services</CustomText>
          <View style={styles.infoContainer}>
            {services.map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <Image
                  source={{ uri: service.service_image }}
                  style={styles.serviceImage}
                />
                <View style={styles.serviceDetails}>
                  <CustomText style={styles.serviceName}>{service.name}</CustomText>
                  <CustomText style={styles.serviceDescription}>
                    {service.description}
                  </CustomText>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Coupon */}
        <Animated.View style={[
          styles.sectionContainer,
          {
            // opacity: animValues.coupon.opacity,
            transform: [{ translateY: animValues.coupon.translateY }]
          }
        ]}>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.labelContainer}>
                <CustomText style={styles.infoLabel}>Coupon</CustomText>
                <CustomText style={styles.optionalText}>(Optional)</CustomText>
              </View>
              {coupon?.id > 0 ? (
                <View style={styles.couponApplied}>
                  <CustomText style={styles.discountText}>-10.0%</CustomText>
                  <TouchableOpacity
                    onPress={() => setCoupon('')}
                    style={styles.removeButton}
                  >
                    <CustomText style={styles.removeButtonText}>×</CustomText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Coupon', { action: 'detail' })}
                  style={styles.addButton}
                >
                  <CustomText style={styles.addButtonText}>Add Coupon</CustomText>
                  <Icon name="arrow-forward-ios" size={16} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Referral */}
        <Animated.View style={[
          styles.sectionContainer,
          {
            // opacity: animValues.referral.opacity,
            transform: [{ translateY: animValues.referral.translateY }]
          }
        ]}>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.labelContainer}>
                <CustomText style={styles.infoLabel}>Referral</CustomText>
                <CustomText style={styles.optionalText}>(Optional)</CustomText>
              </View>
              {referral ? (
                <View style={styles.couponApplied}>
                  <CustomText style={styles.discountText}>-15.0%</CustomText>
                  <TouchableOpacity
                    onPress={() => setReferral('')}
                    style={styles.removeButton}
                  >
                    <CustomText style={styles.removeButtonText}>×</CustomText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={styles.addButton}
                >
                  <CustomText style={styles.addButtonText}>Add Code</CustomText>
                  <Icon name="arrow-forward-ios" size={16} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Credit */}
        <Animated.View style={[
          styles.sectionContainer,
          {
            opacity: animValues.credit.opacity,
            transform: [{ translateY: animValues.credit.translateY }]
          }
        ]}>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View>
                <CustomText style={styles.creditTitle}>
                  Using {(userDetail?.credit ?? 0).toFixed(2)} Points
                </CustomText>
                <CustomText style={styles.creditSubtitle}>
                  You will save $
                  {((creditToCurrencyRating?.credit_to_usd_rate ?? 0) * (userDetail?.credit ?? 0)).toFixed(2)}
                </CustomText>
              </View>
              <Switch
                onValueChange={() => setUseCredit(!useCredit)}
                value={useCredit}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={useCredit ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Book Now Button */}
      <Animated.View style={[
        styles.footer,
        {
          // opacity: animValues.button.opacity,
          transform: [{ translateY: animValues.button.translateY }]
        }
      ]}>
        <Pressable
          style={styles.bookButton}
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <CustomText style={styles.bookButtonText}>Book Now</CustomText>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const ReferralModal = ({ visible, onClose, referral, setReferral, handleReferral }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <CustomText style={styles.modalTitle}>Add Referral Code</CustomText>
                <TouchableOpacity onPress={onClose}>
                  <CustomText style={styles.modalClose}>×</CustomText>
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <TextInput
                  placeholder="Referral Code"
                  value={referral}
                  onChangeText={setReferral}
                  style={styles.modalInput}
                  placeholderTextColor="#000"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.modalButton}
                  onPress={handleReferral}
                >
                  <CustomText style={styles.modalButtonText}>Apply</CustomText>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '',
  },
  safeArea: {
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 100,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Nunito_500Medium',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Nunito_400Regular',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'Nunito_400Regular',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  serviceImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Nunito_400Regular',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionalText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Nunito_400Regular',
  },
  couponApplied: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountText: {
    color: '#FF3B30',
    fontFamily: 'Nunito_800ExtraBold',
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    textDecorationLine: 'underline',
    marginRight: 4,
  },
  creditTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#333',
  },
  creditSubtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bookButton: {
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffe6f0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    marginBottom: 40,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
  },
  modalFooter: {
    height: 100,
  },
  modalButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
