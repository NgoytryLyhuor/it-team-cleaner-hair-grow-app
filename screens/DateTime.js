import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Toast } from 'toastify-react-native';
import BookingStepHeader from './Components/BookingStepHeader';
import StepHeader from './Components/StepHeader';
import { StorageContext } from '../contexts/StorageContext';
import { GlobalDataContext } from '../contexts/GlobalDataContext';

const { width, height } = Dimensions.get('window');

// Helper function to get the days of the current month
const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];

  const firstDay = date.getDay();
  if (firstDay > 0) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month,
      year,
      isCurrentMonth: true,
    });
  }

  const lastDay = new Date(year, month, daysInMonth).getDay();
  if (lastDay < 6) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let i = 1; i <= 6 - lastDay; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }
  }

  return days;
};

// Helper function to format date to YYYY-MM-DD
const formatDate = (dateObj) => {
  const year = dateObj.year;
  const month = String(dateObj.month + 1).padStart(2, '0');
  const day = String(dateObj.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to convert 24-hour time to 12-hour format
const convertTo12Hour = (time24) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper function to convert 12-hour time to 24-hour format
const convertTo24Hour = (time12) => {
  const [time, period] = time12.split(' '); // Split time and AM/PM
  let [hour, minute] = time.split(':'); // Split hour and minute
  hour = parseInt(hour, 10);

  if (period === 'PM' && hour !== 12) {
    hour += 12; // Convert PM hours to 24-hour format
  } else if (period === 'AM' && hour === 12) {
    hour = 0; // Convert 12 AM to 00 in 24-hour format
  }

  const formattedHour = hour.toString().padStart(2, '0');
  return `${formattedHour}:${minute}`;
};

// Time slots definition
const timeSlot = [
  {
    title: 'Morning',
    slot: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
  },
  {
    title: 'Afternoon',
    slot: ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM']
  },
  {
    title: 'Evening',
    slot: ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM']
  }
];

const DateTime = ({ navigation, route }) => {
  const { branch, staff, services } = route.params;

  // Calendar state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);

  // API and loading state
  const [checkTimeSlot, setCheckTimeSlot] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Marquee animation state
  const translateX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const animationRef = useRef(null);

  // Context
  const { userDetail } = useContext(StorageContext);
  const { setCoupon } = useContext(GlobalDataContext);

  // Calculate days in the month
  useEffect(() => {
    setDays(getDaysInMonth(currentYear, currentMonth));
  }, [currentMonth, currentYear]);

  // Set today as the selected date initially
  useEffect(() => {
    const currentDate = new Date();
    if (currentDate.getMonth() === currentMonth && currentDate.getFullYear() === currentYear) {
      const initialDate = {
        day: currentDate.getDate(),
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      };
      setSelectedDate(initialDate);
    }
  }, []);

  // Fetch availability when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      checkAvailability();
    }
  }, [selectedDate]);

  // back from other screen set coupon to ''
  useFocusEffect(
    useCallback(() => {
      setCoupon('');
    }, [])
  );

  // first load set coupon to ''
  useEffect(() => {
    setCoupon('');
  }, []);

  // Handle marquee animation for service names
  useEffect(() => {
    if (textWidth > containerWidth) {
      translateX.setValue(0);
      if (animationRef.current) {
        animationRef.current.stop();
      }

      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -textWidth + containerWidth,
            duration: (textWidth / 50) * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      animationRef.current.start();
    } else {
      translateX.setValue(0);
      if (animationRef.current) {
        animationRef.current.stop();
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [textWidth, containerWidth, services]);

  // Navigation to previous month
  const handlePrevMonth = () => {
    const today = new Date();
    const currentMonthToday = today.getMonth(); // Current month (0-11)
    const currentYearToday = today.getFullYear();

    // Prevent going to previous months if already in the current month
    if (currentMonth > currentMonthToday || currentYear > currentYearToday) {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  // Navigation to next month
  const handleNextMonth = () => {
    const maxMonth = 6; // July (0-based index: 6)
    const currentYearToday = new Date().getFullYear();

    // Allow navigation only up to July of the current year
    if (currentMonth < maxMonth && currentYear <= currentYearToday) {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    const today = new Date();
    const selectedDayDate = new Date(day.year, day.month, day.day);
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (day.isCurrentMonth && selectedDayDate >= todayDateOnly) {
      setSelectedDate(day);
      setSelectedTime(null);
    }
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  // Check availability API
  const checkAvailability = () => {
    if (!selectedDate) return;

    setError(null);
    setLoading(true);

    const formattedDate = formatDate(selectedDate);
    // Convert IDs to "23,24,46"
    const serviceIds = services.map(service => service.id).join(',');
    const url = `https://demo-hairmake-grow.camboinfo.com/web-booking/?page=api&method=view&branch_id=${branch.id}&service_id=${serviceIds}&staff_id=${staff.id}&date=${formattedDate}`;

    axios.get(url)
      .then(response => {
        setLoading(false);
        setCheckTimeSlot(response.data);
      })
      .catch(err => {
        console.error('Error fetching availability:', err);
        setError('Unable to load available time slots. Please try again.');
        setCheckTimeSlot({});
        setLoading(false);
      });
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      if (userDetail?.id > 0) {
        nextScreenConfirm();
      } else {
        setModalVisible(true);
      }
    } else {
      Toast.warn('Please select time slot first!');
    }
  };

  const nextScreenConfirm = () => {
    setModalVisible(false);
    const serviceIds = services.map(service => service.id).join(',');

    const postData = {
      branch: branch,
      staff: staff,
      services: services,
      date: formatDate(selectedDate),
      time: selectedTime.split(' ')[0],
      serviceIds: serviceIds
    };
    navigation.navigate('Detail', postData);
  };

  const signIn = () => {
    setModalVisible(false);
    navigation.navigate('Login', { action: 'dateTime' });
  };

  // Determine if a date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day.day === today.getDate() &&
      day.month === today.getMonth() &&
      day.year === today.getFullYear()
    );
  };

  // Determine if a day is in the past
  const isPastDay = (day) => {
    const today = new Date();
    const dayDate = new Date(day.year, day.month, day.day);
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dayDate < todayDateOnly;
  };

  // Format month name
  const getMonthName = (month) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return monthNames[month];
  };

  // Render weekday headers
  const renderWeekdays = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <View style={styles.weekdaysContainer}>
        {weekdays.map((day, index) => (
          <Text key={index} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>
    );
  };

  // Render calendar days
  const renderDays = () => {
    return (
      <View style={styles.daysContainer}>
        {days.map((day, index) => {
          const isSelected =
            selectedDate &&
            selectedDate.day === day.day &&
            selectedDate.month === day.month &&
            selectedDate.year === day.year;
          const isDayInPast = isPastDay(day);
          const isTodayDate = isToday(day);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                !day.isCurrentMonth && styles.otherMonthDay,
                isSelected && styles.selectedDay,
                isTodayDate && styles.todayDay,
                isSelected && isTodayDate && styles.selectedTodayDay,
                isDayInPast && styles.pastDay,
              ]}
              onPress={() => handleDateSelect(day)}
              disabled={!day.isCurrentMonth || isDayInPast}
            >
              <Text
                style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.otherMonthDayText,
                  isSelected && styles.selectedDayText,
                  isSelected && styles.selectedDayNumber,
                  isDayInPast && styles.pastDayText,
                ]}
              >
                {day.day}
              </Text>
              {day.isCurrentMonth && (
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[
                    styles.shopAvailabilityText,
                    isSelected && styles.selectedDayText,
                    isDayInPast && styles.pastDayBranchText,
                  ]}
                >
                  {branch?.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Render time slots
  const renderTimeSlots = () => {
    if (loading) {
      return <ActivityIndicator size={30} style={{ padding: 20 }} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    return (
      <View style={styles.timeSlotsContainer}>
        {timeSlot.map((item, index) => (
          <View key={index} style={styles.timeOfDayContainer}>
            <Text style={styles.timeOfDayText}>{item.title}</Text>
            <View style={styles.timeButtonsContainer}>
              {chunk(item.slot, 3).map((row, rowIndex) => (
                <View key={rowIndex} style={styles.timeButtonRow}>
                  {row.map((time, idx) => {
                    const timeKey = convertTo24Hour(time);
                    const isAvailable = checkTimeSlot[timeKey] !== 0;
                    const isSelected = selectedTime === time;

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.timeButton,
                          !isAvailable && styles.unavailableTimeButton,
                          isSelected && styles.selectedTimeButton,
                        ]}
                        onPress={() => isAvailable && handleTimeSelect(time)}
                        disabled={!isAvailable}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            !isAvailable && styles.unavailableTimeText,
                            isSelected && styles.selectedTimeText,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {row.length < 3 &&
                    Array(3 - row.length)
                      .fill()
                      .map((_, i) => (
                        <View key={`empty-${i}`} style={styles.emptySlot} />
                      ))}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Helper function to split array into chunks
  const chunk = (array, size) => {
    const chunked = [];
    let index = 0;
    while (index < array.length) {
      chunked.push(array.slice(index, index + size));
      index += size;
    }
    return chunked;
  };

  // Format services for display
  const serviceTitle = services?.map(service => service.name || service.title).join(', ');

  // Navigation button states
  const currentMonthToday = today.getMonth();
  const nextToMonth = today.getMonth() + 1;
  const currentYearToday = today.getFullYear();
  const isPrevDisabled = currentMonth === currentMonthToday && currentYear === currentYearToday;
  const isNextDisabled = currentMonth === nextToMonth && currentYear === currentYearToday; // July

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: '#000' }} />
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <BookingStepHeader
        title={branch?.name ? branch.name.length > 25 ? `${branch.name.slice(0, 25)}...` : branch.name : ''}
        height={height * 0.14}
      />

      <StepHeader type="dateTime" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.calendarHeader}>Date</Text>
        <View style={styles.calendarContainer}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              style={[styles.monthNavigationButton, isPrevDisabled && styles.disabledNavigationButton]}
              disabled={isPrevDisabled}
            >
              <Ionicons name="chevron-back" size={24} color={isPrevDisabled ? '#ccc' : '#333'} />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
              {getMonthName(currentMonth)} {currentYear}
            </Text>
            <TouchableOpacity
              onPress={handleNextMonth}
              style={[styles.monthNavigationButton, isNextDisabled && styles.disabledNavigationButton]}
              disabled={isNextDisabled}
            >
              <Ionicons name="chevron-forward" size={24} color={isNextDisabled ? '#ccc' : '#333'} />
            </TouchableOpacity>
          </View>
          {renderWeekdays()}
          {renderDays()}
        </View>

        <Text style={styles.timeSlotsHeader}>Available Slots</Text>
        {renderTimeSlots()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>{staff?.full_name || staff?.name}</Text>
          <View
            style={styles.marqueeContainer}
            onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
          >
            <Animated.View
              style={[
                styles.marqueeTextContainer,
                { transform: [{ translateX }] },
              ]}
            >
              <Text
                numberOfLines={1}
                style={styles.footerServiceText}
                onLayout={(event) => setTextWidth(event.nativeEvent.layout.width)}
              >
                {serviceTitle}
              </Text>
            </Animated.View>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedDate || !selectedTime) && styles.disabledButton,
          ]}
          onPress={handleConfirm}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.confirmButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Login Modal */}
      <ConfirmModal
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        signIn={signIn}
        nextScreenConfirm={nextScreenConfirm}
      />
    </View>
  );
};

// Login Confirmation Modal
const ConfirmModal = ({ modalVisible, closeModal, signIn, nextScreenConfirm }) => {
  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Confirm
                </Text>

                <View style={styles.modalIconContainer}>
                  <View style={styles.modalIcon}>
                    <Image
                      resizeMode="contain"
                      style={styles.modalIconImage}
                      source={require('../assets/icons/ic_login_01.png')}
                    />
                  </View>
                </View>

                <Text style={styles.modalMessage}>
                  Please sign in to save your booking or continue as a guest.
                </Text>

                <View style={styles.modalButtonContainer}>
                  {/* Guest Button */}
                  <TouchableOpacity
                    style={styles.guestButton}
                    onPress={nextScreenConfirm}
                  >
                    <Text style={styles.guestButtonText}>Continue as Guest</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.signInButton}
                    onPress={signIn}
                  >
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Gray background like sample
    fontFamily: 'Nunito_400Regular', // Default font for container
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? height * 0.06 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000',
    height: height * 0.14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'ios' ? height * 0.05 : 25,
  },
  headerTitle: {
    fontSize: width * 0.05,
    color: '#fff',
    marginTop: -height * 0.03,
    textAlign: 'center',
    fontFamily: 'Nunito_800ExtraBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginTop: height * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendarHeader: {
    fontSize: width * 0.04,
    color: '#333',
    marginBottom: -height * 0.004,
    marginTop: height * 0.002,
    fontFamily: 'Nunito_700Bold',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  monthNavigationButton: {
    padding: 5,
  },
  disabledNavigationButton: {
    opacity: 0.3,
  },
  monthYearText: {
    fontSize: width * 0.04,
    color: '#333',
    fontFamily: 'Nunito_600SemiBold',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: height * 0.01,
  },
  weekdayText: {
    fontSize: width * 0.035,
    color: '#666',
    textAlign: 'center',
    width: width / 7 - 10,
    fontFamily: 'Nunito_400Regular',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayButton: {
    width: width / 7 - 10,
    height: width / 7 - 5,
    justifyContent: 'flex-start',
    padding: 3,
  },
  dayText: {
    fontSize: width * 0.028,
    color: '#333',
    marginTop: height * 0.003,
    fontFamily: 'Nunito_400Regular',
  },
  shopAvailabilityText: {
    fontSize: width * 0.025,
    color: '#666',
    marginTop: height * 0.002,
    paddingHorizontal: 2,
    maxWidth: width * 0.25,
    fontFamily: 'Nunito_300Light',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthDayText: {
    color: '#999',
    fontFamily: 'Nunito_300Light',
  },
  selectedDay: {
    backgroundColor: '#000',
  },
  selectedDayText: {
    color: '#fff',
    fontFamily: 'Nunito_500Medium',
  },
  todayDay: {
    borderWidth: 0,
    borderColor: '#000',
  },
  selectedTodayDay: {
    backgroundColor: '#000',
  },
  pastDay: {
    backgroundColor: '#C9C9C9',
  },
  pastDayText: {
    color: '#555',
    fontFamily: 'Nunito_400Regular',
  },
  pastDayBranchText: {
    display: 'none',
  },
  timeSlotsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginTop: height * 0.015,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeSlotsHeader: {
    fontSize: width * 0.04,
    color: '#333',
    marginTop: height * 0.02,
    fontFamily: 'Nunito_700Bold',
  },
  timeOfDayContainer: {
    marginBottom: height * 0.02,
  },
  timeOfDayText: {
    fontSize: width * 0.04,
    color: '#333',
    marginBottom: height * 0.01,
    fontFamily: 'Nunito_600SemiBold',
  },
  timeButtonsContainer: {
    width: '100%',
  },
  timeButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
  },
  timeButton: {
    paddingVertical: height * 0.01,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#333',
    width: (width - 80) / 3,
    alignItems: 'center',
    marginTop: 5,
  },
  timeButtonText: {
    fontSize: width * 0.03,
    color: '#333',
    fontFamily: 'Nunito_700Bold',
  },
  selectedTimeButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  selectedTimeText: {
    color: '#fff',
    fontFamily: 'Nunito_500Medium',
  },
  unavailableTimeButton: {
    backgroundColor: '#ddd',
    borderColor: '#ddd',
  },
  unavailableTimeText: {
    color: '#454545',
    textDecorationLine: 'line-through',
    fontFamily: 'Nunito_700Bold',
  },
  emptySlot: {
    width: (width - 60) / 3,
  },
  loadingText: {
    marginVertical: height * 0.02,
    fontFamily: 'Nunito_400Regular',
  },
  errorText: {
    fontSize: width * 0.04,
    color: '#ff0000',
    textAlign: 'center',
    marginVertical: height * 0.02,
    fontFamily: 'Nunito_600SemiBold',
  },
  footer: {
    backgroundColor: '#000',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? height * 0.04 : 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: height * 0.1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  footerInfo: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 10,
  },
  footerText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontFamily: 'Nunito_600SemiBold',
  },
  marqueeContainer: {
    width: width * 0.6,
    overflow: 'hidden',
    marginTop: height * 0.002,
  },
  marqueeTextContainer: {
    flexDirection: 'row',
  },
  footerServiceText: {
    color: '#aaa',
    fontSize: width * 0.035,
    fontFamily: 'Nunito_300Light',
  },
  confirmButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    minWidth: width * 0.25,
  },
  confirmButtonText: {
    color: '#000',
    fontSize: width * 0.04,
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',

  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    width : width * 0.9
  },
  modalTitle: {
    fontSize: width * 0.05,
    color: '#000',
    backgroundColor: '#f0f0f0',
    padding: 15,
    fontFamily: 'Nunito_700Bold',
  },
  modalIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modalIcon: {
    width: 80,
    height: 80,
  },
  modalIconImage: {
    width: '100%',
    height: '100%',
  },
  modalMessage: {
    fontSize: width * 0.045,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Nunito_700Bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  guestButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent:'center',
    marginHorizontal: 5,
      fontFamily: 'Nunito_700Bold',
  },
  signInButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent:'center',
    marginHorizontal: 5,
      fontFamily: 'Nunito_700Bold',
  },
  guestButtonText: {
    fontSize: width * 0.04,
    color: '#fff',
    fontFamily: 'Nunito_400Regular',
  },
  signInButtonText: {
    fontSize: width * 0.04,
    color: '#333',
    fontFamily: 'Nunito_400Regular',
  },
});

export default DateTime;