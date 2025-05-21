import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Feather } from '@expo/vector-icons';

export default function AboutApp({ navigation }) {
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
              About App
            </Text>
          </View>

          {/* Settings List */}
          <View className="p-4 space-y-4">
            <SettingItem
              iconType="MaterialCommunityIcons"
              icon="shield-lock-outline"
              title="Privacy Policy"
              subtitle="Learn how we protect your data"
            />
            <SettingItem
              iconType="MaterialCommunityIcons"
              icon="file-document-outline"
              title="Terms & Conditions"
              subtitle="Review the terms of using our app"
            />
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

function SettingItem({ iconType = 'Feather', icon, title, subtitle, onPress }) {
  const IconComponent =
    iconType === 'Feather'
      ? Feather
      : iconType === 'MaterialCommunityIcons'
        ? MaterialCommunityIcons
        : Icon; // fallback to MaterialIcons

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white p-4 rounded-xl shadow border border-gray-100 mb-3"
    >
      <View className="flex-row space-x-4 items-center">
        <IconComponent name={icon} size={20} color="#000" className="mr-2" />
        <View className="flex-1">
          <Text className="font-semibold text-base">{title}</Text>
          {/* {subtitle && <Text className="text-sm text-gray-500">{subtitle}</Text>} */}
        </View>
      </View>
    </TouchableOpacity>
  );
}
