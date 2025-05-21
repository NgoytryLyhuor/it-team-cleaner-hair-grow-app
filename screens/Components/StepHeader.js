import React from "react";
import { View, Text } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function StepHeader({ type = 'staff' }) {
  return (
    <View style={{ marginTop: -20 }} className="px-4">
      <View className="rounded-xl shadow-md p-4 py-5 bg-white">
        {/* Stepper Container */}
        <View className="flex-row justify-between items-center">
          {/* Step 1: Staff (Active) */}
          <View className="items-center">
            <View
              style={{
                backgroundColor: (type === 'dateTime' || type === 'service') ? '#22c55e' : '#d1d5db',
                height: 13,
                width: 13,
              }}
              className="rounded-full mb-1 flex justify-center items-center"
            >
              <Icon
                style={{ display: (type === 'dateTime' || type === 'service') ? 'flex' : 'none' }}
                name="check"
                size={12}
                color="#fff"
              />
            </View>
            <Text className="text-xs font-medium">Staff</Text>
          </View>

          {/* Divider */}
          <View
            style={{ backgroundColor: (type === 'dateTime' || type === 'service') ? '#22c55e' : '#d1d5db' }}
            className="flex-1 h-0.5 mx-2"
          />

          {/* Step 2: Services */}
          <View className="items-center">
            <View
              style={{
                backgroundColor: type === 'dateTime' ? '#22c55e' : '#d1d5db', height: 13,
                width: 13
              }}
              className="rounded-full mb-1 flex justify-center items-center"
            >
              <Icon
                style={{ display: type === 'dateTime' ? 'flex' : 'none' }}
                name="check"
                size={12}
                color="#fff"
              />
            </View>
            <Text className="text-xs text-gray-500">Services</Text>
          </View>

          {/* Divider */}
          <View
            style={{ backgroundColor: type === 'dateTime' ? '#22c55e' : '#d1d5db' }}
            className="flex-1 h-0.5 mx-2"
          />

          {/* Step 3: Date & Time */}
          <View className="items-center">
            <View style={{
              backgroundColor: '#d1d5db', height: 13,
              width: 13
            }} className="rounded-full mb-1" />
            <Text className="text-xs text-gray-500">Date & Time</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
