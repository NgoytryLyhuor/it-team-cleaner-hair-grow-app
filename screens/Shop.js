import React, { useEffect, useState, useCallback } from 'react';
import {
  Dimensions,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import BottomNavigation from './Components/BottomNavigation';
import apiWordpress from '../services/api_wordpress';

const { height } = Dimensions.get("window");

export default function Shop({ navigation }) {
  const [dashboardDetail, setDashboardDetail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setDashboardDetail([])
    try {
      const response = await apiWordpress.get('?page=api_app&method=product');
      if (Array.isArray(response.data.product)) {
        setDashboardDetail(response.data.product);
      } else {
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const renderSkeletonLoader = () => {
    const skeletonItems = [1, 2, 3, 4]; // 2 rows of 2 items
    return skeletonItems.reduce((rows, _, index) => {
      if (index % 2 === 0) {
        rows.push(skeletonItems.slice(index, index + 2));
      }
      return rows;
    }, []).map((pair, rowIndex) => (
      <View key={rowIndex} className="flex flex-row justify-between mb-4">
        {pair.map((_, i) => (
          <View key={i} className="w-[48%] bg-gray-200 rounded-xl overflow-hidden">
            <View className="w-full h-[200px] bg-gray-300 animate-pulse" />
            <View className="p-3">
              <View className="h-4 bg-gray-300 rounded w-3/4 mx-auto animate-pulse" />
            </View>
          </View>
        ))}
      </View>
    ));
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* Fixed Header */}
      <View
        className="z-10 bg-black rounded-b-[30px] flex-row justify-center items-center px-5 pb-5"
        style={{ height: height * 0.12, paddingTop: 25 }}
      >
        <Text className="text-white font-extrabold text-[17px] text-center">Shop</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: height * 0.1 }}
        
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000000']}
            tintColor="#000000"
          />
        }
      >
        <SafeAreaView className='pb-5'>

          {/* Products */}
          <View className="px-4 mt-5">
            {loading ? (
              renderSkeletonLoader()
            ) : dashboardDetail.length === 0 ? (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-gray-500 mb-4">No products found</Text>
                <TouchableOpacity
                  className="bg-black px-6 py-3 rounded-lg"
                  onPress={() => {
                    setLoading(true);
                    fetchData();
                  }}
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              dashboardDetail.reduce((rows, item, index) => {
                if (index % 2 === 0) {
                  rows.push(dashboardDetail.slice(index, index + 2));
                }
                return rows;
              }, []).map((pair, rowIndex) => (
                <View key={rowIndex} className="flex flex-row justify-between mb-4">
                  {pair.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      className="w-[48%] bg-white rounded-xl shadow-md overflow-hidden"
                      onPress={() => navigation.navigate('ProductDetail', { product: item })}
                    >
                      <Image
                        className="w-full h-[200px] bg-gray-100"
                        resizeMode="cover"
                        source={
                          item.image
                            ? { uri: item.image }
                            : require('../assets/icons/n_image.jpg')
                        }
                      />
                      <View className="p-3">
                        <Text className="text-center font-bold text-black">{item.text}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {pair.length === 1 && <View className="w-[48%]" />}
                </View>
              ))
            )}
          </View>
        </SafeAreaView>
      </ScrollView>

      <BottomNavigation page="Shop" />
    </View>
  );
}