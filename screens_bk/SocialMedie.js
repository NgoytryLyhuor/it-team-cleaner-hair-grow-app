import React, { useContext } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Feather } from '@expo/vector-icons';
import { GlobalDataContext } from '../contexts/GlobalDataContext';

export default function SocialMedie({ navigation }) {
  const { socialMedia } = useContext(GlobalDataContext);
  // console.log(socialMedia.facebook_link)
  
  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView className="pb-5">
          <StatusBar barStyle="light-content" backgroundColor="#000" />

          {/* Header */}
          <View className="h-[70px] bg-black rounded-b-[20px] flex-row justify-center items-center px-5">
            <Text
              className="absolute left-5"
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back-ios" size={22} color="#fff" />
            </Text>
            <Text className="text-white font-extrabold text-[17px] text-center">
              Social Medie
            </Text>
          </View>

          {/* Settings List */}
          <View className="p-4 space-y-4">
            <SettingItem
              iconType="Feather"
              icon="facebook"
              title="Facebook"
              subtitle="Connect or disconnect your Facebook account"
              url={socialMedia?.facebook_link}
            />
            <SettingItem
              iconType="Feather"
              icon="instagram"
              title="Instagram"
              subtitle="Manage Instagram integration"
              url={socialMedia?.instagram_link}
            />
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

function SettingItem({ iconType = 'Feather', icon, title, subtitle, url }) {
  const IconComponent =
    iconType === 'Feather'
      ? Feather
      : iconType === 'MaterialCommunityIcons'
      ? MaterialCommunityIcons
      : Icon;

  const handlePress = () => {
    console.log(url)
    if (url) {
      Linking.openURL(url).catch(err => {
        console.warn('Failed to open URL:', err);
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white p-4 rounded-xl shadow border border-gray-100 mb-3"
    >
      <View className="flex-row space-x-4 items-center">
        <IconComponent name={icon} size={20} color="#000" />
        <View className="flex-1 ml-2">
          <Text className="font-semibold text-base">{title}</Text>
          {subtitle && <Text className="text-sm text-gray-500">{subtitle}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}
