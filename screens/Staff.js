import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import http from '../services/http';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RadioButton } from 'react-native-paper';
import StepHeader from './Components/StepHeader';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';
import { Toast } from 'toastify-react-native';
import Loading from './Components/Loading';
import BookingStepHeader from './Components/BookingStepHeader';

const AnimatablePressable = Animatable.createAnimatableComponent(Pressable);
const { height } = Dimensions.get("window");

// Skeleton Loading Component for Staff
const StaffSkeleton = () => {
  return (
    <View className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 mb-3">
      <View className="flex-row justify-between items-center">
        <View className="flex-row space-x-4 items-center flex-1 gap-2">
          <View className="w-20 h-20 rounded-full bg-gray-200 mr-3" />
          <View className="flex-1">
            <View className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
            <View className="h-4 w-full bg-gray-200 rounded" />
          </View>
          <View className="w-6 h-6 rounded-full bg-gray-200" />
        </View>
      </View>
    </View>
  );
};

export default function Staff({ navigation, route }) {
  const { branch } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [value, setValue] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animRefs = useRef([]);

  useFocusEffect(
    React.useCallback(() => {
      fadeIn();
      return () => fadeOut();
    }, [])
  );

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animatePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/employee-list?branch_id=${branch?.id}`);
      if (response.data.status) {
        setEmployeeList(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load branches', error);
      Toast.error('Failed to load stylists');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const nextScreen = () => {
    if (value !== null) {
      const postData = {
        branch: branch,
        staff: employeeList.find((emp) => String(emp.id) === value)
      };
      navigation.navigate('Service', postData);
    } else {
      Toast.warn('Please select a stylist!');
      shakeAnimation();
    }
  };

  const shakeAnimation = () => {
    animRefs.current.forEach(ref => {
      if (ref) ref.shake(800);
    });
  };

  const handleSelectStylist = (id) => {
    setValue(String(id));
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  };

  return (
    <Animated.View style={{ flex: 1 }} className="bg-white">
      <SafeAreaView className="bg-black" />
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <BookingStepHeader title={branch?.name ? branch.name.length > 25 ? `${branch.name.slice(0, 25)}...` : branch.name : ''} height={height * 0.14} />

      <StepHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000000']}
            tintColor="#000000"
          />
        }
      >
        <View className="py-4 mb-2">
          <Text className="font-bold text-lg text-center">Choose Your Stylist</Text>
        </View>

        {loading ? (
          <View>
            {[...Array(5)].map((_, index) => (
              <StaffSkeleton key={`skeleton-${index}`} />
            ))}
          </View>
        ) : employeeList.length === 0 ? (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500">No stylists available</Text>
            <Pressable
              className="mt-4 bg-black px-6 py-3 rounded-lg"
              onPress={fetchData}
            >
              <Text className="text-white">Retry</Text>
            </Pressable>
          </View>
        ) : (
          <RadioButton.Group onValueChange={handleSelectStylist} value={value}>
            {employeeList?.map((stylist, index) => (
              <AnimatablePressable
                key={stylist.id}
                ref={el => animRefs.current[index] = el}
                animation="fadeInUp"
                duration={400}
                delay={index * 100}
                onPress={() => handleSelectStylist(stylist.id)}
                className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 mb-3"
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row space-x-4 items-center flex-1">
                    <Animatable.View
                      animation={value === String(stylist.id) ? "pulse" : undefined}
                      iterationCount="infinite"
                      duration={1500}
                    >
                      <Image
                        source={{ uri: stylist.profile_image }}
                        className="w-20 h-20 rounded-full bg-gray-200 mr-3 border-2"
                        style={{
                          borderColor: value === String(stylist.id) ? '#000' : 'transparent',
                          resizeMode: 'cover'
                        }}
                      />
                    </Animatable.View>
                    <View className="flex-1">
                      <Text className="font-semibold text-base text-gray">{stylist.full_name}</Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        {stylist.description}
                      </Text>
                    </View>
                    <RadioButton
                      color="#000"
                      uncheckedColor="#888"
                      value={String(stylist.id)}
                      status={value === String(stylist.id) ? 'checked' : 'unchecked'}
                    />
                  </View>
                </View>
              </AnimatablePressable>
            ))}
          </RadioButton.Group>
        )}
      </ScrollView>

      <Animatable.View
        animation="fadeInUp"
        duration={600}
        className="h-[100px] bg-black rounded-t-[20px] flex-row justify-center items-center px-5 absolute bottom-0 w-full"
      >
        <AnimatedPressable
          onPress={nextScreen}
          onPressIn={animatePressIn}
          onPressOut={animatePressOut}
          style={[{ transform: [{ scale: scaleAnim }] }]}
          className="bg-white text-black text-center font-black text-[15px] p-4 rounded-lg shadow-lg w-full"
        >
          <Text className="text-center font-bold">Next</Text>
        </AnimatedPressable>
      </Animatable.View>
    </Animated.View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);