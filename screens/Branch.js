import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Pressable,
  RefreshControl,
  BackHandler,
  Dimensions
} from 'react-native';
import http from '../services/http';
import { Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Toast } from 'toastify-react-native';
import { useFocusEffect } from '@react-navigation/native';
import BookingStepHeader from './Components/BookingStepHeader';

const { height } = Dimensions.get("window");

// Skeleton Loading Component
const BranchSkeleton = () => {
  return (
    <View className="mb-4 bg-gray-100 rounded-xl overflow-hidden">
      <View style={{ height: height * 0.2 }} className="w-full bg-gray-200" />
      <View className="p-5">
        <View className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
      </View>
    </View>
  );
};

export default function Branch({ navigation, route }) {
  const {country_code = ''} = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(route.params?.selectedIndex || null);
  const [brabnchList, setBrabnchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  // Restore selection when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.preserveSelection) {
        setSelectedIndex(route.params.selectedIndex);
      }
    }, [route.params])
  );

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchData();
    }, 1000);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const end_point = country_code == 'kh' ? '/branch-list?country_id=36' : '/branch-list?country_id=238';
      const response = await http.get(end_point);
      if (response.data.status) {
        setBrabnchList(response.data.data);
      } else {
        setError('No branches available');
      }
    } catch (error) {
      setError('Failed to load branches');
      Toast.error('Failed to load branches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const selectBranch = (index) => {
    if (index === selectedIndex) {
      setSelectedIndex(null);
      return;
    }
    setSelectedIndex(index);
  };

  const nextScreen = () => {
    if (selectedIndex !== null) {
      navigation.navigate('Staff', {
        branch: brabnchList[selectedIndex],
        onGoBack: () => setSelectedIndex(selectedIndex),
        selectedIndex: selectedIndex,
      });
    } else {
      Toast.warn('Please select a branch!');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="bg-black" />
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <BookingStepHeader title="Choose Branch" height={height * 0.12}/>

      {/* Content */}
      {loading ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="p-4"
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {[...Array(6)].map((_, index) => (
            <BranchSkeleton key={`skeleton-${index}`} />
          ))}
        </ScrollView>
      ) : error || brabnchList.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-base text-gray-600 mb-4 text-center">
            {error || 'No branches available'}
          </Text>
          <Animatable.View animation="pulse" iterationCount="infinite" duration={1500}>
            <Pressable
              className="bg-black text-white text-center font-bold text-base px-6 py-3 rounded-lg shadow-lg"
              onPress={fetchData}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Text className="text-white text-center font-bold">Reload</Text>
            </Pressable>
          </Animatable.View>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="p-4"
          contentContainerStyle={{ paddingBottom: 110 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#000000']}
              tintColor="#000000"
            />
          }
        >
          {brabnchList?.map((branch, index) => (
            <Animatable.View
              key={`${branch.id}-${index}`}
              animation="fadeInUp"
              duration={800}
              delay={index * 100}
              useNativeDriver
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Pressable
                onPress={() => selectBranch(index)}
                className="bg-white rounded-xl overflow-hidden relative mb-4"
                style={{
                  transform: [{ scale: selectedIndex === index ? 0.98 : 1 }],
                }}
                android_ripple={{ color: '#f1f1f1' }}
              >
                <View style={{ height: height * 0.2 }} className="w-full">
                  <Image
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    source={{ uri: branch.branch_image }}
                  />
                </View>

                <View className="p-5">
                  <Text className="font-bold text-lg">{branch.name}</Text>
                </View>

                {selectedIndex === index && (
                  <Animatable.View
                    animation="pulse"
                    iterationCount="infinite"
                    duration={1500}
                    className="absolute w-full h-full flex justify-center items-center bg-black/40"
                  >
                    <Feather name="check" size={45} color="white" />
                  </Animatable.View>
                )}
              </Pressable>
            </Animatable.View>
          ))}
        </ScrollView>
      )}

      {/* Footer Button */}
      <Animatable.View
        animation="fadeInUp"
        duration={600}
        className="h-[100px] bg-black rounded-t-[20px] flex-row justify-center items-center px-5 absolute bottom-0 w-full"
      >
        <Pressable
          className="bg-white text-black text-center font-black text-[15px] p-4 rounded-lg shadow-lg w-full"
          onPress={nextScreen}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text className="text-center">Next</Text>
        </Pressable>
      </Animatable.View>
    </View>
  );
}