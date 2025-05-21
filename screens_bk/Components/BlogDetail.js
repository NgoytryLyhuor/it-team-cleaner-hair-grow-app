import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import apiWordpress from '../../services/api_wordpress';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function BlogDetail({ route, navigation }) {
  const id = parseInt(route?.params?.id);
  const { width } = useWindowDimensions();

  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.warn('Blog ID is missing');
      setLoading(false);
      return;
    }

    const fetchBlogDetail = async () => {
      try {
        const response = await apiWordpress.get(`?page=api_app&method=blog_detail`);
        const blogArray = response.data.blog_detail;

        const blogPost = blogArray.find(item => item.id === id);

        if (blogPost) {
          setBlogData(blogPost);
        } else {
          console.warn('Blog post not found for ID:', id);
        }
      } catch (error) {
        console.error('Error fetching blog detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!blogData) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-black">Failed to load blog content.</Text>
      </View>
    );
  }

  const sanitizedHtml = `<div>${blogData.post_detail || '<p>No content.</p>'}</div>`;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="bg-black rounded-b-2xl">
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View className="h-[100px] w-full flex-row justify-center items-center px-5 relative">
          <TouchableOpacity className="absolute left-5" onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-ios" size={22} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-extrabold text-[17px] text-center">
            {blogData.header}
          </Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView className="p-4">
        {/* Image */}
        <Image
          className="w-full h-[200px] rounded-xl mb-4"
          source={
            blogData.image
              ? { uri: blogData.image }
              : require('../../assets/images/no_image.jpg')
          }
          resizeMode="cover"
        />

        {/* HTML Content */}
        <RenderHTML
          contentWidth={width - 32} // accounting for padding
          source={{ html: sanitizedHtml }}
          tagsStyles={{
            p: { fontSize: 16, color: '#374151', lineHeight: 24 },
            img: { borderRadius: 12, marginVertical: 10 },
          }}
        />
      </ScrollView>
    </View>
  );
}