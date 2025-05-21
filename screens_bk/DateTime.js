import React, { useState, useMemo, useEffect, useContext ,useCallback  } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image,
  Modal,
  Dimensions
} from 'react-native';
import StepHeader from './Components/StepHeader';
import { StorageContext } from '../contexts/StorageContext';
import { GlobalDataContext } from '../contexts/GlobalDataContext';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Toast } from 'toastify-react-native';
import BookingStepHeader from './Components/BookingStepHeader';
import { timeSlot } from '../constants/constants';

const { width , height } = Dimensions.get("window");

export default function DateTime({ navigation, route }) {

  const { branch, staff, services } = route.params;

  const [visibleMonth, setVisibleMonth] = useState(new Date().getMonth());
  const [visibleYear, setVisibleYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [checkTimeSlot, setCheckTimeSlot] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Access the context
  const { userDetail } = useContext(StorageContext);
  const { setCoupon } = useContext(GlobalDataContext);

  const current = new Date();

  // Format as YYYY-MM
  const minDate = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-01`;

  // Set maxDate to the last day of next month
  const nextMonthDate = new Date(current.getFullYear(), current.getMonth() + 2, 1);
  const maxDate = nextMonthDate.toISOString().split('T')[0];

  // Memoized today's date
  const today = useMemo(() => {
    const date = new Date();
    return {
      isoString: date.toISOString().split('T')[0],
      month: date.getMonth(),
      year: date.getFullYear()
    };
  }, []);

  // Event handlers
  const handleMonthChange = (month) => {
    setVisibleMonth(month.month - 1);
    setVisibleYear(month.year);
  };

  const handleDayPress = (day) => {
    setSelectedTime('');
    setSelectedDate(day.dateString);
  };

  // back from other screen set it to ''
  useFocusEffect(
    useCallback(() => {
      setCoupon('');
    }, [])
  );

  // fist load set it to ''
  useEffect(() => {
    setCoupon('');
  }, []);

  // When selectedDate changes, this effect runs
  useEffect(() => {
    if (selectedDate) {
      checkAvailability();
    }
  }, [selectedDate]);

  // Custom day component
  const renderDay = (dayProps) => {
    const { date, state } = dayProps;

    const currentDate = new Date(date.dateString);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const isSelected = date.dateString === selectedDate;
    const isVisibleMonth = currentMonth === visibleMonth && currentYear === visibleYear;
    const isPast = currentDate < new Date(today.isoString);
    const isPreviousMonth = date.month < today.month + 1;

    const disabled = ((isVisibleMonth && isPast) || isPreviousMonth || (visibleMonth + 2 === date.month) || state == 'disabled');

    // Determine styles
    const containerStyle = [
      styles.dayContainer,
      {
        backgroundColor: isSelected
          ? '#000'
          : isSelected
            ? '#000'
            : isVisibleMonth && isPast
              ? '#e5e7eb'
              : '#fff',
      },
      isPreviousMonth && { backgroundColor: '#fff' }
    ];

    const dayTextStyle = [
      styles.dayText,
      {
        color: state === 'disabled'
          ? '#d9e1e8'
          : (isSelected)
            ? '#fff'
            : '#2d4150',
        fontWeight: 'bold',
      }
    ];

    const eventTextStyle = [
      styles.eventText,
      {
        color: state === 'disabled'
          ? '#d9e1e8'
          : (isSelected)
            ? '#fff'
            : '#2d4150',
        display: ((isVisibleMonth && isPast) || isPreviousMonth || (visibleMonth + 2 === date.month))
          ? 'none'
          : 'flex',
      }
    ];

    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={() => handleDayPress({ dateString: date.dateString })}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text className="text-left" style={dayTextStyle}>
          {date.day.toString().padStart(2, '0')}
        </Text>
        <Text className="text-left" style={eventTextStyle} numberOfLines={2}>
          {branch?.name}
        </Text>
      </TouchableOpacity>
    );
  };

  function convertTo24Hour(time12) {
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
  }

  function checkAvailability() {
    setError(false)
    setLoading(true)
    // Convert IDs to "23,24,46"
    const serviceIds = services.map(service => service.id).join(',');
    const url = `https://demo-hairmake-grow.camboinfo.com/web-booking/?page=api&method=view&branch_id=${branch.id}&service_id=${serviceIds}&staff_id=${staff.id}&date=${selectedDate}`;

    axios.get(url)
      .then(response => {
        setLoading(false)
        setCheckTimeSlot(response.data)
        // console.log('Success:', response.data);
      })
      .catch(error => {
        setLoading(false)
        setError(true)
        // console.error('Error:', error);
      });
  }

  const nextScreen = () => {

    const time = selectedTime.split(" ")[0];

    if (time !== '') {

      if (userDetail?.id > 0) {
        nextScreenConfirm();
      }
      else {
        setModalVisible(true)
      }

    }
    else {
      Toast.warn('Please select time slot first!');
    }

    // console.log(postData);
  };

  const nextScreenConfirm = () => {

    setModalVisible(false);
    const time = selectedTime.split(" ")[0];
    // Convert IDs to "23,24,46"
    const serviceIds = services.map(service => service.id).join(',');

    const postData = {
      branch: branch,
      staff: staff,
      services: services,
      date: selectedDate,
      time: time,
      serviceIds: serviceIds
    };
    navigation.navigate('Detail', postData)
  }

  const signIn = () => {
    setModalVisible(false)
    navigation.navigate('Login', { action: 'dateTime' });
  }

  return (
    <View className="flex-1 pb-[100px]">
      <SafeAreaView className="bg-black"></SafeAreaView>

      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <BookingStepHeader title={branch?.name ? branch.name.length > 25 ? `${branch.name.slice(0, 25)}...` : branch.name : ''} height={height * 0.14}/>

      <StepHeader type="dateTime" />

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        <View className="py-4">
          <Text className="font-bold text-lg">Date</Text>
        </View>
        <View style={styles.container}>
          <Calendar
            minDate={minDate}
            maxDate={maxDate}
            hideExtraDays
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markingType={'custom'}
            dayComponent={renderDay}
            enableSwipeMonths={false}
          // displayLoadingIndicator={true}
          />
        </View>

        <View className="py-4">
          <Text className="font-bold text-lg">Available slots</Text>
        </View>

        <View className="bg-white rounded-lg p-4">
          {loading ? (
            <ActivityIndicator size={30} />
          ) : error ? (
            <View className="flex justify-center items-center p-5">
              <Text className="text-red-500">Something went wrong.</Text>
            </View>
          ) : (
            timeSlot.map((item, index) => (
              <View key={index} className="mb-4">
                <Text className="font-bold text-lg mb-2 px-1">
                  {item.title}
                </Text>
                <View className="flex-row flex-wrap">
                  {item.slot.map((value, idx) => {
                    const timeKey = convertTo24Hour(value);
                    const isAvailable = checkTimeSlot[timeKey] !== 0;
                    const isSelected = selectedTime === value;

                    let bgTimeClass = '';
                    if (isSelected) {
                      bgTimeClass = 'bg-black';
                    } else if (!isAvailable) {
                      bgTimeClass = 'bg-gray-200';
                    }

                    return (
                      <Pressable
                        key={idx}
                        disabled={!isAvailable}
                        className="w-1/3 px-1 mb-2"
                        onPress={() => setSelectedTime(value)}
                      >
                        <View className={`border-2 border-black/40 rounded-2xl ${bgTimeClass}`}>
                          <Text
                            className={`text-center py-2 text-sm font-bold ${isSelected ? 'text-white' : ''}`}
                            style={{
                              textDecorationLine: !isAvailable ? 'line-through' : 'none',
                            }}
                          >
                            {value}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>


      </ScrollView>

      <View className="h-[100px] bg-black rounded-t-[20px] flex-row justify-between items-center px-5 absolute bottom-0 w-full">
        <View className="flex-1">
          <Text className="text-white font-bold text-lg mb-2">{staff?.full_name}</Text>
          <Text numberOfLines={1} className="text-white font-bold pr-5 text-sm">
            {services.map(service => service.name).join(', ')}
          </Text>
        </View>
        <Pressable
          className="bg-white text-black text-center font-black text-[15px] py-4 rounded-lg shadow-lg"
          onPress={nextScreen}
          style={{ paddingHorizontal: 30 }}
        >
          <Text className="text-center">Next</Text>
        </Pressable>
      </View>

      <ConfirmModal
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        signIn={signIn}
        nextScreenConfirm={nextScreenConfirm}
      />
    </View>
  );
}

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
          <View className="flex-1 justify-center items-center bg-black/40 w-full">
            <TouchableWithoutFeedback>
              <View
                className="bg-white rounded-2xl overflow-hidden pb-5"
                style={{ width: width * 0.8 }}
              >

                <Text className="text-xl text-black font-extrabold bg-gray-100 p-5">
                  Confirm
                </Text>

                <View className="flex-row items-center justify-center py-5">

                  <View className="w-[80px] h-[80px] bg-gray-200 rounded-full overflow-hidden flex justify-center items-center p-5">
                    <Image
                      resizeMode="contain"
                      className="w-full h-full"
                      source={require('../assets/icons/ic_login_01.png')}
                    />
                  </View>
                </View>

                <Text className="py-3 px-5 text-center text-lg font-bold">
                  Please sign in to save your booking or continue as a guest.
                </Text>

                <View className="flex-row justify-between mt-5 w-full px-5 mb-2">
                  {/* No Button */}
                  <TouchableOpacity
                    className=" bg-black flex-1 border p-3 rounded-lg items-center justify-center"
                    style={{ marginRight: 5 }}
                    onPress={nextScreenConfirm}
                  >
                    <Text className="text-center text-white font-semibold">Continue as Guest</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 border p-3 rounded-lg items-center justify-center"
                    style={{ marginLeft: 5 }}
                    onPress={signIn}
                  >
                    <Text className="font-semibold">Sign In</Text>
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
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 10,
    backgroundColor: '#fff',
  },
  dayContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    overflow: 'hidden'
  },
  dayText: {
    width: '100%',
    paddingHorizontal: 8,
    textAlign: 'left',
    fontWeight: '300',
    verticalAlign: 'top'
  },
  eventText: {
    width: '100%',
    paddingHorizontal: 8,
    fontSize: 10,
    textAlign: 'left'
  }
});