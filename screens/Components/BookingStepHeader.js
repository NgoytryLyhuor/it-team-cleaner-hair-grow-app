import React from "react";
import { Pressable, Text , View} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';;

export default function BookingStepHeader({ title, height }) {

  const navigation = useNavigation();

  return (
    <View
      // animation="fadeInDown"
      // duration={400}
      style={{ height: height }}
      className=" bg-white"
    >
      <Animatable.View className=" bg-black rounded-b-[20px] flex-row justify-center items-center px-5 h-full">
        <Pressable
          className="absolute left-5"
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Icon name="arrow-back-ios" size={22} color="#fff" />
        </Pressable>
        <Text className="text-white font-extrabold text-[17px] text-center">
          {title}
        </Text>
      </Animatable.View>
    </View>
  );
}

