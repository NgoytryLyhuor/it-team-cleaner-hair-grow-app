import React from 'react';
import { View, Text, Image, Dimensions, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const boxSize = (screenWidth - 70) / 3;

const dashboard_menu_coupon = require('../../assets/icons/dashboard_menu_coupon.png');
const dashboard_menu_referral = require('../../assets/icons/dashboard_menu_referral.png');
const dashboard_menu_points = require('../../assets/icons/dashboard_menu_points.png');
const dashboard_menu_fbecsite = require('../../assets/icons/dashboard_menu_fbecsite.png');
const dashboard_menu_inquiry = require('../../assets/icons/dashboard_menu_inquiry.png');
const dashboard_menu_notifications = require('../../assets/icons/dashboard_menu_notifications.png');

const menuItems = [
  { id: '1', title: 'Points', icon: 'star', image: dashboard_menu_points, action: 'Points' },
  { id: '2', title: 'Referral', icon: 'envelope', image: dashboard_menu_referral, action: 'Referral' },
  { id: '3', title: 'Coupon', icon: 'gift', image: dashboard_menu_coupon, action: 'Coupon' },
  { id: '4', title: 'Product', icon: 'store', image: dashboard_menu_fbecsite, action: 'Shop' },
  { id: '5', title: 'Inquiry', icon: 'comments', image: dashboard_menu_inquiry, action: 'Inquiry' },
  { id: '6', title: 'Notifications', icon: 'bell', image: dashboard_menu_notifications, action: 'Notifications' }
];

const IconGrid = ({ openModal }) => {

  const navigation = useNavigation();

  return (
    <View className="px-5 pt-5 height-[50px]">
      <View className="flex-row flex-wrap justify-between">
        {menuItems.map((item) => (
          <Pressable
            onPress={
              item.action === 'Inquiry'
                ? () => openModal()
                : () => navigation.navigate(item.action, {})
            }
            key={item.id}
            className="shadow mb-4 bg-white rounded-xl justify-center items-center border border-gray-100"
            style={{
              width: boxSize,
              height: 100,
            }}
          >
            <Image className="w-12 h-12 mb-1" source={item.image} />
            <Text className="text-[14px] font-medium">{item.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default IconGrid;
