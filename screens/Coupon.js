import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
  Pressable,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StorageContext } from '../contexts/StorageContext';
import { GlobalDataContext } from '../contexts/GlobalDataContext';
import http from '../services/http';
import CustomText from './Components/CustomText';
import { format, parseISO } from 'date-fns';
import * as Animatable from 'react-native-animatable';
import { RadioButton } from 'react-native-paper';

const { width, height } = Dimensions.get('window');
const AnimatedPressable = Animatable.createAnimatableComponent(Pressable);

const SkeletonLoader = ({ width, height, style }) => (
  <View className={`rounded bg-gray-200 overflow-hidden ${style}`} style={{ width, height }}>
    <View className="flex-1 bg-gray-100" />
  </View>
);

const CouponScreen = ({ navigation, route }) => {
  const { action = '' } = route.params || {};
  const insets = useSafeAreaInsets();
  const [showCouponDetails, setShowCouponDetails] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { userDetail } = useContext(StorageContext);
  const { setCoupon } = useContext(GlobalDataContext);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (!userDetail) {
      navigation.replace('Login');
      return;
    }
  }, [userDetail, navigation]);

  useEffect(() => {
    fetchCoupons();
  }, [userDetail]);

  const fetchCoupons = async () => {
    if (!userDetail) return;
    try {
      if (!refreshing) setIsLoading(true);
      const response = await http.get('/coupons');
      const transformed = response.data.data.map((coupon) => ({
        id: coupon.id.toString(),
        title: coupon.name,
        validUntil: format(parseISO(coupon.valid_until), 'MMM dd, yyyy'),
        discountCode: coupon.code,
        description: coupon.description,
      }));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCoupons(transformed);
      setError(null);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoupons();
  };

  const openCouponDetails = (coupon) => {
    setSelectedCoupon(coupon);
    setShowCouponDetails(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeCouponDetails = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowCouponDetails(false);
      setSelectedCoupon(null);
    });
  };

  const apply = () => {
    const selected = coupons.find((coupon) => String(coupon.id) === value);
    if (selected) setCoupon(selected);
    navigation.goBack();
  };

  const renderSkeletonItem = () => (
    <View className="flex-row bg-white p-4 mx-4 rounded-lg">
      <SkeletonLoader width={40} height={40} style="rounded-lg mr-4" />
      <View className="flex-1">
        <SkeletonLoader width="70%" height={18} style="mb-2" />
        <SkeletonLoader width="50%" height={14} style="mb-2" />
        <SkeletonLoader width="30%" height={14} />
      </View>
    </View>
  );

  const handleSelectCoupon = (id) => {
    setValue(String(id));
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  const renderCouponItem = ({ item }) => (
    <Pressable
      onPress={() => handleSelectCoupon(item.id)}
      className="flex-row bg-white p-4 mx-4 mb-3 rounded-xl items-center shadow-sm"
    >
      <View className="w-10 h-10 bg-[#FFD4D4] rounded-lg justify-center items-center mr-4">
        <Image
          source={require('../assets/icons/coupon.png')}
          className="w-5 h-5"
          resizeMode="cover"
        />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <CustomText className="text-base text-gray-800 font-extrabold flex-1">
            {item.title}
          </CustomText>
        </View>
        <CustomText className="text-xs text-gray-600 mb-1">
          Valid until {item.validUntil}
        </CustomText>
        <TouchableOpacity onPress={() => openCouponDetails(item)}>
          <CustomText className="text-sm text-gray-800 underline font-bold">Details</CustomText>
        </TouchableOpacity>
      </View>
      {action !== '' && (
        <RadioButton
          color="#000"
          uncheckedColor="#888"
          value={String(item.id)}
          status={String(value) === String(item.id) ? 'checked' : 'unchecked'}
        />
      )}
    </Pressable>
  );

  const animatePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View
        className="flex-row items-center px-5 pb-5 pt-4 bg-black rounded-b-[17px] z-10"
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : 10 , height : height * 0.15 }}
      >
        <TouchableOpacity className="w-10 h-10 justify-center mt-[27px]" onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <CustomText className="flex-1 text-white text-center mt-5 text-lg font-extrabold">Coupon</CustomText>
        <View className="w-7" />
      </View>

      {/* Content */}
      <View className="flex-1 bg-gray-100">
        {isLoading ? (
          <FlatList
            data={[...Array(10)]}
            renderItem={renderSkeletonItem}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ paddingVertical: 15 }}
            ItemSeparatorComponent={() => <View className="h-4" />}
          />
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <CustomText className="text-base text-red-500 font-normal">{error}</CustomText>
          </View>
        ) : coupons.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Image
              source={require('../assets/icons/empty_lottie.gif')}
              className="w-[140px] h-[140px] mb-4 mt-[-40px] opacity-70"
            />
            <CustomText className="text-base text-gray-500 font-normal">No Coupons Available</CustomText>
          </View>
        ) : (
          <FlatList
            data={coupons}
            renderItem={renderCouponItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 15 }}
            ItemSeparatorComponent={() => <View className="h-2" />}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>

      {/* Coupon Detail Modal */}
      {showCouponDetails && selectedCoupon && (
        <TouchableWithoutFeedback onPress={closeCouponDetails}>
          <Animated.View className="absolute inset-0 bg-black/50 justify-end" style={{ opacity: fadeAnim }}>
            <TouchableWithoutFeedback>
              <Animated.View
                className="bg-[#FFF5F5] rounded-t-2xl px-5 pt-5 pb-10"
                style={[{ transform: [{ translateY: slideAnim }], maxHeight: height * 0.34 }]}
              >
                <View className="flex-row justify-between items-center pb-4 border-b border-gray-200">
                  <CustomText className="text-lg text-gray-800 font-extrabold">{selectedCoupon.title}</CustomText>
                  <TouchableOpacity onPress={closeCouponDetails}>
                    <Ionicons name="close-outline" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <View className="pt-5">
                  <CustomText className="text-base text-gray-800 mb-0.5 font-extrabold">{selectedCoupon.title}</CustomText>
                  <View className="mb-4">
                    <CustomText className="text-sm text-gray-500 font-normal">
                      Discount Code{' '}
                      <CustomText className="text-sm text-gray-800 font-extrabold">{selectedCoupon.discountCode}</CustomText>
                    </CustomText>
                  </View>
                  <View className="mb-4">
                    <CustomText className="text-sm text-gray-500 font-normal">
                      Valid until{' '}
                      <CustomText className="text-sm text-gray-800 font-extrabold">{selectedCoupon.validUntil}</CustomText>
                    </CustomText>
                  </View>
                  <CustomText className="text-sm text-gray-800 mb-12 font-normal">{selectedCoupon.description}</CustomText>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      )}

      {/* Footer Button */}
      <Animatable.View
        animation="fadeInUp"
        duration={600}
        className="h-[100px] bg-transparent rounded-t-2xl flex-row justify-center items-center px-5 absolute bottom-0 w-full"
        style={{ display: action !== '' ? '' : 'none' }}
      >
        <AnimatedPressable
          onPress={apply}
          onPressIn={animatePressIn}
          onPressOut={animatePressOut}
          style={[{ transform: [{ scale: scaleAnim }] }]}
          className="bg-black text-white text-center font-bold text-base p-4 rounded-lg shadow-lg w-full"
        >
          <Text className="text-center font-bold text-white">Next</Text>
        </AnimatedPressable>
      </Animatable.View>
    </View>
  );
};

export default CouponScreen;
