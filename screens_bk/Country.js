import React, { useContext } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { countryList } from '../constants/constants'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalDataContext } from '../contexts/GlobalDataContext'

const { height } = Dimensions.get('window');

export default function Country({ navigation }) {

  const { appCountry, setAppCountry } = useContext(GlobalDataContext);

  const setCountry = async (country) => {
    try {
      // Save to storage
      await AsyncStorage.setItem('country', JSON.stringify(country));
      setAppCountry(country);
      navigation.goBack();
    } catch (error) {
      console.error('Error setting country:', error);
    }
  };

  function CountryItem({ icon, title, country }) {
    
    return (
      <TouchableOpacity
        onPress={() => setCountry(country)}
        className="bg-white p-4 rounded-xl shadow border border-gray-100 mb-3"
      >
        <View className="flex-row space-x-4 items-center">
          <Image resizeMode='contain' className="w-5 h-5" source={icon} />
          <View className="flex-1 ml-2 flex-row justify-between items-center">
            <Text className="font-semibold text-base">{title}</Text>
            <MaterialCommunityIcons style={{display : appCountry.code === country.code ? '' : 'none'}} name="check" size={22} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView className="pb-5">
          <StatusBar barStyle="light-content" backgroundColor="#000" />

          {/* Header */}
          <View style={{ height: height * 0.11 }} className=" bg-black rounded-b-[20px] flex-row justify-center items-center px-5">
            <Text
              className="absolute left-5"
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back-ios" size={22} color="#fff" />
            </Text>
            <Text className="text-white font-extrabold text-[17px] text-center">
              Country
            </Text>
          </View>

          {/* Settings List */}
          <View className="p-4 space-y-4">
            {
              countryList.map((country) => {
                return (
                  <CountryItem
                    key={country.name}
                    icon={country.icon}
                    title={country.name}
                    country={country}
                  />
                )
              })
            }
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
