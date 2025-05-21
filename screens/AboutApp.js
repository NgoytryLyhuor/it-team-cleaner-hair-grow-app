import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
              title="Privacy Policy"
              img={require('../assets/icons/ic_privacy_policy.png')}
            />
            <SettingItem
              title="Terms & Conditions"
              img={require('../assets/icons/ic_privacy_policy.png')}
            />
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

function SettingItem({title, img, onPress }) {

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white p-4 rounded-xl shadow border border-gray-100 mb-3"
    >
      <View className="flex-row space-x-4 items-center">
        <Image className=" w-5 h-5" source={img}/>
        <View className="flex-1 ml-2">
          <Text className="font-semibold text-base">{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
