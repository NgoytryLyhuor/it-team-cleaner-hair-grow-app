import React, { useState, useContext } from 'react';
import { 
  RefreshControl, 
  Dimensions, 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  Pressable, 
  ScrollView, 
  Animated, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import Slider from './Components/Slider';
import IconGrid from './Components/IconGrid';
import Blog from './Components/Blog';
import BottomNavigation from './Components/BottomNavigation';
import InquiryModal from './Components/InquiryModal';
import SuccessfullyModal from './Components/SuccessfullyModal';
import SelectCountryModal from './Components/SelectCountryModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StorageContext } from '../contexts/StorageContext';
import { GlobalDataContext } from '../contexts/GlobalDataContext';
import CustomText from './Components/CustomText';

const { height } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { userDetail } = useContext(StorageContext);
  const { 
    dashboardDetail,
    successfullyModalVisible, 
    setSuccessfullyModalVisible, 
    appCountry,
    socialMedia
  } = useContext(GlobalDataContext);

  const [selectCountryModalVisible, setSelectCountryModalVisible] = useState(
    () => appCountry == null
  );

  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StatusBar backgroundColor="#000" barStyle="light-content" />

        {/* Header Section */}
        <View style={styles.header}>
          {userDetail ? (
            <View style={styles.userInfo}>
              <CustomText style={styles.userName}>
                {userDetail?.first_name} {userDetail?.last_name}
              </CustomText>
              <MaterialCommunityIcons 
                color="#ffb347" 
                size={16} 
                style={styles.waveIcon} 
                name='hand-wave' 
              />
            </View>
          ) : (
            <View style={styles.userInfo}>
              <CustomText style={styles.userName}>
                Hello, Guest
              </CustomText>
              <MaterialCommunityIcons 
                color="#ffb347" 
                size={16} 
                style={styles.waveIcon} 
                name='hand-wave' 
              />
            </View>
          )}

          <View style={styles.rightHeader}>
            <CustomText style={styles.countryText}>
              {appCountry?.name || null}
            </CustomText>
            <View>
              {!userDetail ? (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login', {})}
                  style={styles.signInButton}
                >
                  <CustomText style={styles.signInText}>
                    Sign In
                  </CustomText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Points')} 
                  style={styles.pointsContainer}
                >
                  <Image
                    source={require('../assets/icons/ic_crown.png')}
                    style={styles.crownIcon}
                  />
                  <CustomText style={styles.pointsText}>
                    {userDetail?.credit?.toFixed(2)}
                  </CustomText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <Slider sliderData={dashboardDetail?.slider} />

        {/* Book Appointment Button */}
        <Animated.View style={[styles.bookButtonContainer, { transform: [{ scale }] }]}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => navigation.navigate('Branch', {country_code: appCountry?.code})}
            style={styles.bookButton}
          >
            <Image 
              source={require('../assets/icons/calendar_add.png')} 
              style={styles.calendarIcon} 
            />
            <CustomText style={styles.bookButtonText}>
              Book Appointment
            </CustomText>
          </Pressable>
        </Animated.View>

        <IconGrid openModal={() => setModalVisible(true)} />
        <Blog />
      </ScrollView>

      <BottomNavigation page='Home' />

      <InquiryModal
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        socialMedia={socialMedia}
        appCountry={appCountry}
      />

      <SuccessfullyModal
        modalVisible={successfullyModalVisible}
        closeModal={() => setSuccessfullyModalVisible(false)}
      />

      <SelectCountryModal
        modalVisible={selectCountryModalVisible}
        closeModal={() => setSelectCountryModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    height: height * 0.14,
    backgroundColor: '#000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Nunito_800ExtraBold',
  },
  waveIcon: {
    marginLeft: 4,
  },
  rightHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
  countryText: {
    color: '#fff',
    fontSize: 18,
    marginRight: 8,
    fontFamily: 'Nunito_800ExtraBold',
  },
  signInButton: {
    padding: 4,
  },
  signInText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  crownIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  pointsText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
  },
  bookButtonContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookButton: {
    marginHorizontal: 20,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
  },
  calendarIcon: {
    width: 28,
    height: 28,
  },
  bookButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Nunito_900Black',
  },
});