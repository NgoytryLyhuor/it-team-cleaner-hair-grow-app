import React, { useEffect, useState } from 'react';
import { 
  View, 
  Image, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiWordpress from '../../services/api_wordpress';

export default function Blog() {
  const [loading, setLoading] = useState(false);
  const [dashboardDetail, setDashboardDetail] = useState([]);
  const navigation = useNavigation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiWordpress.get('?page=api_app&method=blog');
      if (Array.isArray(response.data.blog)) {
        setDashboardDetail(response.data.blog);
      } else {
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      // console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const BlogItem = ({ item }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <TouchableOpacity
        className="w-[200px] bg-white rounded-2xl shadow-lg overflow-hidden mr-4"
        onPress={() => navigation.navigate('BlogDetail', { id: item.id })}
      >
        <Image
          className="w-full h-[120px] bg-gray-200"
          resizeMode="cover"
          source={
            item?.image && !imageError
              ? { uri: item.image }
              : { uri: 'https://via.placeholder.com/200x120?text=No+Image' }
          }
          onError={() => setImageError(true)}
        />
        <View className="p-3">
          <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-sm text-black text-center">
            {item?.header || 'No Title'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="px-5 py-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-xl text-black">Blog</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
          <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-blue-500 underline">View All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 5 }}
        >
          {dashboardDetail.map((blogItem) => (
            <BlogItem key={blogItem.id} item={blogItem} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}