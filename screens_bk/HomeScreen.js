import React, { useState, useContext } from 'react';
import { RefreshControl, Dimensions, View, StyleSheet, SafeAreaView, StatusBar, Pressable, ScrollView, Animated, Image, TouchableOpacity } from 'react-native';
import Slider from './Components/Slider'
import IconGrid from './Components/IconGrid'
import Blog from './Components/Blog'
import BottomNavigation from './Components/BottomNavigation'
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

  // Access the context
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

  const [scale] = useState(new Animated.Value(1)); // Initial scale is 1 (normal size)

  // Function to handle button press
  const handlePressIn = () => {
    // When button is pressed, scale down to 0.8
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true, // Enable native driver for performance
    }).start();
  };

  const handlePressOut = () => {
    // When button press is released, scale back to 1 (original size)
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
    <View className="flex-1 bg-white/10">
      <SafeAreaView className="bg-black"></SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 * 2 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StatusBar backgroundColor="#000" barStyle="light-content" />

        <View style={{height:height * 0.14}} className=" bg-black rounded-b-[30px] flex-row justify-between items-center px-5 pb-5 pt-4">
          {
            userDetail ? (
              <View className="flex-row items-center">
                <CustomText className="text-white text-[17px]" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
                  {userDetail?.first_name} {userDetail?.last_name}
                </CustomText>
                <MaterialCommunityIcons color="#ffb347" size={16} className="ml-1" name='hand-wave' />
              </View>
            ) : (
              <View className="flex-row items-center">
                <CustomText className="text-white text-[17px]" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
                  Hello, Guast
                </CustomText>
                <MaterialCommunityIcons color="#ffb347" size={16} className="ml-1" name='hand-wave' />
              </View>
            )
          }

          <View className="flex-row justify-end items-center flex-1">
            <CustomText className="text-white text-lg mr-2" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
              {appCountry?.name || null}
            </CustomText>
            <View>
              {
                !userDetail ? (
                  <TouchableOpacity onPress={() => navigation.navigate('Login', {})} className="">
                    <CustomText className="text-white text-lg" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
                      Sign In
                    </CustomText>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => navigation.navigate('Points')} className="flex-row justify-center items-center gap-2">
                    <Image
                      source={require('../assets/icons/ic_crown.png')}
                      style={styles.crownIcon}
                    />
                    <CustomText className="text-white text-lg" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
                      {userDetail?.credit?.toFixed(2)}
                    </CustomText>
                  </TouchableOpacity>
                )
              }
            </View>
          </View>
        </View>

        <Slider sliderData={dashboardDetail?.slider} />

        <Animated.View className="w-full shadow-lg" style={{ transform: [{ scale }] }}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => navigation.navigate('Branch', {country_code : appCountry?.code})}
            className="mx-5 mt-[30px] flex-row items-center justify-center bg-black rounded-lg p-4"
          >
            <Image className="w-7 h-7" source={require('../assets/icons/calendar_add.png')} />
            <CustomText className="text-white text-center text-[16px] ml-2" style={{ fontFamily: 'Nunito_900Black' }}>
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
  crownIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
});